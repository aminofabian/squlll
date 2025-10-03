'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { FeeStructure } from '../../types'
import { ProcessedFeeStructure } from './types'
import { FeeStructureCard } from './FeeStructureCard'
import { Loader2, Plus, Info, Edit, Trash2, Users, FileText, ChevronDown, ChevronRight } from 'lucide-react'
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
  onUpdateFeeItem: (itemId: string, amount: number, isMandatory: boolean, bucketName: string, feeStructureName: string, bucketId?: string) => void
  onCreateNew: () => void
  fetchFeeStructures: () => Promise<any>
  getAssignedGrades: (feeStructureId: string) => any[]
  getTotalStudents: (feeStructureId: string) => number
}

interface FeeStructureTableProps {
  structures: ProcessedFeeStructure[]
  onEdit: (feeStructure: FeeStructure) => void
  onAssignToGrade: (feeStructureId: string, name: string, academicYear?: string) => void
  onGenerateInvoices: (feeStructureId: string, term: string) => void
  onDelete?: (id: string, name: string) => void
  onUpdateFeeItem: (itemId: string, amount: number, isMandatory: boolean, bucketName: string, feeStructureName: string, bucketId?: string) => void
  getAssignedGrades: (feeStructureId: string) => any[]
  getTotalStudents: (feeStructureId: string) => number
}

const FeeStructureTable = ({
  structures,
  onEdit,
  onAssignToGrade,
  onGenerateInvoices,
  onDelete,
  onUpdateFeeItem,
  getAssignedGrades,
  getTotalStudents
}: FeeStructureTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const calculateTotalFees = (buckets: any[]) => {
    return buckets.reduce((sum, bucket) => sum + bucket.totalAmount, 0)
  }

  return (
    <div className="space-y-2">
      {structures.map((structure) => {
        const isExpanded = expandedRows.has(structure.structureId)
        const totalFees = structure.buckets ? calculateTotalFees(structure.buckets) : 0
        const assignedGrades = getAssignedGrades(structure.structureId)
        const totalStudents = getTotalStudents(structure.structureId)

        return (
          <div 
            key={structure.structureId} 
            className="border border-slate-200 bg-white overflow-hidden"
          >
            {/* Main Row - Always Visible */}
            <div className="grid grid-cols-12 gap-6 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
              {/* Expand/Collapse Button */}
              <div className="col-span-1">
                <button
                  onClick={() => toggleRow(structure.structureId)}
                  className="p-1.5 hover:bg-slate-200 transition-colors"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-700" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-700" />
                  )}
                </button>
              </div>

              {/* Fee Structure Name */}
              <div className="col-span-4">
                <h3 className="font-semibold text-slate-900">
                  {structure.structureName}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  {structure.isActive ? (
                    <Badge className="bg-primary text-white text-xs">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  )}
                  <span className="text-xs text-slate-500">
                    {new Date(structure.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Academic Year & Terms */}
              <div className="col-span-3">
                <div className="text-sm text-slate-700 mb-1.5">{structure.academicYear}</div>
                <div className="flex flex-wrap gap-1">
                  {structure.terms && structure.terms.length > 0 ? (
                    structure.terms.map((term: { id: string; name: string }) => (
                      <span key={term.id} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 border border-slate-200">
                        {term.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs">No terms</span>
                  )}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="col-span-2">
                <div className="text-sm font-semibold text-slate-900">
                  KES {totalFees.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {structure.buckets?.length || 0} bucket{structure.buckets?.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Student Count */}
              <div className="col-span-2">
                <div className="text-sm font-semibold text-slate-900">{totalStudents}</div>
                <div className="text-xs text-slate-500 mt-0.5">Students</div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-slate-200">
                {/* Fee Buckets Section */}
                {structure.buckets && structure.buckets.length > 0 && (
                  <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                    <h4 className="text-sm font-semibold text-slate-900 mb-4">Fee Breakdown</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {structure.buckets.map((bucket) => (
                        <div 
                          key={bucket.id} 
                          className="border border-slate-200 p-4 bg-white"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="font-medium text-slate-900">{bucket.name}</div>
                              <div className="text-xs text-slate-500 mt-1.5">
                                {bucket.isOptional ? (
                                  <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 border border-slate-200">
                                    Optional
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 border border-slate-200">
                                    Mandatory
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => onUpdateFeeItem(
                                bucket.firstItemId || bucket.id, // Use firstItemId if available, fallback to bucket.id
                                bucket.totalAmount,
                                !bucket.isOptional,
                                bucket.name,
                                structure.structureName,
                                bucket.feeBucketId // Pass the bucket ID separately
                              )}
                            >
                              <Edit className="h-3.5 w-3.5 text-slate-600" />
                            </Button>
                          </div>
                          <div className="text-lg font-semibold text-slate-900">
                            KES {bucket.totalAmount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grade Levels Section */}
                {structure.gradeLevels && structure.gradeLevels.length > 0 && (
                  <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                    <h4 className="text-sm font-semibold text-slate-900 mb-4">Assigned Grade Levels</h4>
                    <div className="flex flex-wrap gap-2">
                      {structure.gradeLevels.map(grade => (
                        <span key={grade.id} className="text-sm text-slate-700 bg-white px-3 py-1.5 border border-slate-200">
                          {grade.shortName || (grade.gradeLevel && grade.gradeLevel.name) || grade.name || 'Grade'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions Section */}
                <div className="px-6 py-5 bg-white">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit({
                        id: structure.structureId,
                        name: structure.structureName,
                        isActive: structure.isActive,
                        academicYear: structure.academicYear,
                        grade: '',
                        boardingType: 'day',
                        createdDate: '',
                        lastModified: '',
                        termStructures: []
                      })}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Structure
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onAssignToGrade(
                        structure.structureId, 
                        structure.structureName, 
                        structure.academicYear
                      )}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Assign to Grade
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onGenerateInvoices(structure.structureId, structure.termName)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Invoices
                    </Button>

                    {onDelete && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-auto text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => onDelete(structure.structureId, structure.structureName)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
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
      return <FeeStructureTable 
        structures={graphQLStructures}
        onEdit={onEdit}
        onAssignToGrade={onAssignToGrade}
        onGenerateInvoices={onGenerateInvoices}
        onDelete={onDelete}
        onUpdateFeeItem={onUpdateFeeItem}
        getAssignedGrades={getAssignedGrades}
        getTotalStudents={getTotalStudents}
      />
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
      <div className="bg-blue-50 p-4 mb-4 border border-blue-200">
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
      
      {/* Table Header */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-slate-700 border-b border-slate-200">
          <div className="col-span-3">Fee Structure</div>
          <div className="col-span-2">Academic Year</div>
          <div className="col-span-2">Terms</div>
          <div className="col-span-2">Fee Buckets</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Actions</div>
        </div>
        
        {/* Table Rows */}
        {fallbackFeeStructures.map((structure) => (
          <div key={structure.id} className="grid grid-cols-12 gap-4 px-6 py-4 text-sm border-b border-slate-100 hover:bg-slate-50 transition-colors">
            {/* Fee Structure Name */}
            <div className="col-span-3">
              <div className="font-medium text-slate-900">{structure.name}</div>
              <div className="text-xs text-slate-500 mt-1">
                Grade: {structure.grade} • {structure.boardingType}
              </div>
            </div>
            
            {/* Academic Year */}
            <div className="col-span-2">
              <div className="text-slate-700">{structure.academicYear}</div>
            </div>
            
            {/* Terms */}
            <div className="col-span-2">
              <div className="flex flex-wrap gap-1">
                {structure.termStructures && structure.termStructures.length > 0 ? (
                  structure.termStructures.map((term, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Term {index + 1}
                    </Badge>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs">No Terms</span>
                )}
              </div>
            </div>
            
            {/* Fee Buckets */}
            <div className="col-span-2">
              <div className="space-y-1">
                {structure.termStructures && structure.termStructures.length > 0 ? (
                  structure.termStructures[0].buckets.slice(0, 2).map((bucket, index) => (
                        <div key={index} className="text-xs">
                          <span className="font-medium">{bucket.name}:</span>
                          <span className="text-slate-600 ml-1">KES {bucket.amount.toLocaleString()}</span>
                        </div>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs">No buckets</span>
                )}
                {structure.termStructures && structure.termStructures[0]?.buckets && structure.termStructures[0].buckets.length > 2 && (
                  <div className="text-xs text-slate-500">
                    +{structure.termStructures[0].buckets.length - 2} more
                  </div>
                )}
              </div>
            </div>
            
            {/* Status */}
            <div className="col-span-2">
              <div className="flex flex-col gap-1">
                {structure.isActive ? (
                  <Badge variant="default" className="w-fit bg-green-500 hover:bg-green-600 text-xs">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="w-fit text-xs">
                    Inactive
                  </Badge>
                )}
                <Badge className={`w-fit text-xs ${getBoardingTypeColor(structure.boardingType)}`}>
                  {structure.boardingType}
                </Badge>
              </div>
            </div>
            
            {/* Actions */}
            <div className="col-span-1">
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(structure)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                {onDelete && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => onDelete(structure.id, structure.name)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Action Buttons for each structure */}
      <div className="space-y-2">
        {fallbackFeeStructures.map((structure) => (
          <div key={`actions-${structure.id}`} className="flex gap-2 p-4 bg-white border border-slate-200 rounded-lg">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onAssignToGrade(
                structure.id, 
                structure.name, 
                structure.academicYear
              )}
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              <Users className="h-4 w-4 mr-1" />
              Assign to Grade
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onGenerateInvoices(structure.id, 'Term 1')}
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <FileText className="h-4 w-4 mr-1" />
              Generate Invoices
            </Button>
            {structure.termStructures && structure.termStructures[0]?.buckets && structure.termStructures[0].buckets.length > 0 && (
              <div className="ml-auto flex gap-1">
                {structure.termStructures[0].buckets.map((bucket, index) => (
                  <Button 
                    key={index}
                    size="sm" 
                    variant="ghost" 
                    className="h-8 px-2 text-xs hover:bg-primary/10"
                    onClick={() => onUpdateFeeItem(
                      `${structure.id}-${index}`, // This is fallback data, keep as is for now
                      bucket.amount,
                      true,
                      bucket.name,
                      structure.name
                    )}
                  >
                    <Edit className="h-3 w-3 mr-1" /> 
                    Edit {bucket.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
