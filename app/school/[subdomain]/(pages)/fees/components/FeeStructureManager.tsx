'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Users, 
  DollarSign, 
  Calendar,
  Settings,
  FileText,
  Send,
  Loader2
} from 'lucide-react'
import { FeeStructure, Grade, TermFeeStructure } from '../types'
import { mockFeeStructures } from '../data/mockData'
import { useGraphQLFeeStructures } from '../hooks/useGraphQLFeeStructures'
import { useGradeData } from '../hooks/useGradeData'
import { RefreshDataButton } from './RefreshDataButton'

interface FeeStructureManagerProps {
  onCreateNew: () => void
  onEdit: (feeStructure: FeeStructure) => void
  onGenerateInvoices: (feeStructureId: string, term: string) => void
  onAssignToGrade: (feeStructureId: string) => void
}

export const FeeStructureManager = ({
  onCreateNew,
  onEdit,
  onGenerateInvoices,
  onAssignToGrade
}: FeeStructureManagerProps) => {
  const [selectedTab, setSelectedTab] = useState('structures')
  // Only use mock data when GraphQL data is not available
  const [fallbackFeeStructures] = useState<FeeStructure[]>(mockFeeStructures)
  
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
    if (!structures || structures.length === 0) return [] as Array<{
      structureId: string
      structureName: string
      academicYear: string
      termName: string
      buckets: Array<{ id: string; name: string; totalAmount: number; isOptional: boolean }>
      isActive: boolean
    }>

    return structures.map(structure => {
      // Group items by bucket
      const bucketMap = new Map<string, { id: string; name: string; totalAmount: number; isOptional: boolean }>();
      
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
            });
          }
        });
      }
      
      return {
        structureId: structure.id,
        structureName: structure.name,
        academicYear: structure.academicYear?.name || 'N/A',
        termName: structure.term?.name || 'N/A',
        buckets: Array.from(bucketMap.values()),
        isActive: structure.isActive
      };
    });
  }, [structures])

  const getAssignedGrades = (feeStructureId: string) => {
    return grades.filter(grade => grade.feeStructureId === feeStructureId)
  }

  const getTotalStudents = (feeStructureId: string) => {
    return getAssignedGrades(feeStructureId).reduce((sum, grade) => sum + grade.studentCount, 0)
  }

  const getBoardingTypeColor = (type: string) => {
    switch (type) {
      case 'day': return 'bg-blue-100 text-blue-800'
      case 'boarding': return 'bg-green-100 text-green-800'
      case 'both': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Fee Structure Management</h1>
          <RefreshDataButton 
            onRefresh={refreshAllData}
            label="Refresh Data"
            tooltipText="Refresh all data from API"
            size="sm"
          />
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Structure
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="grades">Grade Assignments</TabsTrigger>
          <TabsTrigger value="invoices">Invoice Generation</TabsTrigger>
        </TabsList>

        {/* Fee Structures Tab */}
        <TabsContent value="structures" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-lg">Loading fee structures...</span>
            </div>
          ) : error ? (
            <div className="p-6 border border-red-200 rounded-lg bg-red-50">
              <h3 className="text-red-600 font-medium mb-2">Error loading fee structures</h3>
              <p className="text-red-500">{error}</p>
              <pre className="mt-2 text-xs text-red-400 bg-red-50 p-2 rounded overflow-auto max-h-40">
                GraphQL Error Details
                Path: /api/graphql
                Query: GetFeeStructures
                Time: {new Date().toISOString()}
              </pre>
              <div className="mt-4 flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => fetchFeeStructures()}
                  size="sm"
                >
                  Retry
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => console.log('Current structures state:', {structures, dataState, lastFetchTime})}
                  size="sm"
                >
                  Debug
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {structures && structures.length > 0 ? (
                graphQLStructures.length > 0 ? (
                /* Display GraphQL data if available */
                graphQLStructures.map((structure) => (
                  <Card key={structure.structureId} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {structure.structureName}
                            <Badge variant="outline">{structure.termName || 'N/A'}</Badge>
                            {structure.isActive ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            Academic Year: {structure.academicYear}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => onEdit({
                            id: structure.structureId,
                            name: structure.structureName,
                            isActive: structure.isActive,
                            academicYear: structure.academicYear,
                            // Provide defaults for required FeeStructure fields
                            grade: '',
                            boardingType: 'day',
                            createdDate: '',
                            lastModified: '',
                            termStructures: []
                          })}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Fee Buckets Preview from GraphQL data */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Fee Buckets:</h4>
                        <div className="flex flex-wrap gap-2">
                          {structure.buckets && structure.buckets.length > 0 ? structure.buckets.map((bucket) => (
                            <Badge key={bucket.id} variant="outline" className="text-xs">
                              {bucket.name}: KES {bucket.totalAmount.toLocaleString()}
                              {bucket.isOptional && ' (Optional)'}
                            </Badge>
                          )) : (
                            <p className="text-sm text-slate-500">No fee items defined yet</p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => onAssignToGrade(structure.structureId)}>
                          <Users className="h-4 w-4 mr-1" />
                          Assign to Grade
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onGenerateInvoices(structure.structureId, structure.termName)}>
                          <FileText className="h-4 w-4 mr-1" />
                          Generate Invoices
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="p-6 border border-amber-200 rounded-lg bg-amber-50">
                  <h3 className="text-amber-600 font-medium mb-2">No fee structures found</h3>
                  <p className="text-sm text-amber-500 mb-3">GraphQL API returned successfully but no fee structures were found in the response.</p>
                  <p className="text-sm text-gray-600 mb-2">Common reasons for this:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
                    <li>No fee structures have been created yet</li>
                    <li>The user doesn't have permission to view fee structures</li>
                    <li>There might be an issue with the backend GraphQL API</li>
                  </ul>
                  <div className="flex gap-2">
                    <Button 
                      onClick={onCreateNew} 
                      variant="default"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Your First Fee Structure
                    </Button>
                    <Button 
                      onClick={() => fetchFeeStructures()} 
                      variant="outline"
                      size="sm"
                    >
                      <Loader2 className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </div>
              )
              ) : (
                /* Display fallback data if no GraphQL data */
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-200">
                    <h3 className="text-blue-800 font-medium flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Using Fallback Data
                    </h3>
                    <p className="text-blue-600 text-sm mt-1">The system is currently using sample fee structures because GraphQL data is not available.</p>
                    <Button 
                      onClick={() => fetchFeeStructures()} 
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      <Loader2 className="h-4 w-4 mr-1" />
                      Try Loading Real Data
                    </Button>
                  </div>
                  
                  {fallbackFeeStructures.map((structure) => (
                    <Card key={structure.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {structure.name}
                              <Badge className={getBoardingTypeColor(structure.boardingType)}>
                                {structure.boardingType}
                              </Badge>
                              {structure.isActive ? (
                                <Badge variant="default">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                              {structure.grade} • {structure.academicYear}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => onEdit(structure)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">{getTotalStudents(structure.id)}</p>
                              <p className="text-xs text-gray-500">Students</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium">
                                KES {structure.termStructures[0]?.totalAmount.toLocaleString() || 0}
                              </p>
                              <p className="text-xs text-gray-500">Per Term</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium">{structure.termStructures.length}</p>
                              <p className="text-xs text-gray-500">Terms</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium">{getAssignedGrades(structure.id).length}</p>
                              <p className="text-xs text-gray-500">Classes</p>
                            </div>
                          </div>
                        </div>
                        {/* Fee Buckets Preview */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Fee Buckets (Term 1):</h4>
                          <div className="flex flex-wrap gap-2">
                            {structure.termStructures[0]?.buckets.map((bucket) => (
                              <Badge key={bucket.id} variant="outline" className="text-xs">
                                {bucket.name}: KES {bucket.amount.toLocaleString()}
                                {bucket.isOptional && ' (Optional)'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onAssignToGrade(structure.id)}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Assign to Grade
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onGenerateInvoices(structure.id, 'Term 1')}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Generate Invoices
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
        

        {/* Grade Assignments Tab */}
        <TabsContent value="grades" className="space-y-4">
          {isLoadingGrades ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-lg">Loading grades...</span>
            </div>
          ) : gradesError ? (
            <div className="p-6 border border-red-200 rounded-lg bg-red-50">
              <h3 className="text-red-600 font-medium mb-2">Error loading grades</h3>
              <p className="text-red-500">{gradesError}</p>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <Loader2 className="h-4 w-4 mr-1" />
                  Reload Page
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {usedGradesFallback && (
                <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mb-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-amber-800">Using Fallback Grade Data</span>
                  </div>
                  <p className="text-sm text-amber-700 mt-1">Unable to fetch real grade data from the API. Using sample data instead.</p>
                </div>
              )}
              
              <div className="grid gap-4">
                {grades.length > 0 ? grades.map((grade) => {
                  // Find the assigned structure - try from real structures first, then fallback
                  const graphQLStructure = structures?.find(s => s.id === grade.feeStructureId);
                  const fallbackStructure = fallbackFeeStructures.find((fs: FeeStructure) => fs.id === grade.feeStructureId);
                  
                  // Use the GraphQL structure if available, otherwise fall back to mock data
                  const assignedStructure = fallbackStructure;
                    
                  return (
                    <Card key={grade.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{grade.name} - Section {grade.section}</h3>
                            <p className="text-sm text-gray-600">
                              {grade.studentCount} students • {grade.boardingType}
                            </p>
                          </div>
                          <div className="text-right">
                            {assignedStructure ? (
                              <div>
                                <Badge variant="default">{assignedStructure.name}</Badge>
                                <p className="text-sm text-gray-600 mt-1">
                                  {assignedStructure.termStructures && assignedStructure.termStructures[0] ? 
                                    `KES ${assignedStructure.termStructures[0].totalAmount.toLocaleString()} per term` : 
                                    'Fee amount not available'}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <Badge variant="secondary">No Structure Assigned</Badge>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={() => onAssignToGrade(grade.id)}
                                >
                                  Assign Structure
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }) : (
                  <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                    <h3 className="text-gray-500 font-medium mb-2">No Grades Available</h3>
                    <p className="text-sm text-gray-400">No grade information is currently available.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Invoice Generation Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="grid gap-4">
            {fallbackFeeStructures.map((structure) => (
              <Card key={structure.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{structure.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {structure.termStructures.map((term: TermFeeStructure) => (
                      <div key={term.id} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{term.term}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Due: {new Date(term.dueDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium mb-3">
                          KES {term.totalAmount.toLocaleString()}
                        </p>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => onGenerateInvoices(structure.id, term.term)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Generate {term.term} Invoices
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>{getTotalStudents(structure.id)}</strong> students across{' '}
                      <strong>{getAssignedGrades(structure.id).length}</strong> classes will receive invoices
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
