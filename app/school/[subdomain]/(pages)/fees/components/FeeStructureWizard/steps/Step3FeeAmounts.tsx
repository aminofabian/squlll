'use client'

import { Coins, Copy, AlertCircle, Calculator } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface BucketAmount {
    id: string
    name: string
    amount: number
    isMandatory: boolean
}

interface Step3FeeAmountsProps {
    formData: {
        selectedBuckets: string[]
        bucketAmounts: Record<string, BucketAmount>
    }
    onChange: (field: string, value: any) => void
    errors?: Record<string, string>
}

const defaultAmounts: Record<string, number> = {
    tuition: 22500,
    transport: 8500,
    meals: 15000,
    boarding: 36000,
    activities: 9000,
    development: 10000
}

const bucketNames: Record<string, string> = {
    tuition: 'Tuition & Academic',
    transport: 'Transportation',
    meals: 'Meals & Catering',
    boarding: 'Boarding & Accommodation',
    activities: 'Co-curricular Activities',
    development: 'Development Fund'
}

export const Step3FeeAmounts = ({ formData, onChange, errors }: Step3FeeAmountsProps) => {
    const bucketAmounts = formData.bucketAmounts || {}

    const updateAmount = (bucketId: string, amount: number) => {
        onChange('bucketAmounts', {
            ...bucketAmounts,
            [bucketId]: {
                ...bucketAmounts[bucketId],
                id: bucketId,
                name: bucketNames[bucketId],
                amount,
                isMandatory: bucketAmounts[bucketId]?.isMandatory ?? true
            }
        })
    }

    const updateMandatory = (bucketId: string, isMandatory: boolean) => {
        onChange('bucketAmounts', {
            ...bucketAmounts,
            [bucketId]: {
                ...bucketAmounts[bucketId],
                id: bucketId,
                name: bucketNames[bucketId],
                amount: bucketAmounts[bucketId]?.amount || defaultAmounts[bucketId] || 0,
                isMandatory
            }
        })
    }

    const copyFromDefaults = () => {
        const newAmounts: Record<string, BucketAmount> = {}
        formData.selectedBuckets.forEach(bucketId => {
            newAmounts[bucketId] = {
                id: bucketId,
                name: bucketNames[bucketId],
                amount: defaultAmounts[bucketId] || 0,
                isMandatory: true
            }
        })
        onChange('bucketAmounts', newAmounts)
    }

    const totalAmount = Object.values(bucketAmounts).reduce((sum, bucket) => sum + (bucket.amount || 0), 0)
    const mandatoryAmount = Object.values(bucketAmounts)
        .filter(bucket => bucket.isMandatory)
        .reduce((sum, bucket) => sum + (bucket.amount || 0), 0)

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-primary mb-1">Set Fee Amounts</h3>
                    <p className="text-sm text-slate-600">
                        Enter the specific amounts for each fee component
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={copyFromDefaults}
                    className="border-primary/30 text-primary hover:bg-primary/5"
                >
                    <Copy className="h-4 w-4 mr-2" />
                    Use Suggested Amounts
                </Button>
            </div>

            {/* Amount Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.selectedBuckets.map((bucketId) => {
                    const bucket = bucketAmounts[bucketId] || {
                        id: bucketId,
                        name: bucketNames[bucketId],
                        amount: 0,
                        isMandatory: true
                    }

                    return (
                        <Card key={bucketId} className={cn(
                            "p-5 transition-all duration-300",
                            bucket.amount > 0 ? "border-primary/30 bg-primary/5" : "border-slate-200"
                        )}>
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-base text-slate-900 mb-1">
                                            {bucket.name}
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            Suggested: KES {defaultAmounts[bucketId]?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`mandatory-${bucketId}`} className="text-xs text-slate-600">
                                            {bucket.isMandatory ? 'Mandatory' : 'Optional'}
                                        </Label>
                                        <Switch
                                            id={`mandatory-${bucketId}`}
                                            checked={bucket.isMandatory}
                                            onCheckedChange={(checked) => updateMandatory(bucketId, checked)}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </div>
                                </div>

                                {/* Amount Input */}
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                        KES
                                    </div>
                                    <Input
                                        type="number"
                                        value={bucket.amount || ''}
                                        onChange={(e) => updateAmount(bucketId, parseFloat(e.target.value) || 0)}
                                        placeholder="0"
                                        className={cn(
                                            "pl-14 h-14 text-2xl font-bold text-center",
                                            bucket.amount > 0 ? "border-primary text-primary" : ""
                                        )}
                                    />
                                </div>

                                {/* Quick Amount Buttons */}
                                <div className="flex gap-2">
                                    {[0.5, 0.75, 1, 1.25].map((multiplier) => (
                                        <Button
                                            key={multiplier}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateAmount(bucketId, Math.round((defaultAmounts[bucketId] || 0) * multiplier))}
                                            className="flex-1 text-xs h-8"
                                        >
                                            {multiplier === 1 ? 'Default' : `${multiplier * 100}%`}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Total Summary */}
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary-light/5 border-2 border-primary/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center">
                            <Calculator className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <div className="text-sm text-slate-600 mb-1">Total Fee Structure</div>
                            <div className="text-3xl font-bold text-primary">
                                KES {totalAmount.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-600 mb-1">Mandatory Fees</div>
                        <div className="text-xl font-bold text-slate-900">
                            KES {mandatoryAmount.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Breakdown */}
                {totalAmount !== mandatoryAmount && (
                    <div className="mt-4 pt-4 border-t border-primary/20">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Optional Fees</span>
                            <span className="font-semibold text-slate-900">
                                KES {(totalAmount - mandatoryAmount).toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}
            </Card>

            {/* Validation Error */}
            {errors?.bucketAmounts && (
                <Card className="p-4 bg-amber-50 border-2 border-amber-200">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <p className="text-sm text-amber-800">{errors.bucketAmounts}</p>
                    </div>
                </Card>
            )}

            {/* Help Text */}
            <Card className="p-4 bg-slate-50 border-slate-200">
                <div className="flex items-start gap-3">
                    <div className="text-xl">💡</div>
                    <div className="text-sm text-slate-600">
                        <span className="font-semibold">Tips:</span> You can mark fees as optional for students who don't need them.
                        Use the quick buttons below each amount for common adjustments.
                    </div>
                </div>
            </Card>
        </div>
    )
}
