'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Building2, Plus, Layers, Copy } from 'lucide-react'
import { BucketCreationModal } from '../../drawer/BucketCreationModal'
import type { FeesSetupWizardResult } from '../../FeesSetupWizardDialog'
import {
    buildBucketPrefillFromDraft,
    distributeTermTotalToBuckets,
    getDraftTermTotal,
    getRepresentativeTermTotal,
    gradesWithFeesInDraft,
} from '../../../lib/feesSetupDraft'
import { roundToNearestTen } from '../../../lib/feesAmounts'
import { CategorySplitEditor } from '../../CategorySplitEditor'
import { initSplitsForCategories } from '../../../lib/categorySplits'
import {
    FeesAmountTable,
    FeesWizardSection,
    feesTableCellLabel,
    feesTableHead,
    feesTableRowTotal,
    feesTableThFirst,
    feesTableThTerm,
} from '../FeesWizardLayout'

interface BucketAmount {
    id: string
    name: string
    amount: number
    isMandatory: boolean
    /** Optional GraphQL item id (used when updating existing bucket items) */
    itemId?: string
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
    setupDraft?: FeesSetupWizardResult | null
    /** From guided setup — buckets are auto-created; hide manual bucket UI */
    guidedSetupMode?: boolean
}

export const Step2Amounts = ({ formData, onChange, errors, setupDraft, guidedSetupMode = false }: Step2AmountsProps) => {
    const bucketAmounts = formData.bucketAmounts || {}
    const [showBucketModal, setShowBucketModal] = useState(false)
    const [isCreatingBucket, setIsCreatingBucket] = useState(false)
    const [bucketModalData, setBucketModalData] = useState({ name: '', description: '' })
    const [customBuckets, setCustomBuckets] = useState<Array<{ id: string; name: string; icon: any; amount: number }>>([])
    const [isLoadingBuckets, setIsLoadingBuckets] = useState(false)
    const [draftApplied, setDraftApplied] = useState(false)
    const [showSplitEditor, setShowSplitEditor] = useState(false)
    const [draftSplits, setDraftSplits] = useState<Record<string, number>>({})
    /** Local input text while typing — commit on blur to avoid rounding/redistribute per keystroke */
    const [termTotalDrafts, setTermTotalDrafts] = useState<Record<string, string>>({})
    const [amountDrafts, setAmountDrafts] = useState<Record<string, string>>({})
    const [globalTotalDraft, setGlobalTotalDraft] = useState<string | null>(null)
    const [showGuidedAmountEditor, setShowGuidedAmountEditor] = useState(false)

    const parseAmountInput = (raw: string): number => {
        const cleaned = raw.replace(/,/g, '').trim()
        if (cleaned === '' || cleaned === '-') return 0
        const n = Number(cleaned)
        return Number.isFinite(n) ? n : 0
    }

    const lineDraftKey = (bucketId: string, termId?: string) =>
        termId ? `${termId}:${bucketId}` : `_global:${bucketId}`

    const clearAmountDraftsForTerm = (termId: string) => {
        setAmountDrafts((prev) => {
            const next = { ...prev }
            for (const key of Object.keys(next)) {
                if (key.startsWith(`${termId}:`)) delete next[key]
            }
            return next
        })
    }

    useEffect(() => {
        if (!setupDraft?.categories?.length) return
        setDraftSplits(
            initSplitsForCategories(
                setupDraft.categories,
                setupDraft.categorySplits,
            ),
        )
    }, [setupDraft])

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

    useEffect(() => {
        if (
            !setupDraft ||
            draftApplied ||
            customBuckets.length === 0 ||
            !formData.terms?.length
        ) {
            return
        }
        if (formData.selectedBuckets.length > 0) {
            setDraftApplied(true)
            return
        }

        const prefill = buildBucketPrefillFromDraft(
            setupDraft,
            customBuckets.map((b) => ({ id: b.id, name: b.name })),
            formData.terms,
            setupDraft ? gradesWithFeesInDraft(setupDraft)[0] : undefined,
        )

        if (prefill.selectedBuckets.length === 0) return

        onChange('selectedBuckets', prefill.selectedBuckets)
        onChange('bucketAmounts', prefill.bucketAmounts)
        onChange('termBucketAmounts', prefill.termBucketAmounts)
        setDraftApplied(true)
        setTermTotalDrafts({})
        setAmountDrafts({})
        setGlobalTotalDraft(null)
    }, [
        setupDraft,
        draftApplied,
        customBuckets,
        formData.terms,
        formData.selectedBuckets.length,
        onChange,
    ])

    const getSplitsForDistribution = () =>
        Object.keys(draftSplits).length > 0
            ? draftSplits
            : setupDraft?.categorySplits

    const buildBucketsInfo = () => {
        const info: Record<
            string,
            { id: string; name: string; isMandatory?: boolean }
        > = {}
        for (const bucketId of formData.selectedBuckets || []) {
            const b = bucketAmounts[bucketId]
            const meta = getBucketInfo(bucketId)
            info[bucketId] = {
                id: bucketId,
                name: b?.name || meta.name,
                isMandatory: b?.isMandatory ?? true,
            }
        }
        return info
    }

    const applyTermTotal = (termId: string, total: number) => {
        const bucketIds = formData.selectedBuckets || []
        if (bucketIds.length === 0) return

        const distributed = distributeTermTotalToBuckets(
            total,
            bucketIds,
            buildBucketsInfo(),
            setupDraft?.categories ?? [],
            getSplitsForDistribution(),
        )

        const existingTerm = formData.termBucketAmounts?.[termId] || {}
        const merged = Object.fromEntries(
            Object.entries(distributed).map(([bid, row]) => [
                bid,
                {
                    ...row,
                    itemId: existingTerm[bid]?.itemId ?? formData.bucketAmounts[bid]?.itemId,
                },
            ]),
        )

        const termAmounts = formData.termBucketAmounts || {}
        onChange('termBucketAmounts', {
            ...termAmounts,
            [termId]: merged,
        })
        clearAmountDraftsForTerm(termId)
    }

    const commitTermTotal = (termId: string) => {
        const raw = termTotalDrafts[termId]
        if (raw === undefined) return
        applyTermTotal(termId, parseAmountInput(raw))
        setTermTotalDrafts((prev) => {
            const next = { ...prev }
            delete next[termId]
            return next
        })
    }

    const applyDraftSplits = (splits: Record<string, number>) => {
        if (!setupDraft || customBuckets.length === 0 || !formData.terms?.length) return
        setDraftSplits(splits)
        const draftWithSplits: FeesSetupWizardResult = {
            ...setupDraft,
            categorySplits: splits,
        }
        const prefill = buildBucketPrefillFromDraft(
            draftWithSplits,
            customBuckets.map((b) => ({ id: b.id, name: b.name })),
            formData.terms,
            gradesWithFeesInDraft(setupDraft)[0],
        )
        if (prefill.selectedBuckets.length === 0) return
        onChange('selectedBuckets', prefill.selectedBuckets)
        onChange('bucketAmounts', prefill.bucketAmounts)
        onChange('termBucketAmounts', prefill.termBucketAmounts)
        setDraftApplied(true)
    }

    const sortedTerms = [...(formData.terms || [])].sort((a, b) => {
        const n = (name: string) => {
            const m = name.match(/\d+/)
            return m ? parseInt(m[0], 10) : 999
        }
        return n(a.name) - n(b.name)
    })

    const copyTerm1ToAllTerms = () => {
        if (sortedTerms.length < 2) return
        const firstTermId = sortedTerms[0].id
        const raw =
            termTotalDrafts[firstTermId] !== undefined
                ? parseAmountInput(termTotalDrafts[firstTermId])
                : getTotalForTerm(firstTermId)
        if (raw <= 0) return
        const total = roundToNearestTen(raw)
        for (let i = 1; i < sortedTerms.length; i++) {
            applyTermTotal(sortedTerms[i].id, total)
        }
        setTermTotalDrafts({})
        setAmountDrafts({})
    }

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
        const rounded = roundToNearestTen(amount)
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
                        amount: rounded,
                        isMandatory: bucketTermAmounts[bucketId]?.isMandatory ?? bucketAmounts[bucketId]?.isMandatory ?? true,
                        itemId: bucketTermAmounts[bucketId]?.itemId ?? bucketAmounts[bucketId]?.itemId,
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
                    amount: rounded,
                    isMandatory: bucketAmounts[bucketId]?.isMandatory ?? true,
                    itemId: bucketAmounts[bucketId]?.itemId,
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

    const redistributeAllTermsFromSplits = (splits: Record<string, number>) => {
        if (!formData.terms?.length) return
        setDraftSplits(splits)
        const termAmounts = { ...(formData.termBucketAmounts || {}) }
        for (const term of sortedTerms) {
            const currentTotal = getTotalForTerm(term.id)
            const total =
                currentTotal > 0
                    ? currentTotal
                    : setupDraft
                      ? getRepresentativeTermTotal(setupDraft)
                      : 0
            if (total <= 0) continue
            termAmounts[term.id] = distributeTermTotalToBuckets(
                total,
                formData.selectedBuckets || [],
                buildBucketsInfo(),
                setupDraft?.categories ?? [],
                splits,
            )
        }
        onChange('termBucketAmounts', termAmounts)
        setTermTotalDrafts({})
        setAmountDrafts({})
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

    const commitLineAmount = (bucketId: string, termId?: string) => {
        const key = lineDraftKey(bucketId, termId)
        const raw = amountDrafts[key]
        if (raw === undefined) return
        updateAmount(bucketId, parseAmountInput(raw), termId)
        setAmountDrafts((prev) => {
            const next = { ...prev }
            delete next[key]
            return next
        })
    }

    const commitGlobalTotal = () => {
        if (globalTotalDraft === null) return
        const total = roundToNearestTen(parseAmountInput(globalTotalDraft))
        const distributed = distributeTermTotalToBuckets(
            total,
            formData.selectedBuckets || [],
            buildBucketsInfo(),
            setupDraft?.categories ?? [],
            getSplitsForDistribution(),
        )
        onChange('bucketAmounts', distributed)
        setGlobalTotalDraft(null)
        setAmountDrafts({})
    }

    const displayTermTotal = (termId: string): string => {
        if (termTotalDrafts[termId] !== undefined) return termTotalDrafts[termId]
        const t = getTotalForTerm(termId)
        return t > 0 ? String(t) : ''
    }

    const displayLineAmount = (bucketId: string, termId?: string): string => {
        const key = lineDraftKey(bucketId, termId)
        if (amountDrafts[key] !== undefined) return amountDrafts[key]
        const amount = termId
            ? getAmountForTerm(bucketId, termId)
            : bucketAmounts[bucketId]?.amount || 0
        return amount > 0 ? String(amount) : ''
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
    const amountsSectionAction = (
        <div className="flex items-center gap-2 flex-wrap">
            {hasTerms && (formData.terms?.length ?? 0) >= 2 && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={copyTerm1ToAllTerms}
                    className="h-7 text-xs"
                >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy T1 → all
                </Button>
            )}
            {!guidedSetupMode && (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkCreate}
                        disabled={isCreatingBucket}
                        className="h-7 text-xs"
                    >
                        <Layers className="h-3.5 w-3.5 mr-1" />
                        Bulk
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBucketModal(true)}
                        className="h-7 text-xs"
                    >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add item
                    </Button>
                </>
            )}
        </div>
    )

    return (
        <div className="space-y-5">
            {setupDraft && guidedSetupMode && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 space-y-3">
                    <p className="text-sm text-emerald-950">
                        Term totals and category splits come from guided setup.
                        Category lines below are filled automatically.
                    </p>
                    <div className="rounded-lg border border-emerald-100/80 bg-white overflow-hidden text-sm">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                                    <th className="py-2 px-3 text-left font-semibold">Grade</th>
                                    <th className="py-2 px-3 text-right font-semibold">Per term (KES)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gradesWithFeesInDraft(setupDraft).map((grade) => (
                                    <tr key={grade} className="border-b border-slate-50 last:border-0">
                                        <td className="py-2 px-3 font-medium text-slate-800">{grade}</td>
                                        <td className="py-2 px-3 text-right tabular-nums text-slate-700">
                                            {(setupDraft.gradeAmounts[grade] ?? 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {gradesWithFeesInDraft(setupDraft).length > 1 &&
                    new Set(
                        gradesWithFeesInDraft(setupDraft).map(
                            (g) => setupDraft.gradeAmounts[g] ?? 0,
                        ),
                    ).size > 1 ? (
                        <p className="text-xs text-amber-900/90">
                            This structure stores one amount for all linked grades. Line
                            items use{' '}
                            <strong>
                                KES{' '}
                                {getDraftTermTotal(
                                    setupDraft,
                                    gradesWithFeesInDraft(setupDraft)[0],
                                ).toLocaleString()}
                            </strong>{' '}
                            (first grade). Adjust below only if you need different
                            category lines.
                        </p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-emerald-200"
                            onClick={() => setShowGuidedAmountEditor((v) => !v)}
                        >
                            {showGuidedAmountEditor ? 'Hide editor' : 'Adjust amounts'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-emerald-800"
                            onClick={() => setShowSplitEditor((v) => !v)}
                        >
                            {showSplitEditor ? 'Hide %' : 'Edit %'}
                        </Button>
                    </div>
                </div>
            )}

            {setupDraft && !guidedSetupMode && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-emerald-900">From guided setup</p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-emerald-800"
                            onClick={() => setShowSplitEditor((v) => !v)}
                        >
                            {showSplitEditor ? 'Hide %' : 'Edit %'}
                        </Button>
                    </div>
                    {showSplitEditor && setupDraft.categories.length > 0 && (
                        <div className="mt-2 border-t border-emerald-100 pt-2">
                            <CategorySplitEditor
                                categories={setupDraft.categories}
                                splits={draftSplits}
                                onChange={(next) => redistributeAllTermsFromSplits(next)}
                                previewTotalKes={getRepresentativeTermTotal(setupDraft)}
                            />
                        </div>
                    )}
                </div>
            )}

            {!guidedSetupMode && (
            <FeesWizardSection
                title="Fee items"
                action={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBucketModal(true)}
                        className="h-7 text-xs"
                    >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add
                    </Button>
                }
            >
            {errors?.selectedBuckets && (
                <p className="text-xs text-red-600 mb-3">{errors.selectedBuckets}</p>
            )}
            <div>
                {isLoadingBuckets ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        Loading fee items...
                    </div>
                ) : getAllBuckets().length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                        <p className="text-slate-600 mb-3">No fee items yet</p>
                        <p className="text-sm text-slate-500 mb-4">Add tuition, transport, lunch, or other charges</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowBucketModal(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add your first fee item
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
            </FeesWizardSection>
            )}

            {!guidedSetupMode && (
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
            )}

            {formData.selectedBuckets?.length > 0 &&
            (!guidedSetupMode || showGuidedAmountEditor) && (
                <FeesWizardSection
                    title={guidedSetupMode ? 'Adjust amounts' : 'Amounts'}
                    action={amountsSectionAction}
                    noPadding={hasTerms}
                >
                    {hasTerms && !guidedSetupMode && (
                        <p className="px-4 pt-3 pb-0 text-xs text-slate-500">
                            Enter each term total — categories split automatically. Press Enter to apply.
                        </p>
                    )}
                    {hasTerms && guidedSetupMode && (
                        <p className="px-4 pt-3 pb-0 text-xs text-slate-500">
                            Optional: change term totals or line items. Press Enter to apply.
                        </p>
                    )}

                    {hasTerms ? (
                        <FeesAmountTable className="mt-3 rounded-none border-0 border-t border-slate-200 shadow-none">
                                    <colgroup>
                                        <col style={{ width: '32%' }} />
                                        {sortedTerms.map((term) => (
                                            <col key={term.id} />
                                        ))}
                                        <col style={{ width: '72px' }} />
                                    </colgroup>
                                    <thead>
                                        <tr className={feesTableHead}>
                                                <th className={feesTableThFirst}>Category</th>
                                                {sortedTerms.map(term => (
                                                    <th key={term.id} className={cn(feesTableThTerm, 'min-w-[120px]')}>
                                                        {term.name}
                                                    </th>
                                                ))}
                                                <th className="w-[72px] py-3 px-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Req.
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className={feesTableRowTotal}>
                                                <td className={cn(feesTableCellLabel, 'text-emerald-900')}>
                                                    Term total
                                                </td>
                                                {sortedTerms.map((term) => (
                                                        <td key={term.id} className="py-3 px-2">
                                                            <div className="relative">
                                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
                                                                    KES
                                                                </span>
                                                                <Input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    value={displayTermTotal(term.id)}
                                                                    onChange={(e) =>
                                                                        setTermTotalDrafts((prev) => ({
                                                                            ...prev,
                                                                            [term.id]: e.target.value,
                                                                        }))
                                                                    }
                                                                    onBlur={() => commitTermTotal(term.id)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.currentTarget.blur()
                                                                        }
                                                                    }}
                                                                    placeholder="e.g. 54000"
                                                                    className="pl-10 h-10 text-right font-bold text-sm border-primary/30 bg-white tabular-nums"
                                                                />
                                                            </div>
                                                        </td>
                                                    ))}
                                                <td />
                                            </tr>
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
                                                    <tr
                                                        key={bucketId}
                                                        className={cn(
                                                            'border-b border-slate-100',
                                                            rowIndex % 2 === 1 && 'bg-slate-50/40',
                                                        )}
                                                    >
                                                        <td className={feesTableCellLabel}>
                                                            <div className="flex items-center gap-2">
                                                                <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                                                                <span>{info.name}</span>
                                                            </div>
                                                        </td>
                                                        {sortedTerms.map((term, termIndex) => {
                                                            const amount = getAmountForTerm(bucketId, term.id)
                                                            const draftKey = lineDraftKey(bucketId, term.id)
                                                            return (
                                                                <td key={term.id} className="py-3 px-2">
                                                                    <div className="relative">
                                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                                                                            KES
                                                                        </span>
                                                                        <Input
                                                                            type="text"
                                                                            inputMode="numeric"
                                                                            value={displayLineAmount(bucketId, term.id)}
                                                                            onChange={(e) =>
                                                                                setAmountDrafts((prev) => ({
                                                                                    ...prev,
                                                                                    [draftKey]: e.target.value,
                                                                                }))
                                                                            }
                                                                            onBlur={() => commitLineAmount(bucketId, term.id)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.currentTarget.blur()
                                                                                    return
                                                                                }
                                                                                handleKeyDown(e, rowIndex * (sortedTerms.length || 1) + termIndex + sortedTerms.length)
                                                                            }}
                                                                            placeholder="0"
                                                                            className={cn(
                                                                                "pl-10 h-9 text-right font-semibold text-sm tabular-nums",
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
                                            <tr className="border-t border-slate-200 bg-slate-50/80 text-xs text-slate-500">
                                                <td className="py-2 px-4 font-medium">Sum</td>
                                                {sortedTerms.map((term) => {
                                                    const termTotal = getTotalForTerm(term.id)
                                                    const mandatoryTotal = getMandatoryTotalForTerm(term.id)
                                                    return (
                                                        <td key={term.id} className="py-2 px-3 text-right tabular-nums">
                                                            <span className="font-semibold text-slate-700">
                                                                {termTotal.toLocaleString()}
                                                            </span>
                                                            {termTotal !== mandatoryTotal && (
                                                                <span className="block text-[10px] text-slate-400">
                                                                    req. {mandatoryTotal.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </td>
                                                    )
                                                })}
                                                <td />
                                            </tr>
                                        </tbody>
                        </FeesAmountTable>
                        ) : (
                            <div className="space-y-3">
                            <div className="flex items-end gap-3 rounded-lg border border-slate-200 p-3">
                                <label className="text-xs font-medium text-slate-500 flex-1">
                                    Total
                                </label>
                                <div className="relative w-40">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                                        KES
                                    </span>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={
                                            globalTotalDraft !== null
                                                ? globalTotalDraft
                                                : totalAmount > 0
                                                  ? String(totalAmount)
                                                  : ''
                                        }
                                        onChange={(e) => setGlobalTotalDraft(e.target.value)}
                                        onBlur={commitGlobalTotal}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') e.currentTarget.blur()
                                        }}
                                        placeholder="e.g. 54000"
                                        className="pl-12 h-10 text-right font-bold tabular-nums"
                                    />
                                </div>
                            </div>
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
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={displayLineAmount(bucketId)}
                                                    onChange={(e) =>
                                                        setAmountDrafts((prev) => ({
                                                            ...prev,
                                                            [lineDraftKey(bucketId)]: e.target.value,
                                                        }))
                                                    }
                                                    onBlur={() => commitLineAmount(bucketId)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.currentTarget.blur()
                                                            return
                                                        }
                                                        handleKeyDown(e, index)
                                                    }}
                                                    placeholder="0"
                                                    className={cn(
                                                        "pl-12 h-10 text-right font-semibold tabular-nums",
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
                            </div>
                        )}
                    {errors?.bucketAmounts && (
                        <p className={cn('text-xs text-red-600', hasTerms ? 'px-4 pb-3' : 'mt-3')}>
                            {errors.bucketAmounts}
                        </p>
                    )}
                </FeesWizardSection>
            )}
        </div>
    )
}
