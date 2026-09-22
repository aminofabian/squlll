'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Copy } from 'lucide-react'
import { CategorySplitEditor } from '../../CategorySplitEditor'
import { initSplitsForCategories } from '../../../lib/categorySplits'
import { roundToNearestTen } from '../../../lib/feesAmounts'
import { sortTermsForLetter } from '../../../lib/sortTermsForLetter'
import {
  FeesAmountTable,
  FeesKesCell,
  FeesWizardSection,
  feesTableCellAmount,
  feesTableCellLabel,
  feesTableHead,
  feesTableRowTotal,
  feesTableThFirst,
  feesTableThTerm,
} from '../FeesWizardLayout'
import type { FeeWizardFormData } from '../../../lib/feesWizardPdfForm'

type BucketRow = {
  id: string
  name: string
  amount: number
  isMandatory: boolean
  itemId?: string
}

interface StepBreakdownProps {
  formData: Pick<
    FeeWizardFormData,
    | 'selectedBuckets'
    | 'bucketAmounts'
    | 'termBucketAmounts'
    | 'terms'
  >
  /** Locked term total from Fees step (same for every term in v1) */
  termTotalKes: number
  categories: string[]
  categorySplits: Record<string, number>
  onChange: (field: string, value: unknown) => void
  onCategorySplitsChange?: (splits: Record<string, number>) => void
  errors?: Record<string, string>
}

export function StepBreakdown({
  formData,
  termTotalKes,
  categories,
  categorySplits,
  onChange,
  onCategorySplitsChange,
  errors,
}: StepBreakdownProps) {
  const [amountDrafts, setAmountDrafts] = useState<Record<string, string>>({})
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [draftSplits, setDraftSplits] = useState<Record<string, number>>(() =>
    initSplitsForCategories(categories, categorySplits),
  )

  const sortedTerms = useMemo(
    () => sortTermsForLetter(formData.terms || []),
    [formData.terms],
  )

  const getAmount = (bucketId: string, termId: string): number => {
    return (
      formData.termBucketAmounts?.[termId]?.[bucketId]?.amount ??
      formData.bucketAmounts[bucketId]?.amount ??
      0
    )
  }

  const getTermSum = (termId: string): number =>
    (formData.selectedBuckets || []).reduce(
      (sum, id) => sum + getAmount(id, termId),
      0,
    )

  const getRemaining = (termId: string): number =>
    roundToNearestTen(termTotalKes) - getTermSum(termId)

  const setLineAmount = (bucketId: string, termId: string, amount: number) => {
    const rounded = roundToNearestTen(Math.max(0, amount))
    const meta =
      formData.termBucketAmounts?.[termId]?.[bucketId] ||
      formData.bucketAmounts[bucketId]
    if (!meta) return

    const nextTerm = { ...(formData.termBucketAmounts || {}) }
    if (!nextTerm[termId]) nextTerm[termId] = {}
    nextTerm[termId] = {
      ...nextTerm[termId],
      [bucketId]: { ...meta, amount: rounded },
    }
    onChange('termBucketAmounts', nextTerm)

    const nextGlobal = {
      ...formData.bucketAmounts,
      [bucketId]: { ...meta, amount: rounded },
    }
    onChange('bucketAmounts', nextGlobal)
  }

  const redistributeFromSplits = (splits: Record<string, number>) => {
    const buckets = formData.selectedBuckets || []
    const nextTerm: Record<string, Record<string, BucketRow>> = {}
    const nextGlobal: Record<string, BucketRow> = {
      ...formData.bucketAmounts,
    }

    for (const term of sortedTerms) {
      nextTerm[term.id] = {}
      let allocated = 0
      buckets.forEach((bucketId, index) => {
        const meta =
          formData.termBucketAmounts?.[term.id]?.[bucketId] ||
          formData.bucketAmounts[bucketId]
        if (!meta) return
        const nameKey =
          categories.find(
            (c) =>
              c.toLowerCase() === meta.name.toLowerCase() ||
              meta.name.toLowerCase().includes(c.toLowerCase()),
          ) ?? meta.name
        const pct = splits[nameKey] ?? splits[meta.name] ?? 0
        let amount =
          index === buckets.length - 1
            ? Math.max(0, termTotalKes - allocated)
            : roundToNearestTen((termTotalKes * pct) / 100)
        if (index < buckets.length - 1) allocated += amount
        else amount = roundToNearestTen(amount)
        const row = { ...meta, amount }
        nextTerm[term.id][bucketId] = row
        nextGlobal[bucketId] = row
      })
    }

    onChange('termBucketAmounts', nextTerm)
    onChange('bucketAmounts', nextGlobal)
    onCategorySplitsChange?.(splits)
  }

  const copyTerm1ToAll = () => {
    if (sortedTerms.length < 2) return
    const firstId = sortedTerms[0].id
    const source = formData.termBucketAmounts?.[firstId]
    if (!source) return
    const next = { ...(formData.termBucketAmounts || {}) }
    for (const term of sortedTerms.slice(1)) {
      next[term.id] = {}
      for (const bucketId of formData.selectedBuckets || []) {
        const row = source[bucketId]
        if (row) next[term.id][bucketId] = { ...row }
      }
    }
    onChange('termBucketAmounts', next)
  }

  const autoFillTuition = () => {
    const tuitionId = (formData.selectedBuckets || []).find((id) => {
      const name = (
        formData.bucketAmounts[id]?.name || ''
      ).toLowerCase()
      return name.includes('tuition')
    })
    if (!tuitionId) return

    for (const term of sortedTerms) {
      const remaining = getRemaining(term.id)
      if (remaining === 0) continue
      const current = getAmount(tuitionId, term.id)
      setLineAmount(tuitionId, term.id, current + remaining)
    }
  }

  const draftKey = (termId: string, bucketId: string) => `${termId}:${bucketId}`

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Split each term total into line items. Remaining must be{' '}
        <span className="font-medium text-slate-800">0</span> to continue.
      </p>

      <FeesWizardSection title="Fee breakdown">
        {(formData.selectedBuckets || []).length === 0 ? (
          <p className="text-sm text-amber-800">
            No fee lines yet. Go back and pick lines on the bill.
          </p>
        ) : (
          <FeesAmountTable>
            <thead>
              <tr className={feesTableHead}>
                <th className={feesTableThFirst}>Line</th>
                {sortedTerms.map((term) => (
                  <th key={term.id} className={feesTableThTerm}>
                    {term.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className={feesTableRowTotal}>
                <td className={feesTableCellLabel}>Term total</td>
                {sortedTerms.map((term) => (
                  <td key={term.id} className={feesTableCellAmount}>
                    <FeesKesCell amount={termTotalKes} />
                  </td>
                ))}
              </tr>
              {(formData.selectedBuckets || []).map((bucketId) => {
                const meta = formData.bucketAmounts[bucketId]
                if (!meta) return null
                return (
                  <tr key={bucketId} className="border-b border-slate-100">
                    <td className={feesTableCellLabel}>{meta.name}</td>
                    {sortedTerms.map((term) => {
                      const key = draftKey(term.id, bucketId)
                      const committed = getAmount(bucketId, term.id)
                      const draft = amountDrafts[key]
                      return (
                        <td key={term.id} className={feesTableCellAmount}>
                          <Input
                            className="h-8 border-slate-200 text-right text-xs tabular-nums"
                            inputMode="numeric"
                            value={
                              draft !== undefined
                                ? draft
                                : committed > 0
                                  ? committed.toLocaleString('en-KE')
                                  : ''
                            }
                            onChange={(e) => {
                              setAmountDrafts((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }}
                            onBlur={() => {
                              const raw = (
                                amountDrafts[key] ?? String(committed)
                              )
                                .replace(/,/g, '')
                                .trim()
                              const n = Number(raw)
                              setLineAmount(
                                bucketId,
                                term.id,
                                Number.isFinite(n) ? n : 0,
                              )
                              setAmountDrafts((prev) => {
                                const next = { ...prev }
                                delete next[key]
                                return next
                              })
                            }}
                          />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
              <tr>
                <td className={cn(feesTableCellLabel, 'font-medium')}>
                  Remaining
                </td>
                {sortedTerms.map((term) => {
                  const rem = getRemaining(term.id)
                  return (
                    <td
                      key={term.id}
                      className={cn(
                        feesTableCellAmount,
                        'text-xs font-semibold tabular-nums',
                        rem === 0
                          ? 'text-emerald-700'
                          : rem > 0
                            ? 'text-amber-700'
                            : 'text-rose-700',
                      )}
                    >
                      {rem === 0
                        ? '0'
                        : rem > 0
                          ? rem.toLocaleString('en-KE')
                          : `−${Math.abs(rem).toLocaleString('en-KE')}`}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </FeesAmountTable>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={copyTerm1ToAll}
            disabled={sortedTerms.length < 2}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Term 1 → all
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={autoFillTuition}
          >
            Auto-fill Tuition
          </Button>
        </div>

        {errors?.bucketAmounts || errors?.remaining ? (
          <p className="mt-2 text-xs text-red-600">
            {errors.remaining || errors.bucketAmounts}
          </p>
        ) : null}
      </FeesWizardSection>

      <details
        className="rounded-lg border border-slate-200 bg-white"
        open={showAdvanced}
        onToggle={(e) => setShowAdvanced((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-slate-600">
          Advanced: percent split
        </summary>
        <div className="border-t border-slate-100 px-3 py-3">
          <CategorySplitEditor
            categories={categories}
            splits={draftSplits}
            onChange={setDraftSplits}
            previewTotalKes={termTotalKes || 10000}
          />
          <Button
            type="button"
            size="sm"
            className="mt-2 h-8 text-xs"
            onClick={() => redistributeFromSplits(draftSplits)}
          >
            Apply % to amounts
          </Button>
        </div>
      </details>
    </div>
  )
}

/** True when every term’s line amounts sum to the locked term total */
export function breakdownRemainingIsZero(
  formData: Pick<
    FeeWizardFormData,
    'selectedBuckets' | 'bucketAmounts' | 'termBucketAmounts' | 'terms'
  >,
  termTotalKes: number,
): boolean {
  const target = roundToNearestTen(termTotalKes)
  const terms = formData.terms || []
  if (terms.length === 0 || target <= 0) return false
  const buckets = formData.selectedBuckets || []
  if (buckets.length === 0) return false

  return terms.every((term) => {
    const sum = buckets.reduce((acc, id) => {
      const amount =
        formData.termBucketAmounts?.[term.id]?.[id]?.amount ??
        formData.bucketAmounts[id]?.amount ??
        0
      return acc + amount
    }, 0)
    return Math.abs(roundToNearestTen(sum) - target) <= 10
  })
}
