'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step3ReviewProps {
    formData: {
        name: string
        grade: string
        boardingType: string
        academicYear: string
        bucketAmounts: Record<string, { id: string; name: string; amount: number; isMandatory: boolean }>
    }
    onChange: (field: string, value: any) => void
}

export const Step3Review = ({ formData, onChange }: Step3ReviewProps) => {
    const [editingField, setEditingField] = useState<string | null>(null)
    const [editingAmount, setEditingAmount] = useState<string | null>(null)

    const totalAmount = Object.values(formData.bucketAmounts).reduce((sum, b) => sum + b.amount, 0)
    const mandatoryAmount = Object.values(formData.bucketAmounts)
        .filter(b => b.isMandatory)
        .reduce((sum, b) => sum + b.amount, 0)

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

            {/* Total */}
            <div className="bg-gradient-to-r from-primary/10 to-primary-light/5 rounded-xl p-6 border-2 border-primary/30 mt-6">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-5xl font-bold text-primary">
                            {totalAmount.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-600 mt-2">KES per term</div>
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
        </div>
    )
}
