'use client'

import { CheckCircle, Edit2, ChevronDown, ChevronRight, Sparkles, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Step4ReviewProps {
    formData: {
        name: string
        grade: string
        boardingType: string
        academicYear: string
        selectedBuckets: string[]
        bucketAmounts: Record<string, { id: string; name: string; amount: number; isMandatory: boolean }>
    }
    onEdit: (step: number) => void
}

export const Step4Review = ({ formData, onEdit }: Step4ReviewProps) => {
    const [expandedSections, setExpandedSections] = useState<string[]>(['buckets'])

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        )
    }

    const totalAmount = Object.values(formData.bucketAmounts).reduce((sum, bucket) => sum + bucket.amount, 0)
    const mandatoryAmount = Object.values(formData.bucketAmounts)
        .filter(b => b.isMandatory)
        .reduce((sum, bucket) => sum + bucket.amount, 0)
    const optionalAmount = totalAmount - mandatoryAmount

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Success Header */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary-light/5 to-white border-2 border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
                <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                        <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-primary mb-2">Review Your Fee Structure</h3>
                        <p className="text-slate-600">
                            Please review all the details before saving. You can edit any section by clicking the edit button.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Basic Information */}
            <Card>
                <div
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => toggleSection('basic')}
                >
                    <div className="flex items-center gap-3">
                        {expandedSections.includes('basic') ? (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                        )}
                        <h4 className="font-semibold text-lg text-slate-900">Basic Information</h4>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit(1)
                        }}
                        className="text-primary hover:bg-primary/5"
                    >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                </div>

                {expandedSections.includes('basic') && (
                    <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Structure Name</div>
                                <div className="font-medium text-slate-900">{formData.name}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Grade/Form</div>
                                <div className="font-medium text-slate-900">{formData.grade}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Boarding Type</div>
                                <div className="font-medium text-slate-900">
                                    {formData.boardingType === 'both' ? 'Day & Boarding' :
                                        formData.boardingType === 'day' ? 'Day Students' : 'Boarding Students'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Academic Year</div>
                                <div className="font-medium text-slate-900">{formData.academicYear}</div>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Fee Buckets */}
            <Card>
                <div
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => toggleSection('buckets')}
                >
                    <div className="flex items-center gap-3">
                        {expandedSections.includes('buckets') ? (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                        )}
                        <h4 className="font-semibold text-lg text-slate-900">Fee Components</h4>
                        <Badge className="bg-primary text-white">
                            {Object.keys(formData.bucketAmounts).length} items
                        </Badge>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit(3)
                        }}
                        className="text-primary hover:bg-primary/5"
                    >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit Amounts
                    </Button>
                </div>

                {expandedSections.includes('buckets') && (
                    <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-5">
                        {Object.values(formData.bucketAmounts).map((bucket) => (
                            <div
                                key={bucket.id}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        bucket.isMandatory ? "bg-primary" : "bg-amber-400"
                                    )} />
                                    <div>
                                        <div className="font-medium text-slate-900">{bucket.name}</div>
                                        <div className="text-xs text-slate-500">
                                            {bucket.isMandatory ? 'Mandatory' : 'Optional'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-primary">
                                        KES {bucket.amount.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Total Summary - Always Visible */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary-light/5 border-2 border-primary/30">
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-primary/20">
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <h4 className="font-bold text-lg text-slate-900">Total Fee Structure</h4>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-primary">
                                KES {totalAmount.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">per term</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-lg">
                            <div className="text-sm text-slate-600 mb-1">Mandatory Fees</div>
                            <div className="text-xl font-bold text-slate-900">
                                KES {mandatoryAmount.toLocaleString()}
                            </div>
                        </div>
                        {optionalAmount > 0 && (
                            <div className="p-4 bg-white rounded-lg">
                                <div className="text-sm text-slate-600 mb-1">Optional Fees</div>
                                <div className="text-xl font-bold text-amber-600">
                                    KES {optionalAmount.toLocaleString()}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-primary/20">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span>
                                This fee structure includes {Object.keys(formData.bucketAmounts).length} fee component{Object.keys(formData.bucketAmounts).length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Action Buttons */}
            <Card className="p-5 bg-slate-50 border-slate-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-lg">📋</span>
                        <span>Ready to save this fee structure?</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/30 text-primary hover:bg-primary/5"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Summary
                    </Button>
                </div>
            </Card>
        </div>
    )
}
