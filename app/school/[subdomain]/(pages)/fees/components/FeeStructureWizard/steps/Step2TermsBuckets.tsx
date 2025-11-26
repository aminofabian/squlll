'use client'

import { Plus, Sparkles, School, Bus, Utensils, Home, Activity, Building2, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface BucketTemplate {
    id: string
    name: string
    icon: any
    description: string
    estimatedAmount: number
    components: { name: string; amount: number }[]
}

interface Step2TermsBucketsProps {
    formData: {
        grade: string
        boardingType: string
        selectedBuckets: string[]
    }
    onChange: (field: string, value: any) => void
    errors?: Record<string, string>
}

const bucketTemplates: BucketTemplate[] = [
    {
        id: 'tuition',
        name: 'Tuition & Academic',
        icon: School,
        description: 'Core academic instruction and educational services',
        estimatedAmount: 22500,
        components: [
            { name: 'Tuition Fees', amount: 18000 },
            { name: 'Library Fees', amount: 2000 },
            { name: 'Computer Lab', amount: 1500 },
            { name: 'Examination Fees', amount: 1000 }
        ]
    },
    {
        id: 'transport',
        name: 'Transportation',
        icon: Bus,
        description: 'School bus and transportation services',
        estimatedAmount: 8500,
        components: [
            { name: 'Bus Fees', amount: 8000 },
            { name: 'Fuel Surcharge', amount: 500 }
        ]
    },
    {
        id: 'meals',
        name: 'Meals & Catering',
        icon: Utensils,
        description: 'School meals and catering services',
        estimatedAmount: 15000,
        components: [
            { name: 'Lunch Fees', amount: 12000 },
            { name: 'Snack Fees', amount: 3000 }
        ]
    },
    {
        id: 'boarding',
        name: 'Boarding & Accommodation',
        icon: Home,
        description: 'Residential and accommodation services',
        estimatedAmount: 36000,
        components: [
            { name: 'Boarding Fees', amount: 25000 },
            { name: 'Laundry Service', amount: 3000 },
            { name: 'Evening Meals', amount: 8000 }
        ]
    },
    {
        id: 'activities',
        name: 'Co-curricular Activities',
        icon: Activity,
        description: 'Sports, clubs, and extracurricular activities',
        estimatedAmount: 9000,
        components: [
            { name: 'Sports Fees', amount: 4000 },
            { name: 'Music & Arts', amount: 3000 },
            { name: 'Clubs & Societies', amount: 2000 }
        ]
    },
    {
        id: 'development',
        name: 'Development Fund',
        icon: Building2,
        description: 'School development and infrastructure',
        estimatedAmount: 10000,
        components: [
            { name: 'Building Fund', amount: 5000 },
            { name: 'Equipment Fund', amount: 3000 },
            { name: 'Technology Fund', amount: 2000 }
        ]
    }
]

export const Step2TermsBuckets = ({ formData, onChange, errors }: Step2TermsBucketsProps) => {
    const selectedBuckets = formData.selectedBuckets || []

    const toggleBucket = (bucketId: string) => {
        const newSelected = selectedBuckets.includes(bucketId)
            ? selectedBuckets.filter(id => id !== bucketId)
            : [...selectedBuckets, bucketId]
        onChange('selectedBuckets', newSelected)
    }

    const addAllSuggested = () => {
        const suggested = bucketTemplates
            .filter(bucket => {
                if (bucket.id === 'boarding') return formData.boardingType === 'boarding' || formData.boardingType === 'both'
                if (bucket.id === 'transport' || bucket.id === 'meals') return formData.boardingType === 'day' || formData.boardingType === 'both'
                return true
            })
            .map(bucket => bucket.id)
        onChange('selectedBuckets', suggested)
    }

    const totalEstimated = bucketTemplates
        .filter(bucket => selectedBuckets.includes(bucket.id))
        .reduce((sum, bucket) => sum + bucket.estimatedAmount, 0)

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header with Quick Action */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-primary mb-1">Select Fee Components</h3>
                    <p className="text-sm text-slate-600">
                        Choose which fee categories apply to this structure
                    </p>
                </div>
                <Button
                    onClick={addAllSuggested}
                    className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white shadow-md"
                >
                    <Zap className="h-4 w-4 mr-2" />
                    Add All Suggested
                </Button>
            </div>

            {/* Bucket Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bucketTemplates.map((bucket) => {
                    const isSelected = selectedBuckets.includes(bucket.id)
                    const Icon = bucket.icon

                    return (
                        <button
                            key={bucket.id}
                            type="button"
                            onClick={() => toggleBucket(bucket.id)}
                            className={cn(
                                "group relative p-5 rounded-xl border-2 transition-all duration-300 text-left overflow-hidden",
                                isSelected
                                    ? "border-primary bg-gradient-to-br from-primary/10 to-primary-light/5 shadow-lg shadow-primary/20"
                                    : "border-slate-200 hover:border-primary/40 hover:shadow-md bg-white"
                            )}
                        >
                            {/* Background Decoration */}
                            <div className={cn(
                                "absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl transition-opacity",
                                isSelected ? "opacity-20 bg-primary" : "opacity-0"
                            )} />

                            {/* Content */}
                            <div className="relative z-10">
                                {/* Icon and Badge */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className={cn(
                                        "h-12 w-12 rounded-lg flex items-center justify-center transition-all duration-300",
                                        isSelected ? "bg-primary text-white shadow-md" : "bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary"
                                    )}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    {isSelected && (
                                        <Badge className="bg-primary text-white animate-in fade-in zoom-in duration-300">
                                            ✓ Added
                                        </Badge>
                                    )}
                                </div>

                                {/* Title */}
                                <h4 className={cn(
                                    "font-bold text-base mb-2 transition-colors",
                                    isSelected ? "text-primary" : "text-slate-900"
                                )}>
                                    {bucket.name}
                                </h4>

                                {/* Description */}
                                <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                                    {bucket.description}
                                </p>

                                {/* Components Preview */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {bucket.components.slice(0, 2).map((comp, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                            {comp.name}
                                        </Badge>
                                    ))}
                                    {bucket.components.length > 2 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{bucket.components.length - 2}
                                        </Badge>
                                    )}
                                </div>

                                {/* Amount */}
                                <div className={cn(
                                    "text-sm font-bold transition-colors",
                                    isSelected ? "text-primary" : "text-slate-700"
                                )}>
                                    KES {bucket.estimatedAmount.toLocaleString()}
                                    <span className="text-xs font-normal text-slate-500 ml-1">estimated</span>
                                </div>
                            </div>

                            {/* Hover Effect */}
                            {!isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary-light/0 group-hover:from-primary/5 group-hover:to-primary-light/5 transition-all duration-300 rounded-xl" />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Selection Summary */}
            {selectedBuckets.length > 0 && (
                <Card className="p-5 bg-gradient-to-r from-primary/5 to-primary-light/5 border-2 border-primary/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <div className="font-semibold text-slate-900">
                                    {selectedBuckets.length} fee component{selectedBuckets.length !== 1 ? 's' : ''} selected
                                </div>
                                <div className="text-sm text-slate-600">
                                    You can adjust amounts in the next step
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                                KES {totalEstimated.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-600">Total estimated</div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Error Message */}
            {errors?.selectedBuckets && (
                <Card className="p-4 bg-red-50 border-2 border-red-200">
                    <p className="text-sm text-red-600">{errors.selectedBuckets}</p>
                </Card>
            )}

            {/* Empty State */}
            {selectedBuckets.length === 0 && (
                <Card className="p-8 border-2 border-dashed border-slate-300">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                            <Plus className="h-8 w-8 text-slate-400" />
                        </div>
                        <h4 className="font-semibold text-slate-900 mb-2">No fee components selected yet</h4>
                        <p className="text-sm text-slate-600 mb-4">
                            Click on the cards above to add fee components, or use the "Add All Suggested" button for quick setup
                        </p>
                    </div>
                </Card>
            )}
        </div>
    )
}
