'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  FileText
} from 'lucide-react'
import { FeeStructure } from '../../types'
import { ProcessedFeeStructure } from './types'

interface FeeStructureCardProps {
  structure: ProcessedFeeStructure
  onEdit: (feeStructure: FeeStructure) => void
  onAssignToGrade: (feeStructureId: string, name: string, academicYear?: string) => void
  onGenerateInvoices: (feeStructureId: string, term: string) => void
  onDelete?: (id: string, name: string) => void
  onUpdateFeeItem: (itemId: string, amount: number, isMandatory: boolean, bucketName: string, feeStructureName: string) => void
}

export const FeeStructureCard = ({
  structure,
  onEdit,
  onAssignToGrade,
  onGenerateInvoices,
  onDelete,
  onUpdateFeeItem
}: FeeStructureCardProps) => {
  return (
    <Card key={structure.structureId} className="hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden group">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-800 mb-2">
              {structure.structureName}
              {structure.isActive ? (
                <Badge variant="default" className="ml-2 bg-green-500 hover:bg-green-600">Active</Badge>
              ) : (
                <Badge variant="secondary" className="ml-2">Inactive</Badge>
              )}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-1 mb-2">
              <span className="text-sm font-medium text-slate-600 inline-flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-primary" />
                {structure.academicYear}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {structure.terms && structure.terms.length > 0 ? (
                structure.terms.map((term: { id: string; name: string }) => (
                  <Badge key={term.id} variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border-blue-200">{term.name}</Badge>
                ))
              ) : (
                <Badge variant="outline">No Terms</Badge>
              )}
            </div>
            {structure.gradeLevels && structure.gradeLevels.length > 0 && (
              <div className="mt-1">
                <p className="text-xs text-gray-500">Grade Levels:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {structure.gradeLevels.map(grade => (
                    <Badge key={grade.id} variant="outline" className="text-xs">
                      {grade.shortName || (grade.gradeLevel && grade.gradeLevel.name) || grade.name || 'Grade'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Created: {new Date(structure.createdAt).toLocaleDateString()}
              {structure.updatedAt !== structure.createdAt && 
                ` • Updated: ${new Date(structure.updatedAt).toLocaleDateString()}`
              }
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
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => onDelete(structure.structureId, structure.structureName)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Fee Buckets Preview from GraphQL data */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Fee Buckets:</h4>
          <div className="flex flex-wrap gap-2">
            {structure.buckets && structure.buckets.length > 0 ? structure.buckets.map((bucket) => (
              <div key={bucket.id} className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs flex-grow">
                  {bucket.name}: KES {bucket.totalAmount.toLocaleString()}
                  {bucket.isOptional && ' (Optional)'}
                </Badge>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 px-2 text-xs hover:bg-primary/10"
                  onClick={() => onUpdateFeeItem(
                    bucket.firstItemId || bucket.id, // Use firstItemId if available, fallback to bucket.id
                    bucket.totalAmount,
                    !bucket.isOptional,
                    bucket.name,
                    structure.structureName,
                    bucket.feeBucketId // Pass the bucket ID separately
                  )}
                >
                  <Edit className="h-3 w-3 mr-1" /> Edit
                </Button>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No fee items defined yet</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAssignToGrade(
              structure.structureId, 
              structure.structureName, 
              structure.academicYear
            )}
          >
            <Users className="h-4 w-4 mr-1" />
            Assign to Grade
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onGenerateInvoices(structure.structureId, structure.termName)}
          >
            <FileText className="h-4 w-4 mr-1" />
            Generate Invoices
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
