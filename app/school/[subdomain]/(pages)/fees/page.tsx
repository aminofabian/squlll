'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Download } from 'lucide-react'

// Import modular components and hooks
import { StudentSearchBar } from './components/StudentSearchBar'
import { OverviewStatsCards } from './components/OverviewStatsCards'
import { FiltersSection } from './components/FiltersSection'
import { FeesDataTable } from './components/FeesDataTable'
import { StudentInvoicesTable } from './components/StudentInvoicesTable'
import { FeeStructureDrawer } from './components/FeeStructureDrawer'
import RecordPaymentDrawer from './components/RecordPaymentDrawer'
import StudentPayments from './components/StudentPayments'
import { FeeStructureManager } from './components/FeeStructureManager'
import { BulkInvoiceGenerator } from './components/BulkInvoiceGenerator'
import { FeeSummaryCard } from './components/FeeSummaryCard'
import NewInvoiceDrawer from './components/NewInvoiceDrawer'
import { StudentDetailsDrawer } from './components/StudentDetailsDrawer'
import { WorkflowGuidance } from './components/WorkflowGuidance'
import { FeesActionDashboard } from './components/FeesActionDashboard'
import { FeeStructuresTab } from './components/FeeStructureManager/FeeStructuresTab'
import { AssignFeeStructureModal } from './components/AssignFeeStructureModal'
import { useFeesData } from './hooks/useFeesData'
import { useFormHandlers } from './hooks/useFormHandlers'
import { useFeeStructures } from './hooks/useFeeStructures'
import { useGraphQLFeeStructures, UpdateFeeStructureInput } from './hooks/useGraphQLFeeStructures'
import { useGradeData } from './hooks/useGradeData'
import { useStudentSummary } from './hooks/useStudentSummary'
import { useStudentDetailSummary } from '@/lib/hooks/useStudentDetailSummary'
import { useAllStudentsSummary } from './hooks/useAllStudentsSummary'
import { FeeInvoice, FeeStructure, FeeStructureForm, BulkInvoiceGeneration, StudentSummaryFromAPI } from './types'

// Helper function for status colors
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    case 'partial':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function FeesPage() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'structures' | 'invoices'>('dashboard')
  const [showFeeStructuresInDashboard, setShowFeeStructuresInDashboard] = useState(false)
  const [showInvoicesInDashboard, setShowInvoicesInDashboard] = useState(false)
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedStudentsForTable, setSelectedStudentsForTable] = useState<string[]>([])
  const [viewingStudent, setViewingStudent] = useState<StudentSummaryFromAPI | null>(null)
  const [showStudentDetailsDrawer, setShowStudentDetailsDrawer] = useState(false)

  // Fee Structure states
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false)
  const [selectedStructure, setSelectedStructure] = useState<FeeStructure | null>(null)
  const [preselectedStructureId, setPreselectedStructureId] = useState<string>('')
  const [preselectedTerm, setPreselectedTerm] = useState<string>('')
  
  // Assign to grades modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [feeStructureToAssign, setFeeStructureToAssign] = useState<{ id: string; name: string; academicYear?: string; isActive?: boolean } | null>(null)

  const {
    selectedStudent,
    setSelectedStudent,
    searchTerm,
    setSearchTerm,
    selectedFeeType,
    setSelectedFeeType,
    selectedStatus,
    setSelectedStatus,
    selectedClass,
    setSelectedClass,
    dueDateFilter,
    setDueDateFilter,
    filteredInvoices,
    summaryStats,
    filteredStudents,
    selectedStudentInvoices,
    selectedStudentInvoicesLoading,
    selectedStudentInvoicesError
  } = useFeesData()

  // Fee Structure hooks
  const {
    feeStructures,
    grades: feeStructureGrades,
    createFeeStructure,
    deleteFeeStructure,
    assignFeeStructureToGrade,
    generateBulkInvoices
  } = useFeeStructures()

  // GraphQL Fee Structure hooks
  const {
    updateFeeStructure: graphqlUpdateFeeStructure,
    deleteFeeStructure: graphqlDeleteFeeStructure,
    isUpdating,
    updateError,
    isDeleting,
    deleteError,
    structures: graphQLStructures,
    isLoading: structuresLoading,
    error: structuresError,
    fetchFeeStructures,
    lastFetchTime
  } = useGraphQLFeeStructures()

  // Get grade data for fee structures
  const {
    grades,
    isLoading: isLoadingGrades,
    error: gradesError,
    fetchGradeData
  } = useGradeData()

  // Process GraphQL structures for display - Group by academic year
  const processedFeeStructures = useMemo(() => {
    if (!graphQLStructures || graphQLStructures.length === 0) return []

    // Group structures by base name (removing " - Term X" suffix) and academic year
    const groupedStructures = new Map<string, any[]>();

    graphQLStructures.forEach(structure => {
      // Extract base name by removing " - Term X" pattern
      const baseName = structure.name.replace(/\s*-\s*Term\s+\d+\s*$/i, '').trim();
      const academicYearId = structure.academicYear?.id || '';
      const groupKey = `${baseName}__${academicYearId}`;

      if (!groupedStructures.has(groupKey)) {
        groupedStructures.set(groupKey, []);
      }
      groupedStructures.get(groupKey)!.push(structure);
    });

    // Process each group
    return Array.from(groupedStructures.entries()).map(([groupKey, structures]) => {
      // Combine all terms from grouped structures
      const allTerms = structures.flatMap(s => s.terms || []);

      // Combine all grade levels (unique)
      const gradeLevelMap = new Map();
      structures.forEach(s => {
        s.gradeLevels?.forEach((gl: any) => {
          gradeLevelMap.set(gl.id, gl);
        });
      });

      // Create a map of term ID to fee buckets for that specific term
      const termFeesMap = new Map<string, any[]>();

      structures.forEach(structure => {
        // A structure can have multiple terms - handle all of them
        const structureTerms = structure.terms || [];
        console.log(`📊 Processing structure: ${structure.name}, Terms: ${structureTerms.map((t: any) => t.name).join(', ')}, Items: ${structure.items?.length || 0}`);

        if (structureTerms.length === 0) {
          console.warn(`⚠️ Structure ${structure.name} has no terms, skipping`);
          return;
        }

        // Create buckets from items
        const buckets: any[] = [];
        if (structure.items && structure.items.length > 0) {
          const bucketMap = new Map();
          structure.items.forEach((item: any) => {
            const bucketKey = item.feeBucket.id;
            const existingBucket = bucketMap.get(bucketKey);

            if (existingBucket) {
              existingBucket.totalAmount += item.amount;
              existingBucket.isOptional = existingBucket.isOptional && !item.isMandatory;
            } else {
              bucketMap.set(bucketKey, {
                id: item.feeBucket.id,
                name: item.feeBucket.name,
                totalAmount: item.amount,
                isOptional: !item.isMandatory,
                firstItemId: item.id,
                feeBucketId: item.feeBucket.id,
              });
            }
          });
          buckets.push(...Array.from(bucketMap.values()));
          console.log(`  ✅ Created ${buckets.length} buckets:`, buckets.map(b => `${b.name}: $${b.totalAmount}`));
        }

        // If structure has multiple terms, apply the same buckets to all terms
        // This handles cases where one fee structure applies to multiple terms
        structureTerms.forEach((term: any) => {
          console.log(`  📌 Mapping buckets to term: ${term.name} (${term.id})`);
          termFeesMap.set(term.id, buckets);
        });
      });

      console.log(`📦 Complete termFeesMap for group:`, Object.fromEntries(termFeesMap));

      // Use the first structure as the base
      const baseStructure = structures[0];
      const baseName = baseStructure.name.replace(/\s*-\s*Term\s+\d+\s*$/i, '').trim();

      // Get buckets for first term (default display)
      const defaultTermId = allTerms[0]?.id || '';
      const defaultBuckets = termFeesMap.get(defaultTermId) || [];

      return {
        structureId: baseStructure.id,
        structureName: baseName,
        academicYear: baseStructure.academicYear?.name || 'N/A',
        academicYearId: baseStructure.academicYear?.id || '',
        termName: allTerms.length > 0 ? allTerms[0].name : 'N/A',
        termId: defaultTermId,
        terms: allTerms,
        gradeLevels: Array.from(gradeLevelMap.values()),
        buckets: defaultBuckets, // Default to first term's buckets
        termFeesMap: Object.fromEntries(termFeesMap), // Store all term-specific fees
        allStructures: structures, // Store original structures for reference
        isActive: structures.some(s => s.isActive),
        createdAt: baseStructure.createdAt,
        updatedAt: structures.reduce((latest, s) => {
          return s.updatedAt > latest ? s.updatedAt : latest;
        }, baseStructure.updatedAt)
      };
    });
  }, [graphQLStructures])

  const getAssignedGrades = (feeStructureId: string) => {
    return grades.filter((grade: any) => grade.feeStructureId === feeStructureId)
  }

  const getTotalStudents = (feeStructureId: string) => {
    return getAssignedGrades(feeStructureId).reduce((sum: number, grade: any) => sum + grade.studentCount, 0)
  }

  const handleUpdateFeeItem = (itemId: string, amount: number, isMandatory: boolean, bucketName: string, feeStructureName: string, bucketId?: string) => {
    // This will be handled by the modal
    console.log('Update fee item:', { itemId, amount, isMandatory, bucketName, feeStructureName, bucketId })
  }

  // Auto-fetch fee structures on mount
  useEffect(() => {
    console.log('Fees page mounted - fetching fee structures...')
    fetchFeeStructures()
  }, []) // Only run on mount

  // Auto-fetch when user clicks to view fee structures (if not already loaded)
  useEffect(() => {
    if (showFeeStructuresInDashboard && graphQLStructures.length === 0 && !structuresLoading) {
      console.log('Viewing fee structures - fetching data...')
      fetchFeeStructures()
    }
  }, [showFeeStructuresInDashboard, graphQLStructures.length, structuresLoading])

  // Student Summary hook for detailed student data
  const {
    studentData: detailedStudentData,
    loading: studentDataLoading,
    error: studentDataError,
    refetch: refetchStudentData
  } = useStudentSummary(selectedStudent)

  // Fallback hook using the existing working implementation
  const {
    studentDetail: fallbackStudentData,
    loading: fallbackLoading,
    error: fallbackError,
    refetch: refetchFallback
  } = useStudentDetailSummary(selectedStudent || '')

  // Use fallback data if main hook fails
  const finalStudentData = detailedStudentData || fallbackStudentData
  const finalLoading = studentDataLoading || fallbackLoading
  const finalError = studentDataError || fallbackError

  // Debug logging to see what data we're getting
  console.log('🔍 DEBUG: finalStudentData:', finalStudentData)
  console.log('📊 DEBUG: selectedStudentInvoices:', selectedStudentInvoices)
  console.log('📊 DEBUG: selectedStudentInvoicesLoading:', selectedStudentInvoicesLoading)
  console.log('📊 DEBUG: selectedStudentInvoicesError:', selectedStudentInvoicesError)

  if (finalStudentData?.feeSummary) {
    console.log('💰 DEBUG: Fee Summary Data:', {
      totalOwed: finalStudentData.feeSummary.totalOwed,
      totalPaid: finalStudentData.feeSummary.totalPaid,
      balance: finalStudentData.feeSummary.balance,
      numberOfFeeItems: finalStudentData.feeSummary.numberOfFeeItems
    })
  }
  const finalRefetch = () => {
    console.log('🔄 FORCE REFRESH: Starting comprehensive data refresh...')

    // Force refresh student summary data
    console.log('📊 Refreshing student summary data...')
    refetchStudentData()

    // Force refresh fallback student data
    console.log('📋 Refreshing fallback student data...')
    refetchFallback()

    // Add a small delay to ensure all refetches complete
    setTimeout(() => {
      console.log('✅ Force refresh completed - all data should be updated')
    }, 1000)
  }

  // Force page revalidation function
  const forcePageRefresh = () => {
    console.log('🔄 FORCE PAGE REFRESH: Triggering complete page revalidation...')

    // Trigger all data refreshes
    finalRefetch()

    // Optionally refresh the entire page if needed (uncomment if required)
    // window.location.reload()

    console.log('✅ Page refresh operations completed')
  }

  const {
    // modal states
    showNewInvoiceDrawer,
    setShowNewInvoiceDrawer,
    showRecordPaymentDrawer,
    setShowRecordPaymentDrawer,
    // form states
    newInvoiceForm,
    setNewInvoiceForm,
    paymentForm,
    setPaymentForm,
    // handlers
    handleNewInvoice,
    handleSendReminder,
    handleRecordPayment,
    handleCreatePaymentPlan,
    handleSubmitPayment,
    handleSubmitInvoice,
    // GraphQL states
    isGeneratingInvoices
  } = useFormHandlers(selectedStudent, filteredInvoices, forcePageRefresh)

  // selectedStudentInvoices is now provided by useFeesData hook

  // Fetch all students summary for the new table
  const {
    students: allStudentsSummary,
    loading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents
  } = useAllStudentsSummary()

  // Access the toast function
  const { toast } = useToast()

  // Event handlers
  const handleViewInvoice = (invoice: FeeInvoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceModal(true)
  }


  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const handleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id))
    }
  }

  // Handlers for new students table
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentsForTable(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAllStudents = () => {
    if (selectedStudentsForTable.length === allStudentsSummary.length) {
      setSelectedStudentsForTable([])
    } else {
      setSelectedStudentsForTable(allStudentsSummary.map(s => s.id))
    }
  }

  const handleViewStudent = (student: StudentSummaryFromAPI) => {
    setViewingStudent(student)
    setSelectedStudent(student.id)
    setShowStudentDetailsDrawer(true)
  }

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId)
    setSelectedInvoices([])
    setShowStudentDetailsDrawer(true)
  }

  const handleClearStudentSelection = () => {
    setSelectedStudent(null)
    setShowStudentDetailsDrawer(false)
  }

  // Wrapper functions for PageHeader
  const handleSendReminderWrapper = () => {
    handleSendReminder(selectedInvoices)
  }

  // Fee Structure handlers
  const handleCreateNew = () => {
    setSelectedStructure(null)
    setShowCreateForm(true)
  }

  const handleEdit = (feeStructure: FeeStructure) => {
    setSelectedStructure(feeStructure)
    setShowEditForm(true)
  }

  const handleDelete = async (feeStructureId: string) => {
    try {
      // Show loading toast
      toast({
        title: "Deleting fee structure...",
        description: "Please wait while we delete this fee structure.",
      })

      const success = await graphqlDeleteFeeStructure(feeStructureId)

      if (success) {
        // Show success toast
        toast({
          title: "Fee structure deleted",
          description: "The fee structure has been successfully deleted.",
          variant: "success",
        })
      } else if (deleteError) {
        // Show error toast
        toast({
          title: "Deletion failed",
          description: `Error: ${deleteError}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      // Show unexpected error toast
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Unexpected error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error('Error in delete handler:', error)
    }
  }

  const handleSaveStructure = async (formData: FeeStructureForm): Promise<string | null> => {
    try {
      let result: string | null = null
      if (selectedStructure) {
        // For edit mode, use GraphQL to update the fee structure
        console.log('Updating fee structure with GraphQL:', selectedStructure.id);

        // Extract the academicYearId and termId from the form or use defaults
        // In a real implementation, you would get these IDs from your form or API
        const updateInput: UpdateFeeStructureInput = {
          name: formData.name,
          isActive: true,
          // Use the academic year ID and term ID from the user's example
          // In a real app, these would come from dropdowns or selections
          academicYearId: "0216c3ab-7197-4538-97be-0527b3a8a164",
          termIds: ["6d17670b-11e4-430f-828b-c48e746b5507"]
        };

        result = await graphqlUpdateFeeStructure(selectedStructure.id, updateInput);
        if (!result && updateError) {
          throw new Error(`GraphQL update failed: ${updateError}`);
        }
        
        // Refresh the list after update
        await fetchFeeStructures()
      } else {
        // For create mode, use the local function
        result = await createFeeStructure(formData)
        
        // Refresh the list after creation
        await fetchFeeStructures()
      }

      // Reset UI state
      setShowCreateForm(false)
      setShowEditForm(false)
      setSelectedStructure(null)
      
      // Show success toast
      toast({
        title: "Success",
        description: selectedStructure ? "Fee structure updated successfully" : "Fee structure created successfully",
        variant: "default",
      })
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error saving fee structure:', error)
      
      // Show error toast
      toast({
        title: "Error",
        description: `Failed to ${selectedStructure ? 'update' : 'create'} fee structure: ${errorMessage}`,
        variant: "destructive",
      })
      
      return null
    }
  }

  const handleGenerateInvoices = (feeStructureId: string, term: string) => {
    setPreselectedStructureId(feeStructureId)
    setPreselectedTerm(term)
    setShowInvoiceGenerator(true)
  }

  const handleBulkGeneration = (generation: BulkInvoiceGeneration) => {
    try {
      const newInvoices = generateBulkInvoices(generation)
      console.log(`Generated ${newInvoices.length} invoices successfully`)
      
      // Show success toast
      toast({
        title: "Success",
        description: `Generated ${newInvoices.length} invoice${newInvoices.length !== 1 ? 's' : ''} successfully`,
        variant: "default",
      })
      
      // Switch to invoices view to show the new invoices
      setCurrentView('invoices')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Failed to generate invoices:', error)
      
      // Show error toast
      toast({
        title: "Error",
        description: `Failed to generate invoices: ${errorMessage}`,
        variant: "destructive",
      })
    }
  }

  const handleAssignToGrade = (feeStructureId: string) => {
    console.log('Assign to grade:', feeStructureId)
    
    // Find the fee structure from processed structures
    const structure = processedFeeStructures.find(s => s.structureId === feeStructureId)
    
    if (structure) {
      setFeeStructureToAssign({
        id: structure.structureId,
        name: structure.structureName,
        academicYear: structure.academicYear,
        isActive: structure.isActive
      })
      setIsAssignModalOpen(true)
    } else {
      console.error('Fee structure not found:', feeStructureId)
      toast({
        title: "Error",
        description: "Fee structure not found. Please refresh the page and try again.",
        variant: "destructive",
      })
    }
  }
  
  // Handle assignment success
  const handleAssignmentSuccess = (assignmentResult: any) => {
    console.log('Fee structure assigned successfully:', assignmentResult)
    // Refresh fee structures and grade data
    Promise.all([
      fetchFeeStructures(),
      fetchGradeData()
    ]).catch(err => {
      console.error('Failed to refresh data after assignment:', err)
      toast({
        title: "Warning",
        description: "Assignment successful but failed to refresh data. Please refresh the page.",
        variant: "destructive",
      })
    })
  }

  const convertStructureToForm = (structure: FeeStructure): FeeStructureForm => {
    return {
      name: structure.name,
      grade: structure.grade,
      boardingType: structure.boardingType,
      academicYear: structure.academicYear,
      termStructures: structure.termStructures.map(term => ({
        term: term.term,
        dueDate: term.dueDate,
        latePaymentFee: term.latePaymentFee.toString(),
        earlyPaymentDiscount: (term.earlyPaymentDiscount || 0).toString(),
        earlyPaymentDeadline: term.earlyPaymentDeadline || '',
        buckets: term.buckets.map(bucket => ({
          type: bucket.type,
          name: bucket.name,
          description: bucket.description,
          isOptional: bucket.isOptional,
          components: bucket.components.map(component => ({
            name: component.name,
            description: component.description,
            amount: component.amount.toString(),
            category: component.category
          }))
        }))
      }))
    }
  }

  // Action handlers for dashboard
  const handleViewStructures = () => {
    setShowFeeStructuresInDashboard(true)
    setShowInvoicesInDashboard(false)
  }

  const handleBackToOverview = () => {
    setShowFeeStructuresInDashboard(false)
    setShowInvoicesInDashboard(false)
  }

  const handleViewInvoices = () => {
    setShowInvoicesInDashboard(true)
    setShowFeeStructuresInDashboard(false)
  }

  const handleAssignToGradeAction = () => {
    setCurrentView('structures')
    // This will be handled by the FeeStructureManager
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header with Back Button when not on dashboard */}
        {currentView !== 'dashboard' && (
          <div className="bg-white border-b border-slate-200 px-6 py-2">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-2"
            >
              ← Back to Dashboard
            </Button>
          </div>
        )}

        {/* Content Based on Current View */}
        {currentView === 'dashboard' ? (
          <div className="flex-1 p-3">
            <div className="max-w-7xl mx-auto">

              <FeesActionDashboard
                onViewStructures={handleViewStructures}
                onCreateStructure={handleCreateNew}
                onGenerateInvoices={() => {
                  setShowInvoiceGenerator(true)
                }}
                onViewInvoices={handleViewInvoices}
                onAssignToGrade={handleAssignToGradeAction}
                onRecordPayment={handleRecordPayment}
                onViewPayments={handleViewInvoices}
                stats={{
                  feeStructures: feeStructures?.length || 0,
                  students: filteredStudents?.length || allStudentsSummary?.length || 0,
                  invoices: filteredInvoices?.length || 0,
                  totalRevenue: summaryStats?.totalCollected || 0
                }}
                showFeeStructures={showFeeStructuresInDashboard}
                showInvoices={showInvoicesInDashboard}
                onBackToOverview={handleBackToOverview}
                feeStructuresContent={
                  <FeeStructuresTab
                    isLoading={structuresLoading}
                    error={structuresError}
                    structures={graphQLStructures}
                    graphQLStructures={processedFeeStructures}
                    fallbackFeeStructures={[]}
                    onEdit={handleEdit}
                    onAssignToGrade={handleAssignToGrade}
                    onGenerateInvoices={handleGenerateInvoices}
                    onDelete={handleDelete}
                    onUpdateFeeItem={handleUpdateFeeItem}
                    onCreateNew={handleCreateNew}
                    fetchFeeStructures={fetchFeeStructures}
                    getAssignedGrades={getAssignedGrades}
                    getTotalStudents={getTotalStudents}
                    hasFetched={!!lastFetchTime}
                  />
                }
                invoicesContent={
                  <FeesDataTable
                    students={allStudentsSummary}
                    loading={studentsLoading}
                    error={studentsError}
                    selectedStudents={selectedStudentsForTable}
                    onSelectStudent={handleSelectStudent}
                    onSelectAll={handleSelectAllStudents}
                    onViewStudent={handleViewStudent}
                  />
                }
              />
            </div>
          </div>
        ) : currentView === 'structures' ? (
          <div className="flex-1 p-6 space-y-6">
            {/* Workflow Guidance */}
            <WorkflowGuidance />

            {/* Fee Structure Manager */}
            <FeeStructureManager
              onCreateNew={handleCreateNew}
              onEdit={handleEdit}
              onGenerateInvoices={handleGenerateInvoices}
              onAssignToGrade={handleAssignToGrade}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Main Content Area */}
            <div className="flex-1 p-6">
              {selectedStudent ? (
                // Student-specific view (unified invoice view)
                <div className="space-y-6">
                  {/* Fee Summary Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">Fee Summary</h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStudentDetailsDrawer(true)}
                      >
                        View Full Details
                      </Button>
                    </div>
                    <FeeSummaryCard
                      studentData={finalStudentData}
                      invoiceData={selectedStudentInvoices}
                      loading={finalLoading}
                      error={finalError}
                    />
                  </div>

                  {/* Fee Invoices Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Fee Invoices</h2>
                    <StudentInvoicesTable
                      invoices={selectedStudentInvoices}
                      studentName={finalStudentData?.studentName || 'Student'}
                      onViewInvoice={handleViewInvoice}
                    />
                  </div>

                  {/* Payment History Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
                    <StudentPayments studentId={selectedStudent} />
                  </div>
                </div>
              ) : (
                // General overview view
                <div className="space-y-6">
                  {/* Overview Stats */}
                  <OverviewStatsCards
                    selectedStudent={selectedStudent}
                    selectedStudentInvoices={selectedStudentInvoices}
                    summaryStats={summaryStats}
                    allStudents={filteredStudents}
                  />

                  {/* Filters */}
                  <FiltersSection
                    selectedFeeType={selectedFeeType}
                    setSelectedFeeType={setSelectedFeeType}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    selectedClass=""
                    setSelectedClass={() => { }}
                    dueDateFilter=""
                    setDueDateFilter={() => { }}
                  />

                  {/* Data Table - Using new allStudentsSummary query */}
                  <FeesDataTable
                    students={allStudentsSummary}
                    loading={studentsLoading}
                    error={studentsError}
                    selectedStudents={selectedStudentsForTable}
                    onSelectStudent={handleSelectStudent}
                    onSelectAll={handleSelectAllStudents}
                    onViewStudent={handleViewStudent}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Student</Label>
                  <p className="text-sm text-gray-600">{selectedInvoice.studentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Admission Number</Label>
                  <p className="text-sm text-gray-600">{selectedInvoice.admissionNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Class</Label>
                  <p className="text-sm text-gray-600">{selectedInvoice.class} - {selectedInvoice.section}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fee Type</Label>
                  <p className="text-sm text-gray-600 capitalize">{selectedInvoice.feeType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Amount</Label>
                  <p className="text-sm text-gray-600">KES {selectedInvoice.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount Due</Label>
                  <p className="text-sm text-gray-600">KES {selectedInvoice.amountDue.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <p className="text-sm text-gray-600">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  {selectedInvoice && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.paymentStatus)}`}>
                      {selectedInvoice.paymentStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast notifications */}
      <Toaster />

      {/* Fee Structure Drawer */}
      <FeeStructureDrawer
        isOpen={showCreateForm || showEditForm}
        onClose={() => {
          setShowCreateForm(false)
          setShowEditForm(false)
          setSelectedStructure(null)
        }}
        onSave={handleSaveStructure}
      />

      <BulkInvoiceGenerator
        isOpen={showInvoiceGenerator}
        onClose={() => setShowInvoiceGenerator(false)}
        onGenerate={handleBulkGeneration}
        preselectedStructureId={preselectedStructureId}
        preselectedTerm={preselectedTerm}
      />

      {/* Record Payment Drawer */}
      <RecordPaymentDrawer
        isOpen={showRecordPaymentDrawer}
        onClose={() => setShowRecordPaymentDrawer(false)}
        form={paymentForm}
        setForm={setPaymentForm}
        onSubmit={handleSubmitPayment}
        studentId={selectedStudent}
        studentInfo={finalStudentData ? {
          name: finalStudentData.studentName,
          admissionNumber: finalStudentData.admissionNumber,
          className: finalStudentData.gradeLevelName
        } : undefined}
        onPaymentSuccess={forcePageRefresh}
      />

      {/* New Invoice Drawer */}
      <NewInvoiceDrawer
        isOpen={showNewInvoiceDrawer}
        onClose={() => setShowNewInvoiceDrawer(false)}
        form={newInvoiceForm}
        setForm={setNewInvoiceForm}
        onSubmit={handleSubmitInvoice}
        selectedStudent={selectedStudent}
        allStudents={filteredStudents}
        isGenerating={isGeneratingInvoices}
      />

      {/* Student Details Drawer */}
      {finalStudentData && (
        <StudentDetailsDrawer
          isOpen={showStudentDetailsDrawer}
          onClose={() => setShowStudentDetailsDrawer(false)}
          studentData={finalStudentData}
          loading={finalLoading}
          error={finalError}
          onRefresh={finalRefetch}
        />
      )}

      {/* Assign Fee Structure to Grades Modal */}
      <AssignFeeStructureModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false)
          setFeeStructureToAssign(null)
        }}
        feeStructure={feeStructureToAssign}
        availableGrades={grades}
        onSuccess={handleAssignmentSuccess}
      />
    </div>
  )
}
