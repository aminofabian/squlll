'use client'

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  FileText,
  Coins,
  Building2
} from 'lucide-react'
import { FeeStructure } from '../../types'
import { ProcessedFeeStructure } from './types'
import { cn } from '@/lib/utils'

interface FeeStructureCardProps {
  structure: ProcessedFeeStructure
  onEdit: (feeStructure: FeeStructure) => void
  onAssignToGrade: (feeStructureId: string, name: string, academicYear?: string, academicYearId?: string, termId?: string) => void
  onGenerateInvoices: (feeStructureId: string, term: string) => void
  onDelete?: (id: string, name: string) => void
  onUpdateFeeItem: (itemId: string, amount: number, isMandatory: boolean, bucketName: string, feeStructureName: string, bucketId?: string) => void
  isDeleting?: boolean
}

export const FeeStructureCard = ({
  structure,
  onEdit,
  onAssignToGrade,
  onGenerateInvoices,
  onDelete,
  onUpdateFeeItem,
  isDeleting = false
}: FeeStructureCardProps) => {
  const [selectedTermId, setSelectedTermId] = useState(structure.termId)

  // Sort terms by term number (Term 1, Term 2, Term 3)
  const sortedTerms = useMemo(() => {
    if (!structure.terms || structure.terms.length === 0) return []
    
    return [...structure.terms].sort((a, b) => {
      const getTermNumber = (name: string): number => {
        const match = name.match(/\d+/)
        return match ? parseInt(match[0], 10) : 999
      }
      
      return getTermNumber(a.name) - getTermNumber(b.name)
    })
  }, [structure.terms])

  // Get buckets for the selected term
  const displayBuckets = useMemo(() => {
    if (structure.termFeesMap && selectedTermId) {
      const buckets = structure.termFeesMap[selectedTermId]
      if (buckets && buckets.length > 0) {
        return buckets
      }
    }
    return structure.buckets || []
  }, [structure.termFeesMap, structure.buckets, selectedTermId])

  // Calculate term total (currently selected term)
  const termTotal = displayBuckets.reduce((sum: number, bucket: any) => sum + bucket.totalAmount, 0)

  // Calculate year total (all terms combined)
  const yearTotal = useMemo(() => {
    if (!structure.termFeesMap || Object.keys(structure.termFeesMap).length === 0) {
      return termTotal * structure.terms.length
    }

    // Sum all buckets from all terms
    const total = Object.entries(structure.termFeesMap).reduce((yearSum, [termId, termBuckets]) => {
      const termSum = termBuckets.reduce((sum: number, bucket: any) => sum + bucket.totalAmount, 0)
      return yearSum + termSum
    }, 0)

    return total
  }, [structure.termFeesMap, structure.terms.length, termTotal])
  return (
    <Card className="hover:shadow-md transition-shadow border border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-base font-semibold text-slate-900 truncate">
                {structure.structureName}
              </CardTitle>
              {structure.isActive && (
                <Badge variant="default" className="bg-green-500 text-white text-[10px] px-1.5 py-0">Active</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <Calendar className="h-3 w-3" />
                {structure.academicYear}
              </div>
              {structure.gradeLevels && structure.gradeLevels.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {structure.gradeLevels.slice(0, 3).map(grade => (
                    <Badge key={grade.id} variant="outline" className="text-[10px] px-1.5 py-0">
                      {grade.shortName || grade.gradeLevel?.name || grade.name}
                    </Badge>
                  ))}
                  {structure.gradeLevels.length > 3 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      +{structure.gradeLevels.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit({
              id: structure.structureId,
              name: structure.structureName,
              isActive: structure.isActive,
              academicYear: structure.academicYear,
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
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(structure.structureId, structure.structureName)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Terms Selection */}
        {sortedTerms.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sortedTerms.map((term: { id: string; name: string }) => (
              <button
                key={term.id}
                onClick={() => setSelectedTermId(term.id)}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-medium uppercase border rounded transition-colors",
                  selectedTermId === term.id
                    ? "bg-primary text-white border-primary"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                )}
              >
                {term.name}
              </button>
            ))}
          </div>
        )}

        {/* Totals */}
        <div className="flex items-center gap-3 px-2 py-1.5 bg-slate-50 rounded border border-slate-200">
          <div className="flex items-center gap-1.5">
            <Coins className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-slate-600">
              {structure.terms.length > 1 ? sortedTerms.find(t => t.id === selectedTermId)?.name : 'Total'}
            </span>
            <span className="text-sm font-bold text-slate-900">
              KES {termTotal.toLocaleString()}
            </span>
          </div>
          {structure.terms.length > 1 && (
            <>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs text-slate-600">Year</span>
                <span className="text-sm font-bold text-emerald-700">
                  KES {yearTotal.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Buckets */}
        {displayBuckets.length > 0 ? (
          <div className="space-y-1">
            {displayBuckets.map((bucket, idx) => (
              <div key={bucket.id || idx} className="flex items-center justify-between gap-2 px-2 py-1.5 bg-white border border-slate-200 rounded hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={cn(
                    "text-xs font-medium truncate",
                    bucket.isOptional ? "text-slate-500" : "text-slate-900"
                  )}>
                    {bucket.name}
                  </span>
                  {bucket.isOptional && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-200 text-amber-600 bg-amber-50">
                      OPT
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900 whitespace-nowrap">
                    KES {bucket.totalAmount.toLocaleString()}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-5 w-5 p-0 hover:bg-primary/10"
                    onClick={() => onUpdateFeeItem(
                      bucket.firstItemId || bucket.id,
                      bucket.totalAmount,
                      !bucket.isOptional,
                      bucket.name,
                      structure.structureName,
                      bucket.feeBucketId
                    )}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">No fee items</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-200">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs h-8"
            onClick={() => onAssignToGrade(
              structure.structureId, 
              structure.structureName, 
              structure.academicYear,
              structure.academicYearId,
              selectedTermId
            )}
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Assign
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs h-8"
            onClick={() => onGenerateInvoices(structure.structureId, sortedTerms.find(t => t.id === selectedTermId)?.name || structure.termName)}
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Invoices
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
