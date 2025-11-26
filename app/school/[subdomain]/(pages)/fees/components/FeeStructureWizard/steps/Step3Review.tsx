'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Edit2, Eye, FileText, Download, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FeeStructurePDFPreview } from '../../FeeStructurePDFPreview'
import { FeeStructureForm } from '../../../types'

interface Step3ReviewProps {
    formData: {
        name: string
        grade: string
        boardingType: string
        academicYear: string
        selectedGrades?: string[]
        selectedBuckets: string[]
        bucketAmounts: Record<string, { id: string; name: string; amount: number; isMandatory: boolean }>
        terms?: Array<{ id: string; name: string }>
        termBucketAmounts?: Record<string, Record<string, { id: string; name: string; amount: number; isMandatory: boolean }>>
    }
    onChange: (field: string, value: any) => void
}

export const Step3Review = ({ formData, onChange }: Step3ReviewProps) => {
    const [editingField, setEditingField] = useState<string | null>(null)
    const [editingAmount, setEditingAmount] = useState<string | null>(null)
    const [showPDFPreview, setShowPDFPreview] = useState(false)

    const hasTerms = formData.terms && formData.terms.length > 0
    const hasTermSpecificAmounts = formData.termBucketAmounts && Object.keys(formData.termBucketAmounts).length > 0
    
    // Calculate totals - if terms exist, show per-term totals, otherwise show global total
    const getAmountForTerm = (bucketId: string, termId: string): number => {
        if (formData.termBucketAmounts?.[termId]?.[bucketId]) {
            return formData.termBucketAmounts[termId][bucketId].amount || 0
        }
        return formData.bucketAmounts[bucketId]?.amount || 0
    }
    
    const getTotalForTerm = (termId: string): number => {
        if (!formData.selectedBuckets || !formData.termBucketAmounts?.[termId]) {
            return Object.values(formData.bucketAmounts).reduce((sum, b) => sum + b.amount, 0)
        }
        return formData.selectedBuckets.reduce((sum, bucketId) => {
            return sum + getAmountForTerm(bucketId, termId)
        }, 0)
    }
    
    const getMandatoryTotalForTerm = (termId: string): number => {
        if (!formData.selectedBuckets || !formData.termBucketAmounts?.[termId]) {
            return Object.values(formData.bucketAmounts)
                .filter(b => b.isMandatory)
                .reduce((sum, b) => sum + b.amount, 0)
        }
        return formData.selectedBuckets.reduce((sum, bucketId) => {
            const bucket = formData.termBucketAmounts?.[termId]?.[bucketId] || formData.bucketAmounts[bucketId]
            if (bucket?.isMandatory) {
                return sum + getAmountForTerm(bucketId, termId)
            }
            return sum
        }, 0)
    }
    
    const totalAmount = hasTerms && hasTermSpecificAmounts
        ? (formData.terms?.reduce((sum, term) => sum + getTotalForTerm(term.id), 0) || 0)
        : Object.values(formData.bucketAmounts).reduce((sum, b) => sum + b.amount, 0)
    const mandatoryAmount = hasTerms && hasTermSpecificAmounts
        ? (formData.terms?.reduce((sum, term) => sum + getMandatoryTotalForTerm(term.id), 0) || 0)
        : Object.values(formData.bucketAmounts)
            .filter(b => b.isMandatory)
            .reduce((sum, b) => sum + b.amount, 0)

    // Convert formData to FeeStructureForm for PDF preview
    const convertToPDFForm = (): FeeStructureForm => {
        if (hasTerms && hasTermSpecificAmounts) {
            // Create term-specific structures
            const termStructures = formData.terms?.map((term, index) => {
                const buckets = formData.selectedBuckets.map(bucketId => {
                    const bucket = formData.termBucketAmounts?.[term.id]?.[bucketId] || formData.bucketAmounts[bucketId]
                    return {
                        id: bucketId,
                        type: 'tuition' as const,
                        name: bucket.name,
                        description: '',
                        isOptional: !bucket.isMandatory,
                        components: [{
                            name: bucket.name,
                            description: '',
                            amount: bucket.amount.toString(),
                            category: 'fee'
                        }]
                    }
                })

                return {
                    term: term.name as any,
                    academicYear: formData.academicYear,
                    dueDate: '',
                    latePaymentFee: '',
                    earlyPaymentDiscount: '',
                    earlyPaymentDeadline: '',
                    buckets: buckets,
                    existingBucketAmounts: {}
                }
            }) || []

            return {
                name: formData.name,
                grade: formData.grade || formData.selectedGrades?.join(', ') || '',
                boardingType: formData.boardingType as 'day' | 'boarding' | 'both',
                academicYear: formData.academicYear,
                termStructures
            }
        } else {
            // Single term structure (backward compatibility)
            const buckets = formData.selectedBuckets.map(bucketId => {
                const bucket = formData.bucketAmounts[bucketId]
                return {
                    id: bucketId,
                    type: 'tuition' as const,
                    name: bucket.name,
                    description: '',
                    isOptional: !bucket.isMandatory,
                    components: [{
                        name: bucket.name,
                        description: '',
                        amount: bucket.amount.toString(),
                        category: 'fee'
                    }]
                }
            })

            return {
                name: formData.name,
                grade: formData.grade || formData.selectedGrades?.join(', ') || '',
                boardingType: formData.boardingType as 'day' | 'boarding' | 'both',
                academicYear: formData.academicYear,
                termStructures: [{
                    term: 'Term 1' as const,
                    academicYear: formData.academicYear,
                    dueDate: '',
                    latePaymentFee: '',
                    earlyPaymentDiscount: '',
                    earlyPaymentDeadline: '',
                    buckets: buckets,
                    existingBucketAmounts: {}
                }]
            }
        }
    }

    // Handle PDF download
    const handleDownloadPDF = () => {
        window.print()
    }

    const updateBucketAmount = (bucketId: string, newAmount: number) => {
        const bucket = formData.bucketAmounts[bucketId]
        onChange('bucketAmounts', {
            ...formData.bucketAmounts,
            [bucketId]: { ...bucket, amount: newAmount }
        })
        setEditingAmount(null)
    }

    return (
        <div className="space-y-6">
            {/* Name - Editable */}
            {editingField === 'name' ? (
                <Input
                    autoFocus
                    value={formData.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                    className="font-semibold text-xl h-12"
                />
            ) : (
                <button
                    onClick={() => setEditingField('name')}
                    className="flex items-center gap-2 group w-full text-left hover:bg-slate-50 -mx-2 px-2 py-2 rounded transition-colors"
                >
                    <span className="font-semibold text-xl text-slate-900">{formData.name}</span>
                    <Edit2 className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            )}

            {/* Meta Info */}
            <div className="text-slate-600 -mt-2">
                {formData.grade} • {formData.boardingType === 'both' ? 'Day & Boarding' :
                    formData.boardingType === 'day' ? 'Day Students' : 'Boarding Students'} • {formData.academicYear}
            </div>

            {/* Fees */}
            {hasTerms && hasTermSpecificAmounts ? (
                // Term-specific display
                <div className="space-y-4 pt-2">
                    {formData.terms?.map(term => {
                        const termTotal = getTotalForTerm(term.id)
                        const mandatoryTotal = getMandatoryTotalForTerm(term.id)
                        
                        return (
                            <div key={term.id} className="border border-slate-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-slate-900">{term.name}</h4>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-primary">
                                            {termTotal.toLocaleString()} KES
                                        </div>
                                        {termTotal !== mandatoryTotal && (
                                            <div className="text-xs text-slate-600">
                                                Required: {mandatoryTotal.toLocaleString()} KES
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    {formData.selectedBuckets.map(bucketId => {
                                        const bucket = formData.termBucketAmounts?.[term.id]?.[bucketId] || formData.bucketAmounts[bucketId]
                                        if (!bucket) return null
                                        
                                        return (
                                            <div
                                                key={`${term.id}-${bucketId}`}
                                                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        bucket.isMandatory ? "bg-primary" : "bg-amber-400"
                                                    )} />
                                                    <span className="text-slate-700 text-sm">{bucket.name}</span>
                                                </div>
                                                <span className="font-semibold text-primary text-sm">
                                                    {bucket.amount.toLocaleString()} KES
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                // Single amount display (backward compatibility)
                <div className="space-y-0.5 pt-2">
                    {Object.values(formData.bucketAmounts).map((bucket) => (
                        <div
                            key={bucket.id}
                            className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    bucket.isMandatory ? "bg-primary" : "bg-amber-400"
                                )} />
                                <span className="text-slate-700">{bucket.name}</span>
                            </div>

                            {editingAmount === bucket.id ? (
                                <Input
                                    type="number"
                                    autoFocus
                                    value={bucket.amount}
                                    onChange={(e) => updateBucketAmount(bucket.id, parseFloat(e.target.value) || 0)}
                                    onBlur={() => setEditingAmount(null)}
                                    onKeyDown={(e) => e.key === 'Enter' && setEditingAmount(null)}
                                    className="w-32 h-9 text-right font-semibold"
                                />
                            ) : (
                                <button
                                    onClick={() => setEditingAmount(bucket.id)}
                                    className="group flex items-center gap-2 hover:bg-slate-50 px-2 py-1 rounded transition-colors"
                                >
                                    <span className="font-semibold text-primary">
                                        {bucket.amount.toLocaleString()}
                                    </span>
                                    <Edit2 className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Total */}
            <div className="bg-gradient-to-r from-primary/10 to-primary-light/5 rounded-xl p-6 border-2 border-primary/30 mt-6">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-5xl font-bold text-primary">
                            {totalAmount.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-600 mt-2">
                            {hasTerms && hasTermSpecificAmounts
                                ? `KES total (${formData.terms?.length} terms)`
                                : 'KES per term'
                            }
                        </div>
                    </div>
                    {totalAmount !== mandatoryAmount && (
                        <div className="text-right">
                            <div className="text-xs text-slate-600">Required</div>
                            <div className="text-2xl font-bold text-slate-900">
                                {mandatoryAmount.toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* PDF Preview Link */}
            <div className="mt-6 pt-6 border-t border-slate-200">
                <Button
                    onClick={() => setShowPDFPreview(true)}
                    variant="outline"
                    size="sm"
                    className="border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
                >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview PDF
                </Button>
            </div>

            {/* PDF Preview Modal */}
            <Dialog open={showPDFPreview} onOpenChange={setShowPDFPreview}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Fee Structure Preview - {formData.name}
                            </DialogTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadPDF}
                                    className="border-primary/30 text-primary hover:bg-primary/5"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPDFPreview(false)}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="mt-4">
                        <FeeStructurePDFPreview
                            formData={convertToPDFForm()}
                            feeBuckets={formData.selectedBuckets.map(bucketId => {
                                // Try to get bucket from term-specific amounts first, then fallback to global
                                let bucket = null
                                if (hasTerms && hasTermSpecificAmounts && formData.terms && formData.terms.length > 0) {
                                    // Get bucket from first term (all terms should have same bucket names)
                                    const firstTerm = formData.terms[0]
                                    bucket = formData.termBucketAmounts?.[firstTerm.id]?.[bucketId]
                                }
                                if (!bucket) {
                                    bucket = formData.bucketAmounts[bucketId]
                                }
                                
                                return {
                                    id: bucketId,
                                    name: bucket?.name || 'Unknown',
                                    description: bucket?.name || ''
                                }
                            })}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
