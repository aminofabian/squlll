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
  Building2,
  Eye,
  X,
  Download
} from 'lucide-react'
import { FeeStructure, FeeStructureForm } from '../../types'
import { ProcessedFeeStructure } from './types'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FeeStructurePDFPreview } from '../FeeStructurePDFPreview'
import { useParams } from 'next/navigation'

interface FeeStructureCardProps {
  structure: ProcessedFeeStructure
  index?: number
  onEdit: (feeStructure: FeeStructure) => void
  onAssignToGrade: (feeStructureId: string, name: string, academicYear?: string, academicYearId?: string, termId?: string) => void
  onGenerateInvoices: (feeStructureId: string, term: string) => void
  onDelete?: (id: string, name: string) => void
  onUpdateFeeItem: (itemId: string, amount: number, isMandatory: boolean, bucketName: string, feeStructureName: string, bucketId?: string) => void
  isDeleting?: boolean
}

export const FeeStructureCard = ({
  structure,
  index,
  onEdit,
  onAssignToGrade,
  onGenerateInvoices,
  onDelete,
  onUpdateFeeItem,
  isDeleting = false
}: FeeStructureCardProps) => {
  const params = useParams()
  const subdomain = params.subdomain as string
  const [selectedTermId, setSelectedTermId] = useState(structure.termId)
  const [showPDFPreview, setShowPDFPreview] = useState(false)

  // Get school name from subdomain
  const schoolName = useMemo(() => {
    if (!subdomain) return "KANYAWANGA HIGH SCHOOL"
    return subdomain
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .replace(/\bSchool\b/i, '')
      .trim() + ' School'
  }, [subdomain])

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

  // Convert ProcessedFeeStructure to FeeStructureForm for PDF preview
  const convertToPDFForm = useMemo((): FeeStructureForm => {
    const termsToUse = sortedTerms.length > 0 ? sortedTerms : (structure.terms || [])
    
    const termStructures = termsToUse.map((term) => {
      const termBuckets = structure.termFeesMap?.[term.id] || structure.buckets || []

      return {
        term: term.name as 'Term 1' | 'Term 2' | 'Term 3',
        academicYear: structure.academicYear,
        dueDate: '',
        latePaymentFee: '',
        earlyPaymentDiscount: '',
        earlyPaymentDeadline: '',
        buckets: termBuckets.map(bucket => ({
          id: bucket.feeBucketId,
          type: 'tuition' as const,
          name: bucket.name,
          description: '',
          isOptional: bucket.isOptional,
          components: [{
            name: bucket.name,
            description: '',
            amount: bucket.totalAmount.toString(),
            category: 'fee'
          }]
        })),
        existingBucketAmounts: {}
      }
    })

    return {
      name: structure.structureName,
      grade: '',
      boardingType: 'both',
      academicYear: structure.academicYear,
      academicYearId: structure.academicYearId,
      termStructures: termStructures.length > 0 ? termStructures : [{
        term: structure.termName as 'Term 1' | 'Term 2' | 'Term 3',
        academicYear: structure.academicYear,
        dueDate: '',
        latePaymentFee: '',
        earlyPaymentDiscount: '',
        earlyPaymentDeadline: '',
        buckets: structure.buckets.map(bucket => ({
          id: bucket.feeBucketId,
          type: 'tuition' as const,
          name: bucket.name,
          description: '',
          isOptional: bucket.isOptional,
          components: [{
            name: bucket.name,
            description: '',
            amount: bucket.totalAmount.toString(),
            category: 'fee'
          }]
        })),
        existingBucketAmounts: {}
      }]
    }
  }, [structure, sortedTerms])

  const handleDownloadPDF = () => {
    setTimeout(() => {
      window.print()
    }, 100)
  }

  return (
    <Card className="hover:shadow-md transition-all border border-slate-200 rounded-lg overflow-hidden bg-white">
      <CardHeader className="pb-2.5 px-3.5 pt-3 border-b border-slate-100">
        {/* Header Row 1: Title and Actions */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {index !== undefined && (
                <div className="flex-shrink-0 w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{index}</span>
                </div>
              )}
              <CardTitle className="text-sm font-semibold text-slate-900 truncate">
                {structure.structureName}
              </CardTitle>
              {structure.isActive && (
                <Badge variant="default" className="bg-primary text-white text-[9px] px-1.5 py-0.5 h-4 leading-none flex-shrink-0">
                  Active
                </Badge>
              )}
            </div>
            {/* Header Row 2: Metadata */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 text-[10px] text-slate-600">
                <Calendar className="h-3 w-3 text-primary/70" />
                <span className="font-medium">{structure.academicYear}</span>
              </div>
              {structure.gradeLevels && structure.gradeLevels.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {structure.gradeLevels.slice(0, 3).map(grade => (
                    <Badge key={grade.id} variant="outline" className="text-[9px] px-1.5 py-0 h-4 leading-none border-slate-300 text-slate-700">
                      {grade.shortName || grade.gradeLevel?.name || grade.name}
                    </Badge>
                  ))}
                  {structure.gradeLevels.length > 3 && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 leading-none border-slate-300 text-slate-700">
                      +{structure.gradeLevels.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-1 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary" 
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
              <Edit className="h-3.5 w-3.5" />
            </Button>
            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(structure.structureId, structure.structureName)}
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-3.5 py-3 space-y-3">
        {/* Terms Selection */}
        {sortedTerms.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sortedTerms.map((term: { id: string; name: string }) => (
              <button
                key={term.id}
                onClick={() => setSelectedTermId(term.id)}
                className={cn(
                  "px-2 py-1 text-[9px] font-semibold uppercase border rounded-md transition-all",
                  selectedTermId === term.id
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                )}
              >
                {term.name}
              </button>
            ))}
          </div>
        )}

        {/* Totals Section - Better Organized */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-md border border-slate-200">
            <Coins className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[9px] text-slate-600 font-medium leading-tight">
                {structure.terms.length > 1 ? sortedTerms.find(t => t.id === selectedTermId)?.name || 'Term' : 'Total'}
              </div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                KES {termTotal.toLocaleString()}
              </div>
            </div>
          </div>
          {structure.terms.length > 1 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-md border border-primary/20">
              <Building2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-[9px] text-primary/80 font-medium leading-tight">Year Total</div>
                <div className="text-xs font-bold text-primary leading-tight">
                  KES {yearTotal.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buckets - Organized Grid Layout */}
        {displayBuckets.length > 0 ? (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {displayBuckets.map((bucket, idx) => (
              <div 
                key={bucket.id || idx} 
                className="group flex items-center justify-between gap-3 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                    bucket.isOptional ? "bg-amber-400" : "bg-primary"
                  )} />
                  <span className={cn(
                    "text-[10px] font-medium truncate",
                    bucket.isOptional ? "text-slate-500" : "text-slate-900"
                  )}>
                    {bucket.name}
                  </span>
                  {bucket.isOptional && (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 leading-none border-amber-200 text-amber-600 bg-amber-50 flex-shrink-0">
                      OPT
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-bold text-slate-900 whitespace-nowrap">
                    KES {bucket.totalAmount.toLocaleString()}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-5 w-5 p-0 hover:bg-primary/20 hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
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
          <div className="text-center py-3 border border-dashed border-slate-200 rounded-md bg-slate-50/50">
            <p className="text-[10px] text-slate-400">No fee items</p>
          </div>
        )}

        {/* Actions - Better Spaced */}
        <div className="flex gap-2 pt-2 border-t border-slate-200">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-[10px] h-8 font-medium border-slate-300 hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
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
            className="flex-1 text-[10px] h-8 font-medium border-slate-300 hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
            onClick={() => onGenerateInvoices(structure.structureId, sortedTerms.find(t => t.id === selectedTermId)?.name || structure.termName)}
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Invoices
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0 border-slate-300 hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
            onClick={() => setShowPDFPreview(true)}
            title="Preview PDF"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>

      {/* PDF Preview Dialog */}
      <Dialog open={showPDFPreview} onOpenChange={setShowPDFPreview}>
        <style>{`
          @media print {
            @page {
              margin: 15mm;
              size: A4;
            }
            [data-radix-dialog-overlay],
            [data-radix-dialog-content] > header,
            button {
              display: none !important;
            }
            [data-radix-dialog-content] {
              position: static !important;
              max-width: 100% !important;
              width: 100% !important;
              height: auto !important;
              max-height: none !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              overflow: visible !important;
            }
            [data-pdf-content] {
              position: static !important;
              width: 100% !important;
              height: auto !important;
              max-height: none !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              display: block !important;
            }
          }
        `}</style>
        <DialogContent className="max-w-[280mm] w-[280mm] max-h-[95vh] p-0 overflow-hidden flex flex-col print:p-0 print:m-0 print:max-w-none print:w-full print:h-full">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200/60 bg-gradient-to-br from-white via-slate-50/30 to-white flex-shrink-0 print:hidden">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white shadow-md ring-2 ring-primary/20">
                  <FileText className="h-5 w-5 drop-shadow-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-slate-900 leading-tight">
                    Fee Structure Preview
                  </span>
                  <span className="text-sm text-slate-600 font-medium truncate max-w-md">
                    {structure.structureName}
                  </span>
                </div>
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 hover:shadow-md transition-all duration-200 font-medium print:hidden"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPDFPreview(false)}
                  className="h-9 w-9 p-0 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 print:hidden rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 print:px-0 print:py-0 print:overflow-visible print:h-auto print:max-h-none">
            <div data-pdf-content className="print:block print:w-full print:h-auto print:max-h-none">
              <FeeStructurePDFPreview
                formData={convertToPDFForm}
                schoolName={schoolName}
                feeBuckets={displayBuckets.map(b => ({
                  id: b.feeBucketId,
                  name: b.name,
                  description: ''
                }))}
                gradeLevels={structure.gradeLevels}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
