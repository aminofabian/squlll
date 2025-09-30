'use client'

import { Button } from "@/components/ui/button"
import { FeeStructure } from '../../types'
import { ProcessedFeeStructure } from './types'
import { FeeStructureCard } from './FeeStructureCard'
import { Loader2, Plus, Info } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBoardingTypeColor } from "../../utils/colorHelpers"

interface FeeStructuresTabProps {
  isLoading: boolean
  error: string | null
  structures: any[] | null
  graphQLStructures: ProcessedFeeStructure[]
  fallbackFeeStructures: FeeStructure[]
  onEdit: (feeStructure: FeeStructure) => void
  onAssignToGrade: (feeStructureId: string, name: string, academicYear?: string) => void
  onGenerateInvoices: (feeStructureId: string, term: string) => void
  onDelete?: (id: string, name: string) => void
  onUpdateFeeItem: (itemId: string, amount: number, isMandatory: boolean, bucketName: string, feeStructureName: string) => void
  onCreateNew: () => void
  fetchFeeStructures: () => Promise<any>
  getAssignedGrades: (feeStructureId: string) => any[]
  getTotalStudents: (feeStructureId: string) => number
}

export const FeeStructuresTab = ({
  isLoading,
  error,
  structures,
  graphQLStructures,
  fallbackFeeStructures,
  onEdit,
  onAssignToGrade,
  onGenerateInvoices,
  onDelete,
  onUpdateFeeItem,
  onCreateNew,
  fetchFeeStructures,
  getAssignedGrades,
  getTotalStudents
}: FeeStructuresTabProps) => {
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading fee structures...</span>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-6 border border-red-200  bg-red-50">
        <h3 className="text-red-600 font-medium mb-2">Error loading fee structures</h3>
        <p className="text-red-500">{error}</p>
        <pre className="mt-2 text-xs text-red-400 bg-red-50 p-2 overflow-auto max-h-40">
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
            onClick={() => console.log('Current structures state:', {structures, lastFetchTime: new Date()})}
            size="sm"
          >
            Debug
          </Button>
        </div>
      </div>
    )
  }

  // If we have GraphQL data
  if (structures && structures.length > 0) {
    if (graphQLStructures.length > 0) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {graphQLStructures.map((structure) => (
            <FeeStructureCard
              key={structure.structureId}
              structure={structure}
              onEdit={onEdit}
              onAssignToGrade={onAssignToGrade}
              onGenerateInvoices={onGenerateInvoices}
              onDelete={onDelete ? (id, name) => onDelete(id, name) : undefined}
              onUpdateFeeItem={onUpdateFeeItem}
            />
          ))}
        </div>
      )
    } else {
      // GraphQL returned empty array
      return (
        <div className="p-6 border border-amber-200  bg-amber-50">
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
    }
  }
  
  // Use fallback data if no GraphQL data
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4  mb-4 border border-blue-200">
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
                  <Loader2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4" />
                </Button>
                {onDelete && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => onDelete(structure.id, structure.name)}
                  >
                    <Loader2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 mt-2">
              <div className="bg-blue-50 rounded-md p-3 border border-blue-100 flex items-center gap-3 transition-all hover:bg-blue-100 hover:border-blue-200">
                <div className="bg-blue-100 rounded-full p-1.5">
                  <Info className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-blue-800">{getTotalStudents(structure.id)}</p>
                  <p className="text-xs font-medium text-blue-600">Students</p>
                </div>
              </div>
              <div className="bg-green-50 rounded-md p-3 border border-green-100 flex items-center gap-3 transition-all hover:bg-green-100 hover:border-green-200">
                <div className="bg-green-100 rounded-full p-1.5">
                  <Info className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-green-800">
                    KES {structure.termStructures[0]?.totalAmount.toLocaleString() || 0}
                  </p>
                  <p className="text-xs font-medium text-green-600">Per Term</p>
                </div>
              </div>
              <div className="bg-amber-50 rounded-md p-3 border border-amber-100 flex items-center gap-3 transition-all hover:bg-amber-100 hover:border-amber-200">
                <div className="bg-amber-100 rounded-full p-1.5">
                  <Info className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-amber-800">{structure.termStructures.length}</p>
                  <p className="text-xs font-medium text-amber-600">Terms</p>
                </div>
              </div>
              <div className="bg-purple-50 rounded-md p-3 border border-purple-100 flex items-center gap-3 transition-all hover:bg-purple-100 hover:border-purple-200">
                <div className="bg-purple-100 rounded-full p-1.5">
                  <Info className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-purple-800">{getAssignedGrades(structure.id).length}</p>
                  <p className="text-xs font-medium text-purple-600">Classes</p>
                </div>
              </div>
            </div>
            {/* Fee Buckets Preview */}
            <div className="mt-2 rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <h4 className="text-sm font-medium flex items-center">
                  <Info className="h-4 w-4 mr-2 text-slate-600" />
                  Fee Structure Components
                </h4>
              </div>
              <div className="p-4 space-y-4">
                {/* Display buckets by term */}
                {(structure as any).terms && (structure as any).terms.length > 0 ? (
                  (structure as any).terms.map((term: { id: string; name: string }) => (
                    <div key={term.id} className="rounded-md border border-slate-200 overflow-hidden">
                      <div className="bg-blue-50 px-3 py-2 border-b border-blue-100">
                        <h5 className="text-sm font-medium text-blue-800 flex items-center">
                          <Info className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                          {term.name}
                        </h5>
                      </div>
                      <div className="p-3 bg-white">
                        {(structure as any).buckets?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {(structure as any).buckets.map((bucket: { id: string; name: string; totalAmount: number; isOptional: boolean }) => (
                              <div key={`${term.id}-${bucket.id}`} className="border rounded-md px-3 py-1.5 flex items-center bg-white hover:bg-slate-50 transition-colors">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{bucket.name}</div>
                                  <div className="text-xs text-slate-600">KES {bucket.totalAmount.toLocaleString()}</div>
                                </div>
                                {bucket.isOptional && (
                                  <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200 text-xs">Optional</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center p-4 text-slate-500 text-sm">
                            <Info className="h-4 w-4 mr-2 text-slate-400" />
                            No fee buckets defined for this term
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center p-8 text-slate-500 text-sm border border-dashed rounded-md">
                    <Info className="h-5 w-5 mr-2 text-slate-400" />
                    No terms defined in this fee structure
                  </div>
                )}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-6 border-t border-slate-100 pt-4">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300"
                onClick={() => onAssignToGrade(
                  structure.id, 
                  structure.name, 
                  structure.academicYear
                )}
              >
                <Info className="h-4 w-4 mr-1.5" />
                Assign to Grade
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-300"
                onClick={() => onGenerateInvoices(structure.id, (structure as any).termName || 'Term 1')}
              >
                <Info className="h-4 w-4 mr-1.5" />
                Generate Invoices
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
