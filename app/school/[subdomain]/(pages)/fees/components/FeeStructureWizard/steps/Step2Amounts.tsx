'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Building2, Plus, Layers } from 'lucide-react'
import { BucketCreationModal } from '../../drawer/BucketCreationModal'

interface BucketAmount {
    id: string
    name: string
    amount: number
    isMandatory: boolean
}

interface Step2AmountsProps {
    formData: {
        boardingType: 'day' | 'boarding' | 'both'
        selectedBuckets: string[]
        bucketAmounts: Record<string, BucketAmount>
        terms?: Array<{ id: string; name: string }>
        termBucketAmounts?: Record<string, Record<string, BucketAmount>>
    }
    onChange: (field: string, value: any) => void
    errors?: Record<string, string>
}

export const Step2Amounts = ({ formData, onChange, errors }: Step2AmountsProps) => {
    const bucketAmounts = formData.bucketAmounts || {}
    const [showBucketModal, setShowBucketModal] = useState(false)
    const [isCreatingBucket, setIsCreatingBucket] = useState(false)
    const [bucketModalData, setBucketModalData] = useState({ name: '', description: '' })
    const [customBuckets, setCustomBuckets] = useState<Array<{ id: string; name: string; icon: any; amount: number }>>([])
    const [isLoadingBuckets, setIsLoadingBuckets] = useState(false)

    // Fetch existing buckets from API
    useEffect(() => {
        const fetchExistingBuckets = async () => {
            setIsLoadingBuckets(true)
            try {
                const response = await fetch('/api/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `
                            query GetFeeBuckets {
                                feeBuckets {
                                    id
                                    name
                                    description
                                    isActive
                                }
                            }
                        `,
                    }),
                })

                if (!response.ok) return

                const result = await response.json()
                if (result.errors || !result.data?.feeBuckets) return

                // Convert API buckets to custom buckets format
                const apiBuckets = result.data.feeBuckets
                    .filter((b: any) => b.isActive)
                    .map((b: any) => ({
                        id: b.id,
                        name: b.name,
                        icon: Building2,
                        amount: 0
                    }))

                setCustomBuckets(apiBuckets)
            } catch (error) {
                console.error('Error fetching buckets:', error)
            } finally {
                setIsLoadingBuckets(false)
            }
        }

        fetchExistingBuckets()
    }, [])

    // Note: No auto-selection - users must manually select buckets

    // Create fee bucket via GraphQL
    const createFeeBucket = async (bucketData: { name: string; description: string }) => {
        setIsCreatingBucket(true)
        try {
            const response = await fetch('/api/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        mutation CreateFeeBucket($input: CreateFeeBucketInput!) {
                            createFeeBucket(input: $input) {
                                id
                                name
                                description
                                isActive
                                createdAt
                            }
                        }
                    `,
                    variables: {
                        input: bucketData
                    }
                }),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            
            if (result.errors) {
                throw new Error(result.errors[0]?.message || 'Failed to create fee bucket')
            }

            // Add the new bucket to custom buckets list (avoid duplicates)
            const newBucket = {
                id: result.data.createFeeBucket.id,
                name: result.data.createFeeBucket.name,
                icon: Building2, // Default icon
                amount: 0
            }
            setCustomBuckets(prev => {
                // Check if bucket already exists
                if (prev.some(b => b.id === newBucket.id)) {
                    return prev
                }
                return [...prev, newBucket]
            })

            // Auto-select the newly created bucket
            const currentSelected = formData.selectedBuckets || []
            onChange('selectedBuckets', [...currentSelected, newBucket.id])

            // Reset modal
            setBucketModalData({ name: '', description: '' })
            setShowBucketModal(false)
            
            return result.data.createFeeBucket
        } catch (error) {
            console.error('Error creating fee bucket:', error)
            throw error
        } finally {
            setIsCreatingBucket(false)
        }
    }

    // Bulk create common buckets
    const handleBulkCreate = async () => {
        const commonBuckets = [
            { name: 'Tuition Fees', description: 'Academic tuition fees' },
            { name: 'Transportation', description: 'School transport fees' },
            { name: 'Meals & Catering', description: 'School meals and catering' },
            { name: 'Boarding Fees', description: 'Boarding accommodation fees' },
            { name: 'Activities', description: 'Extra-curricular activities' },
            { name: 'Development Fund', description: 'School development fund' }
        ]

        setIsCreatingBucket(true)
        try {
            const createdBuckets = []
            for (const bucket of commonBuckets) {
                try {
                    const response = await fetch('/api/graphql', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            query: `
                                mutation CreateFeeBucket($input: CreateFeeBucketInput!) {
                                    createFeeBucket(input: $input) {
                                        id
                                        name
                                        description
                                        isActive
                                        createdAt
                                    }
                                }
                            `,
                            variables: {
                                input: bucket
                            }
                        }),
                    })

                    if (!response.ok) continue

                    const result = await response.json()
                    if (result.errors) continue

                    const newBucket = {
                        id: result.data.createFeeBucket.id,
                        name: result.data.createFeeBucket.name,
                        icon: Building2,
                        amount: 0
                    }
                    setCustomBuckets(prev => {
                        // Check if bucket already exists
                        if (prev.some(b => b.id === newBucket.id)) {
                            return prev
                        }
                        return [...prev, newBucket]
                    })
                    createdBuckets.push(result.data.createFeeBucket)
                } catch (error) {
                    console.error(`Failed to create ${bucket.name}:`, error)
                }
            }
            
            // Auto-select all created buckets
            const newBucketIds = createdBuckets.map(b => b.id)
            const currentSelected = formData.selectedBuckets || []
            onChange('selectedBuckets', [...currentSelected, ...newBucketIds])
        } catch (error) {
            console.error('Error in bulk creation:', error)
        } finally {
            setIsCreatingBucket(false)
        }
    }

    // Get all available buckets (only from API)
    const getAllBuckets = () => {
        return customBuckets
    }

    const toggleBucket = (bucketId: string) => {
        const selected = formData.selectedBuckets || []
        const newSelected = selected.includes(bucketId)
            ? selected.filter(id => id !== bucketId)
            : [...selected, bucketId]
        onChange('selectedBuckets', newSelected)
    }

    const getBucketInfo = (bucketId: string) => {
        // Find the bucket from custom buckets
        const bucket = customBuckets.find(b => b.id === bucketId)
        if (bucket) {
            return { name: bucket.name, icon: bucket.icon, default: 0 }
        }
        // Fallback
        return { name: 'Unknown', icon: Building2, default: 0 }
    }

    const updateAmount = (bucketId: string, amount: number, termId?: string) => {
        const info = getBucketInfo(bucketId)
        
        if (termId && formData.terms && formData.terms.length > 0) {
            // Update term-specific amount
            const termAmounts = formData.termBucketAmounts || {}
            const bucketTermAmounts = termAmounts[termId] || {}
            
            onChange('termBucketAmounts', {
                ...termAmounts,
                [termId]: {
                    ...bucketTermAmounts,
                    [bucketId]: {
                        id: bucketId,
                        name: info.name,
                        amount,
                        isMandatory: bucketTermAmounts[bucketId]?.isMandatory ?? bucketAmounts[bucketId]?.isMandatory ?? true
                    }
                }
            })
        } else {
            // Update global amount (fallback for backward compatibility)
            onChange('bucketAmounts', {
                ...bucketAmounts,
                [bucketId]: {
                    id: bucketId,
                    name: info.name,
                    amount,
                    isMandatory: bucketAmounts[bucketId]?.isMandatory ?? true
                }
            })
        }
    }
    
    const getAmountForTerm = (bucketId: string, termId: string): number => {
        if (formData.termBucketAmounts?.[termId]?.[bucketId]) {
            return formData.termBucketAmounts[termId][bucketId].amount || 0
        }
        // Fallback to global amount
        return bucketAmounts[bucketId]?.amount || 0
    }
    
    const getTotalForTerm = (termId: string): number => {
        if (!formData.selectedBuckets) return 0
        // If termBucketAmounts exists for this term, use it; otherwise fallback to global bucketAmounts
        if (formData.termBucketAmounts?.[termId]) {
            return formData.selectedBuckets.reduce((sum, bucketId) => {
                return sum + getAmountForTerm(bucketId, termId)
            }, 0)
        }
        // Fallback to global amounts if term-specific amounts don't exist
        return formData.selectedBuckets.reduce((sum, bucketId) => {
            return sum + (bucketAmounts[bucketId]?.amount || 0)
        }, 0)
    }
    
    const getMandatoryTotalForTerm = (termId: string): number => {
        if (!formData.selectedBuckets) return 0
        // If termBucketAmounts exists for this term, use it; otherwise fallback to global bucketAmounts
        if (formData.termBucketAmounts?.[termId]) {
            return formData.selectedBuckets.reduce((sum, bucketId) => {
                const bucket = formData.termBucketAmounts?.[termId]?.[bucketId] || bucketAmounts[bucketId]
                if (bucket?.isMandatory) {
                    return sum + getAmountForTerm(bucketId, termId)
                }
                return sum
            }, 0)
        }
        // Fallback to global amounts
        return formData.selectedBuckets.reduce((sum, bucketId) => {
            const bucket = bucketAmounts[bucketId]
            if (bucket?.isMandatory) {
                return sum + (bucket.amount || 0)
            }
            return sum
        }, 0)
    }

    const updateMandatory = (bucketId: string, isMandatory: boolean) => {
        const info = getBucketInfo(bucketId)
        onChange('bucketAmounts', {
            ...bucketAmounts,
            [bucketId]: {
                id: bucketId,
                name: info.name,
                amount: bucketAmounts[bucketId]?.amount || info.default,
                isMandatory
            }
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
            e.preventDefault()
            const inputs = document.querySelectorAll<HTMLInputElement>('input[type="number"]')
            const nextIndex = (index + 1) % inputs.length
            inputs[nextIndex]?.focus()
        }
    }

    // Calculate totals - if terms exist, show per-term totals, otherwise show global total
    const hasTerms = formData.terms && formData.terms.length > 0
    const totalAmount = hasTerms 
        ? (formData.terms?.reduce((sum, term) => sum + getTotalForTerm(term.id), 0) || 0)
        : Object.values(bucketAmounts).reduce((sum, b) => sum + (b.amount || 0), 0)
    const mandatoryAmount = hasTerms
        ? (formData.terms?.reduce((sum, term) => sum + getMandatoryTotalForTerm(term.id), 0) || 0)
        : Object.values(bucketAmounts)
            .filter(b => b.isMandatory)
            .reduce((sum, b) => sum + (b.amount || 0), 0)

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 block">
                    Select Fee Components
                </label>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkCreate}
                        disabled={isCreatingBucket}
                        className="text-xs"
                    >
                        <Layers className="h-3.5 w-3.5 mr-1.5" />
                        Bulk Create
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBucketModal(true)}
                        className="text-xs"
                    >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Create Bucket
                    </Button>
                </div>
            </div>
            {errors?.selectedBuckets && (
                <p className="text-sm text-red-600 mb-2">{errors.selectedBuckets}</p>
            )}
            
            {/* Bucket Selection Grid */}
            <div>
                {isLoadingBuckets ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        Loading buckets...
                    </div>
                ) : getAllBuckets().length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                        <p className="text-slate-600 mb-3">No fee buckets available</p>
                        <p className="text-sm text-slate-500 mb-4">Create your first bucket to get started</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowBucketModal(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Bucket
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {getAllBuckets().map((bucket) => {
                        const Icon = bucket.icon
                        const isSelected = (formData.selectedBuckets || []).includes(bucket.id)

                        return (
                            <button
                                key={bucket.id}
                                type="button"
                                onClick={() => toggleBucket(bucket.id)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                                    isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-slate-200 hover:border-slate-300"
                                )}
                            >
                                <Icon className={cn(
                                    "h-5 w-5 flex-shrink-0",
                                    isSelected ? "text-primary" : "text-slate-400"
                                )} />
                                <div className="flex-1 min-w-0">
                                    <div className={cn(
                                        "text-sm font-medium truncate",
                                        isSelected ? "text-primary" : "text-slate-700"
                                    )}>
                                        {bucket.name}
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        )
                    })}
                    </div>
                )}
            </div>

            {/* Bucket Creation Modal */}
            <BucketCreationModal
                isOpen={showBucketModal}
                onClose={() => {
                    setShowBucketModal(false)
                    setBucketModalData({ name: '', description: '' })
                }}
                bucketData={bucketModalData}
                isCreating={isCreatingBucket}
                onChange={setBucketModalData}
                onCreateBucket={async () => {
                    if (bucketModalData.name.trim()) {
                        try {
                            await createFeeBucket({
                                name: bucketModalData.name.trim(),
                                description: bucketModalData.description.trim()
                            })
                        } catch (error) {
                            // Error is already logged in createFeeBucket
                        }
                    }
                }}
            />

            {/* Amount Entry - Only show if buckets are selected */}
            {formData.selectedBuckets?.length > 0 && (
                <>
                    <div className="border-t pt-6">
                        <label className="text-sm font-medium text-slate-700 mb-3 block">
                            Set Fee Amounts {hasTerms && `(per term)`}
                        </label>
                        
                        {hasTerms ? (
                            // Term-specific amounts table
                            <div className="overflow-x-auto">
                                <div className="min-w-full">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-2 text-sm font-medium text-slate-700">Fee Component</th>
                                                {formData.terms?.map(term => (
                                                    <th key={term.id} className="text-center py-3 px-2 text-sm font-medium text-slate-700 min-w-[140px]">
                                                        {term.name}
                                                    </th>
                                                ))}
                                                <th className="text-center py-3 px-2 text-sm font-medium text-slate-700 w-24">Required</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.selectedBuckets.map((bucketId, rowIndex) => {
                                                const info = getBucketInfo(bucketId)
                                                const Icon = info.icon
                                                const bucket = bucketAmounts[bucketId] || {
                                                    id: bucketId,
                                                    name: info.name,
                                                    amount: 0,
                                                    isMandatory: true
                                                }

                                                return (
                                                    <tr key={bucketId} className="border-b hover:bg-slate-50">
                                                        <td className="py-3 px-2">
                                                            <div className="flex items-center gap-2">
                                                                <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                                                                <span className="font-medium text-slate-900 text-sm">
                                                                    {info.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        {formData.terms?.map((term, termIndex) => {
                                                            const amount = getAmountForTerm(bucketId, term.id)
                                                            return (
                                                                <td key={term.id} className="py-3 px-2">
                                                                    <div className="relative">
                                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                                                                            KES
                                                                        </span>
                                                                        <Input
                                                                            type="number"
                                                                            value={amount || ''}
                                                                            onChange={(e) => updateAmount(bucketId, parseFloat(e.target.value) || 0, term.id)}
                                                                            onKeyDown={(e) => handleKeyDown(e, rowIndex * (formData.terms?.length || 1) + termIndex)}
                                                                            placeholder="0"
                                                                            className={cn(
                                                                                "pl-10 h-9 text-right font-semibold text-sm",
                                                                                amount > 0 ? "text-primary" : "text-slate-400"
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </td>
                                                            )
                                                        })}
                                                        <td className="py-3 px-2">
                                                            <div className="flex items-center justify-center">
                                                                <Switch
                                                                    checked={bucket.isMandatory}
                                                                    onCheckedChange={(checked) => updateMandatory(bucketId, checked)}
                                                                    className="data-[state=checked]:bg-primary"
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                            {/* Totals row */}
                                            <tr className="bg-slate-50 font-semibold">
                                                <td className="py-3 px-2 text-slate-700">Total</td>
                                                {formData.terms?.map(term => {
                                                    const termTotal = getTotalForTerm(term.id)
                                                    const mandatoryTotal = getMandatoryTotalForTerm(term.id)
                                                    return (
                                                        <td key={term.id} className="py-3 px-2 text-center">
                                                            <div className="text-primary text-sm">
                                                                {termTotal.toLocaleString()}
                                                            </div>
                                                            {termTotal !== mandatoryTotal && (
                                                                <div className="text-xs text-slate-600 mt-1">
                                                                    Required: {mandatoryTotal.toLocaleString()}
                                                                </div>
                                                            )}
                                                        </td>
                                                    )
                                                })}
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            // Single amount per bucket (no terms)
                            <div className="space-y-1">
                                {formData.selectedBuckets.map((bucketId, index) => {
                                    const info = getBucketInfo(bucketId)
                                    const bucket = bucketAmounts[bucketId] || {
                                        id: bucketId,
                                        name: info.name,
                                        amount: info.default,
                                        isMandatory: true
                                    }
                                    const Icon = info.icon

                                    return (
                                        <div
                                            key={bucketId}
                                            className="flex items-center gap-4 hover:bg-slate-50 -mx-2 px-2 py-2.5 rounded-lg transition-colors"
                                        >
                                            <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                                            <span className="font-medium text-slate-900 text-sm flex-1 min-w-0 truncate">
                                                {info.name}
                                            </span>

                                            <div className="relative w-40">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                                                    KES
                                                </span>
                                                <Input
                                                    type="number"
                                                    value={bucket.amount || ''}
                                                    onChange={(e) => updateAmount(bucketId, parseFloat(e.target.value) || 0)}
                                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                                    placeholder="0"
                                                    className={cn(
                                                        "pl-12 h-10 text-right font-semibold",
                                                        bucket.amount > 0 ? "text-primary" : "text-slate-400"
                                                    )}
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={bucket.isMandatory}
                                                    onCheckedChange={(checked) => updateMandatory(bucketId, checked)}
                                                    className="data-[state=checked]:bg-primary"
                                                />
                                                <span className="text-xs text-slate-600 w-16">
                                                    {bucket.isMandatory ? 'Required' : 'Optional'}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    {errors?.bucketAmounts && (
                        <p className="text-sm text-red-600 mt-2">{errors.bucketAmounts}</p>
                    )}

                    {/* Total Summary - Enhanced */}
                    {hasTerms && formData.terms && formData.terms.length > 0 ? (
                        <div className="space-y-3">
                            {/* Per-term breakdown */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {formData.terms.map((term) => {
                                    const termTotal = getTotalForTerm(term.id)
                                    return (
                                        <div key={term.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                            <div className="text-xs font-medium text-slate-600 mb-1">{term.name}</div>
                                            <div className="text-lg font-bold text-primary">
                                                {termTotal.toLocaleString()} KES
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            
                            {/* Grand Total */}
                            <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 rounded-lg p-5 border-2 border-primary shadow-md">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-1">
                                            Grand Total
                                        </div>
                                        <div className="text-5xl font-bold text-white">
                                            {formData.terms.reduce((sum, term) => sum + getTotalForTerm(term.id), 0).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-white/80 font-medium mt-1">
                                            KES across {formData.terms.length} term{formData.terms.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                    {(() => {
                                        const grandMandatory = formData.terms.reduce((sum, term) => sum + getMandatoryTotalForTerm(term.id), 0)
                                        const grandTotal = formData.terms.reduce((sum, term) => sum + getTotalForTerm(term.id), 0)
                                        return grandTotal !== grandMandatory ? (
                                            <div className="text-right bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                                                <div className="text-xs text-white/90 font-medium">Required</div>
                                                <div className="text-2xl font-bold text-white">
                                                    {grandMandatory.toLocaleString()}
                                                </div>
                                            </div>
                                        ) : null
                                    })()}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-primary/10 rounded-lg p-5 border-2 border-primary/30">
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-4xl font-bold text-primary">
                                        {totalAmount.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-slate-600 mt-1">
                                        KES per term
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
                    )}
                </>
            )}
        </div>
    )
}
