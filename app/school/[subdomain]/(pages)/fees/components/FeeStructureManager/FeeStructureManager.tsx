'use client'

import { useEffect, useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FeeStructureManagerProps, 
  FeeItemToUpdate, 
  FeeStructureToAssign, 
  StructureToDelete 
} from './types'
import { Header } from './Header'
import { FeeStructuresTab } from './FeeStructuresTab'
import { GradeAssignmentsTab } from './GradeAssignmentsTab'
import { InvoiceGenerationTab } from './InvoiceGenerationTab'
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog'
import { UpdateFeeStructureItemModal } from '../UpdateFeeStructureItemModal'
import { AssignFeeStructureModal } from '../AssignFeeStructureModal'
import { FeeStructure } from '../../types'
import { mockFeeStructures } from '../../data/mockData'
import { useGraphQLFeeStructures } from '../../hooks/useGraphQLFeeStructures'
import { useGradeData } from '../../hooks/useGradeData'

export const FeeStructureManager = ({
  onCreateNew,
  onEdit,
  onGenerateInvoices,
  onAssignToGrade,
  onDelete
}: FeeStructureManagerProps) => {
  const [selectedTab, setSelectedTab] = useState('structures')
  // Only use mock data when GraphQL data is not available
  const [fallbackFeeStructures] = useState<FeeStructure[]>(mockFeeStructures)
  
  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [structureToDelete, setStructureToDelete] = useState<StructureToDelete | null>(null)
  
  // Fee structure item update state
  const [isUpdateItemModalOpen, setIsUpdateItemModalOpen] = useState(false)
  const [feeItemToUpdate, setFeeItemToUpdate] = useState<FeeItemToUpdate | null>(null)
  
  // Fee structure assignment state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [feeStructureToAssign, setFeeStructureToAssign] = useState<FeeStructureToAssign | null>(null)
  
  // Get grade data with fallback mechanism
  const { 
    grades, 
    isLoading: isLoadingGrades, 
    error: gradesError, 
    usedFallback: usedGradesFallback,
    fetchGradeData
  } = useGradeData()

  // Use the GraphQL hook to fetch fee structures
  const { structures, isLoading, error, lastFetchTime, fetchFeeStructures } = useGraphQLFeeStructures()
  
  // Track data state for UI feedback
  const [dataState, setDataState] = useState<'loading' | 'success' | 'error' | 'empty'>('loading')
  
  // Function to refresh all data
  const refreshAllData = async () => {
    console.log('Refreshing all data...')
    const [feeStructuresResult, gradesResult] = await Promise.allSettled([
      fetchFeeStructures(),
      fetchGradeData()
    ])
    
    if (feeStructuresResult.status === 'rejected') {
      console.error('Failed to refresh fee structures:', feeStructuresResult.reason)
    }
    
    if (gradesResult.status === 'rejected') {
      console.error('Failed to refresh grades:', gradesResult.reason)
    }
    
    return {
      feeStructures: feeStructuresResult.status === 'fulfilled' ? feeStructuresResult.value : null,
      grades: gradesResult.status === 'fulfilled' ? gradesResult.value : null
    }
  }

  // Log GraphQL response data for debugging
  useEffect(() => {
    if (isLoading) {
      setDataState('loading')
    } else if (error) {
      setDataState('error')
      console.error('GraphQL fee structures error:', error)
    } else if (structures && structures.length > 0) {
      setDataState('success')
      console.log('GraphQL fee structures loaded:', structures.length, 'structures')
    } else {
      setDataState('empty')
      console.log('GraphQL returned empty fee structures array')
    }
  }, [structures, isLoading, error])

  // Fetch data when component mounts
  useEffect(() => {
    console.log('Initiating GraphQL fee structures fetch')
    fetchFeeStructures()
      .then(data => {
        if (data && data.length > 0) {
          console.log('GraphQL fetch successful, received', data.length, 'structures')
        } else {
          console.log('GraphQL fetch successful but no structures received')
        }
      })
      .catch(err => console.error('GraphQL fetch error:', err))
  }, [])

  // Process GraphQL structures for display
  const graphQLStructures = useMemo(() => {
    if (!structures || structures.length === 0) return []

    return structures.map(structure => {
      // Group items by bucket but preserve the first item ID for editing
      const bucketMap = new Map<string, { 
        id: string; 
        name: string; 
        totalAmount: number; 
        isOptional: boolean; 
        firstItemId?: string; // Store the first item ID for editing
        feeBucketId: string; 
      }>();
      
      // Process items if they exist
      if (structure.items && structure.items.length > 0) {
        structure.items.forEach(item => {
          const bucketKey = item.feeBucket.id;
          const existingBucket = bucketMap.get(bucketKey);
          
          if (existingBucket) {
            existingBucket.totalAmount += item.amount;
            // Keep isOptional=false if any item is mandatory
            existingBucket.isOptional = existingBucket.isOptional && !item.isMandatory;
          } else {
            bucketMap.set(bucketKey, {
              id: item.feeBucket.id,
              name: item.feeBucket.name,
              totalAmount: item.amount,
              isOptional: !item.isMandatory,
              firstItemId: item.id, // Store the first item's ID for editing
              feeBucketId: item.feeBucket.id,
            });
          }
        });
      }
      
      return {
        structureId: structure.id,
        structureName: structure.name,
        academicYear: structure.academicYear?.name || 'N/A',
        academicYearId: structure.academicYear?.id || '',
        termName: structure.terms && structure.terms.length > 0 ? structure.terms[0].name : 'N/A',
        termId: structure.terms && structure.terms.length > 0 ? structure.terms[0].id : '',
        terms: structure.terms || [],
        gradeLevels: structure.gradeLevels || [],
        buckets: Array.from(bucketMap.values()),
        isActive: structure.isActive,
        createdAt: structure.createdAt,
        updatedAt: structure.updatedAt
      };
    });
  }, [structures])

  const getAssignedGrades = (feeStructureId: string) => {
    return grades.filter(grade => grade.feeStructureId === feeStructureId)
  }

  const getTotalStudents = (feeStructureId: string) => {
    return getAssignedGrades(feeStructureId).reduce((sum, grade) => sum + grade.studentCount, 0)
  }
  
  // Handle opening the update fee structure item modal
  const handleUpdateFeeItem = (itemId: string, amount: number, isMandatory: boolean, bucketName: string, feeStructureName: string, bucketId?: string) => {
    console.log('HandleUpdateFeeItem called with:', { itemId, amount, isMandatory, bucketName, feeStructureName, bucketId })
    
    setFeeItemToUpdate({
      id: itemId,
      amount,
      isMandatory,
      feeBucket: { id: bucketId || '', name: bucketName },
      feeStructure: { id: '', name: feeStructureName }
    })
    setIsUpdateItemModalOpen(true)
  }
  
  // Handle fee structure item update success
  const handleFeeItemUpdateSuccess = (updatedItem: any) => {
    // Refresh fee structures to show updated data
    fetchFeeStructures()
      .then(() => {
        // Show success toast or other UI feedback
        console.log('Fee structure item updated successfully:', updatedItem)
      })
      .catch(err => {
        console.error('Failed to refresh fee structures after update:', err)
      })
  }
  
  // Handle opening the assign fee structure modal
  const handleAssignToGrade = (feeStructureId: string, name: string, academicYear?: string, academicYearId?: string, termId?: string) => {
    setFeeStructureToAssign({
      id: feeStructureId,
      name,
      academicYear,
      academicYearId,
      termId,
      isActive: true
    })
    setIsAssignModalOpen(true)
  }
  
  // Handle fee structure assignment success
  const handleAssignmentSuccess = (assignmentResult: any) => {
    // Refresh data to show updated assignments
    Promise.all([
      fetchFeeStructures(),
      fetchGradeData()
    ])
      .then(() => {
        console.log('Fee structure assigned successfully:', assignmentResult)
      })
      .catch(err => {
        console.error('Failed to refresh data after assignment:', err)
      })
  }

  // Handle delete confirmation
  const handleDeleteConfirmation = (id: string, name: string) => {
    setStructureToDelete({ id, name })
    setIsDeleteDialogOpen(true)
  }

  // Debug data function
  const handleDebugData = () => {
    console.log('Current GraphQL Fee Structures:', structures)
    console.log('Processed Fee Structures:', graphQLStructures)
  }

  return (
    <div className="space-y-6">
      {/* Header Component */}
      <Header 
        onRefreshAll={refreshAllData}
        onDebugData={handleDebugData}
      />

      {/* Tab Navigation */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="structures">Fee Structures...</TabsTrigger>
          <TabsTrigger value="grades">Grade Assignments</TabsTrigger>
          <TabsTrigger value="invoices">Invoice Generation</TabsTrigger>
        </TabsList>

        {/* Fee Structures Tab Content */}
        <TabsContent value="structures" className="space-y-4">
          <FeeStructuresTab
            isLoading={isLoading}
            error={error}
            structures={structures}
            graphQLStructures={graphQLStructures}
            fallbackFeeStructures={fallbackFeeStructures}
            onEdit={onEdit}
            onAssignToGrade={handleAssignToGrade}
            onGenerateInvoices={onGenerateInvoices}
            onDelete={handleDeleteConfirmation}
            onUpdateFeeItem={handleUpdateFeeItem}
            onCreateNew={onCreateNew}
            fetchFeeStructures={fetchFeeStructures}
            getAssignedGrades={getAssignedGrades}
            getTotalStudents={getTotalStudents}
          />
        </TabsContent>

        {/* Grade Assignments Tab Content */}
        <TabsContent value="grades" className="space-y-4">
          <GradeAssignmentsTab
            isLoadingGrades={isLoadingGrades}
            gradesError={gradesError}
            grades={grades}
            usedGradesFallback={usedGradesFallback}
            structures={structures}
            fallbackFeeStructures={fallbackFeeStructures}
            onAssignToGrade={onAssignToGrade}
          />
        </TabsContent>

        {/* Invoice Generation Tab Content */}
        <TabsContent value="invoices" className="space-y-4">
          <InvoiceGenerationTab
            fallbackFeeStructures={fallbackFeeStructures}
            getTotalStudents={getTotalStudents}
            getAssignedGrades={getAssignedGrades}
            onGenerateInvoices={onGenerateInvoices}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        structureToDelete={structureToDelete}
        onConfirmDelete={(id) => {
          if (onDelete) {
            onDelete(id)
          }
        }}
      />
      
      {/* Update Fee Structure Item Modal */}
      <UpdateFeeStructureItemModal
        isOpen={isUpdateItemModalOpen}
        onClose={() => setIsUpdateItemModalOpen(false)}
        feeStructureItem={feeItemToUpdate}
        onSuccess={handleFeeItemUpdateSuccess}
      />
      
      {/* Assign Fee Structure to Grades Modal */}
      <AssignFeeStructureModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        feeStructure={feeStructureToAssign}
        availableGrades={grades}
        onSuccess={handleAssignmentSuccess}
      />
    </div>
  )
}
