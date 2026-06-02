'use client'

import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import type { FeesSetupWizardResult } from '../FeesSetupWizardDialog'
import {
    distributeTermTotalToBuckets,
    getRepresentativeTermTotal,
    syncWizardFormToSetupDraft,
} from '../../lib/feesSetupDraft'
import { initSplitsForCategories } from '../../lib/categorySplits'
import { sortTermsForLetter } from '../../lib/sortTermsForLetter'
import { roundToNearestTen } from '../../lib/feesAmounts'

export type WizardAmountsFormData = {
    selectedBuckets?: string[]
    bucketAmounts: Record<
        string,
        { id: string; name: string; amount: number; isMandatory: boolean; itemId?: string }
    >
    terms?: Array<{ id: string; name: string }>
    termBucketAmounts?: Record<
        string,
        Record<
            string,
            {
                id: string
                name: string
                amount: number
                isMandatory: boolean
                itemId?: string
            }
        >
    >
    selectedGrades?: string[]
    previewGrade?: string
}

function parseAmountInput(raw: string): number {
    const cleaned = raw.replace(/,/g, '').trim()
    if (cleaned === '' || cleaned === '-') return 0
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : 0
}

type UseWizardTermAmountsOptions = {
    setupDraft?: FeesSetupWizardResult | null
    onSetupDraftChange?: (draft: FeesSetupWizardResult) => void
}

export function useWizardTermAmounts(
    formData: WizardAmountsFormData,
    onChange: (field: string, value: unknown) => void,
    options?: UseWizardTermAmountsOptions,
) {
    const setupDraft = options?.setupDraft
    const onSetupDraftChange = options?.onSetupDraftChange
    const bucketAmounts = formData.bucketAmounts || {}
    const [termTotalDrafts, setTermTotalDrafts] = useState<Record<string, string>>({})
    const [amountDrafts, setAmountDrafts] = useState<Record<string, string>>({})
    const [draftSplits, setDraftSplits] = useState<Record<string, number>>({})

    useEffect(() => {
        if (!setupDraft?.categories?.length) return
        setDraftSplits(
            initSplitsForCategories(
                setupDraft.categories,
                setupDraft.categorySplits,
            ),
        )
    }, [setupDraft])

    const sortedTerms = useMemo(
        () => sortTermsForLetter(formData.terms || []),
        [formData.terms],
    )

    const getAmountForTerm = useCallback(
        (bucketId: string, termId: string): number => {
            if (formData.termBucketAmounts?.[termId]?.[bucketId]) {
                return formData.termBucketAmounts[termId][bucketId].amount || 0
            }
            return bucketAmounts[bucketId]?.amount || 0
        },
        [formData.termBucketAmounts, bucketAmounts],
    )

    const getTotalForTerm = useCallback(
        (termId: string): number => {
            if (!formData.selectedBuckets?.length) return 0
            return formData.selectedBuckets.reduce(
                (sum, bucketId) => sum + getAmountForTerm(bucketId, termId),
                0,
            )
        },
        [formData.selectedBuckets, getAmountForTerm],
    )

    const getSplitsForDistribution = useCallback(
        () =>
            Object.keys(draftSplits).length > 0
                ? draftSplits
                : setupDraft?.categorySplits,
        [draftSplits, setupDraft?.categorySplits],
    )

    const buildBucketsInfo = useCallback(() => {
        const info: Record<
            string,
            { id: string; name: string; isMandatory?: boolean }
        > = {}
        for (const bucketId of formData.selectedBuckets || []) {
            const b = bucketAmounts[bucketId]
            info[bucketId] = {
                id: bucketId,
                name: b?.name || 'Fee item',
                isMandatory: b?.isMandatory ?? true,
            }
        }
        return info
    }, [formData.selectedBuckets, bucketAmounts])

    const persistDraftFromForm = useCallback(
        (splitsOverride?: Record<string, number>) => {
            if (!setupDraft || !onSetupDraftChange) return
            const next = syncWizardFormToSetupDraft(
                setupDraft,
                {
                    terms: formData.terms ?? [],
                    termBucketAmounts: formData.termBucketAmounts,
                    selectedGrades: formData.selectedGrades ?? [],
                    previewGrade: formData.previewGrade ?? "",
                },
                {
                    categorySplits: splitsOverride ?? getSplitsForDistribution(),
                },
            )
            onSetupDraftChange(next)
        },
        [setupDraft, onSetupDraftChange, formData, getSplitsForDistribution],
    )

    const applyTermTotal = useCallback(
        (termId: string, total: number, splits?: Record<string, number>) => {
            const bucketIds = formData.selectedBuckets || []
            if (bucketIds.length === 0) return

            const distributed = distributeTermTotalToBuckets(
                total,
                bucketIds,
                buildBucketsInfo(),
                setupDraft?.categories ?? [],
                splits ?? getSplitsForDistribution(),
            )

            const existingTerm = formData.termBucketAmounts?.[termId] || {}
            const merged = Object.fromEntries(
                Object.entries(distributed).map(([bid, row]) => [
                    bid,
                    {
                        ...row,
                        itemId:
                            existingTerm[bid]?.itemId ??
                            bucketAmounts[bid]?.itemId,
                    },
                ]),
            )

            onChange('termBucketAmounts', {
                ...(formData.termBucketAmounts || {}),
                [termId]: merged,
            })
            setTermTotalDrafts((prev) => {
                const next = { ...prev }
                delete next[termId]
                return next
            })
            setAmountDrafts((prev) => {
                const next = { ...prev }
                for (const key of Object.keys(next)) {
                    if (key.startsWith(`${termId}:`)) delete next[key]
                }
                return next
            })
        },
        [
            formData.selectedBuckets,
            formData.termBucketAmounts,
            buildBucketsInfo,
            setupDraft?.categories,
            getSplitsForDistribution,
            bucketAmounts,
            onChange,
        ],
    )

    const commitTermTotal = useCallback(
        (termId: string) => {
            const raw = termTotalDrafts[termId]
            if (raw === undefined) return
            applyTermTotal(termId, parseAmountInput(raw))
            queueMicrotask(() => persistDraftFromForm())
        },
        [termTotalDrafts, applyTermTotal, persistDraftFromForm],
    )

    const displayTermTotal = (termId: string): string => {
        if (termTotalDrafts[termId] !== undefined) return termTotalDrafts[termId]
        const t = getTotalForTerm(termId)
        return t > 0 ? String(t) : ''
    }

    const bindTermTotalInput = (termId: string) => ({
        type: 'text' as const,
        inputMode: 'numeric' as const,
        value: displayTermTotal(termId),
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setTermTotalDrafts((prev) => ({
                ...prev,
                [termId]: e.target.value,
            })),
        onBlur: () => commitTermTotal(termId),
        onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') e.currentTarget.blur()
        },
    })

    const lineDraftKey = (bucketId: string, termId: string) =>
        `${termId}:${bucketId}`

    const displayLineAmount = (bucketId: string, termId: string): string => {
        const key = lineDraftKey(bucketId, termId)
        if (amountDrafts[key] !== undefined) return amountDrafts[key]
        const amount = getAmountForTerm(bucketId, termId)
        return amount > 0 ? String(amount) : ''
    }

    const updateLineAmount = (bucketId: string, amount: number, termId: string) => {
        const base = bucketAmounts[bucketId]
        const existing = formData.termBucketAmounts?.[termId]?.[bucketId]
        const row = {
            id: bucketId,
            name: base?.name || existing?.name || 'Fee item',
            amount: roundToNearestTen(amount),
            isMandatory: base?.isMandatory ?? existing?.isMandatory ?? true,
            itemId: existing?.itemId ?? base?.itemId,
        }
        onChange('termBucketAmounts', {
            ...(formData.termBucketAmounts || {}),
            [termId]: {
                ...(formData.termBucketAmounts?.[termId] || {}),
                [bucketId]: row,
            },
        })
    }

    const commitLineAmount = (bucketId: string, termId: string) => {
        const key = lineDraftKey(bucketId, termId)
        const raw = amountDrafts[key]
        if (raw === undefined) return
        updateLineAmount(bucketId, parseAmountInput(raw), termId)
        setAmountDrafts((prev) => {
            const next = { ...prev }
            delete next[key]
            return next
        })
        queueMicrotask(() => persistDraftFromForm())
    }

    const bindLineAmountInput = (bucketId: string, termId: string) => ({
        type: 'text' as const,
        inputMode: 'numeric' as const,
        value: displayLineAmount(bucketId, termId),
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setAmountDrafts((prev) => ({
                ...prev,
                [lineDraftKey(bucketId, termId)]: e.target.value,
            })),
        onBlur: () => commitLineAmount(bucketId, termId),
        onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') e.currentTarget.blur()
        },
    })

    const applyCategorySplits = (splits: Record<string, number>) => {
        setDraftSplits(splits)
        if (setupDraft && onSetupDraftChange) {
            onSetupDraftChange({ ...setupDraft, categorySplits: splits })
        }
        for (const term of sortedTerms) {
            const total = getTotalForTerm(term.id)
            if (total > 0) {
                applyTermTotal(term.id, total, splits)
            }
        }
        queueMicrotask(() => persistDraftFromForm(splits))
    }

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
        queueMicrotask(() => persistDraftFromForm())
    }

    const previewTotalKes =
        sortedTerms.length > 0
            ? getTotalForTerm(sortedTerms[0].id)
            : setupDraft
              ? getRepresentativeTermTotal(setupDraft)
              : 0

    return {
        sortedTerms,
        getAmountForTerm,
        getTotalForTerm,
        bindTermTotalInput,
        bindLineAmountInput,
        draftSplits,
        applyCategorySplits,
        copyTerm1ToAllTerms,
        previewTotalKes,
    }
}
