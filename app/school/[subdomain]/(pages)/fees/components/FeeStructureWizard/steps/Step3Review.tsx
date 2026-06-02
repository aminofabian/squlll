'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Edit2, Settings2, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FEES_BRAND } from '../../../lib/fees-ui'
import { isPrimaryFeeCategory } from '../../../lib/feeCategoryDisplay'
import { sortTermsForLetter } from '../../../lib/sortTermsForLetter'
import type { FeesSetupWizardResult } from '../../FeesSetupWizardDialog'
import { CategorySplitEditor } from '../../CategorySplitEditor'
import { useWizardTermAmounts } from '../useWizardTermAmounts'
import {
    FeesAmountTable,
    FeesKesCell,
    FeesMetaGrid,
    FeesWizardSection,
    feesTableCellAmount,
    feesTableCellLabel,
    feesTableHead,
    feesTableRowTotal,
    feesTableThFirst,
    feesTableThTerm,
} from '../FeesWizardLayout'

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
        previewGrade?: string
    }
    onChange: (field: string, value: any) => void
    editableAmounts?: boolean
    setupDraft?: FeesSetupWizardResult | null
    onSetupDraftChange?: (draft: FeesSetupWizardResult) => void
    onEditSetup?: () => void
    errors?: Record<string, string>
}

function boardingLabel(type: string): string {
    if (type === 'both') return 'Day & boarding'
    if (type === 'boarding') return 'Boarding'
    return 'Day'
}

export const Step3Review = ({
    formData,
    onChange,
    editableAmounts = false,
    setupDraft,
    onSetupDraftChange,
    onEditSetup,
    errors,
}: Step3ReviewProps) => {
    const [editingName, setEditingName] = useState(false)
    const [showSplits, setShowSplits] = useState(false)
    const [showLineEdit, setShowLineEdit] = useState(false)

    const amounts = useWizardTermAmounts(formData, onChange, {
        setupDraft: editableAmounts ? setupDraft : null,
        onSetupDraftChange: editableAmounts ? onSetupDraftChange : undefined,
    })

    const hasTerms = (formData.terms?.length ?? 0) > 0
    const hasTermAmounts =
        formData.termBucketAmounts &&
        Object.keys(formData.termBucketAmounts).length > 0

    const sortedTerms = useMemo(
        () =>
            editableAmounts
                ? amounts.sortedTerms
                : sortTermsForLetter(formData.terms || []),
        [editableAmounts, amounts.sortedTerms, formData.terms],
    )

    const getAmountForTerm = (bucketId: string, termId: string): number => {
        if (editableAmounts) {
            return amounts.getAmountForTerm(bucketId, termId)
        }
        if (formData.termBucketAmounts?.[termId]?.[bucketId]) {
            return formData.termBucketAmounts[termId][bucketId].amount || 0
        }
        return formData.bucketAmounts[bucketId]?.amount || 0
    }

    const getTotalForTerm = (termId: string): number => {
        if (editableAmounts) return amounts.getTotalForTerm(termId)
        if (!formData.selectedBuckets?.length) return 0
        return formData.selectedBuckets.reduce(
            (sum, bucketId) => sum + getAmountForTerm(bucketId, termId),
            0,
        )
    }

    const bucketRows = useMemo(() => {
        const rows = (formData.selectedBuckets || []).map((bucketId) => {
            const bucket = formData.bucketAmounts[bucketId]
            const name = bucket?.name || 'Fee item'
            const amountsList = hasTerms
                ? sortedTerms.map((t) => getAmountForTerm(bucketId, t.id))
                : [bucket?.amount || 0]
            const maxAmount = Math.max(...amountsList, 0)
            return {
                bucketId,
                name,
                amounts: amountsList,
                maxAmount,
                isMandatory: bucket?.isMandatory ?? true,
            }
        })
        return rows.sort((a, b) => b.maxAmount - a.maxAmount)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        formData.selectedBuckets,
        formData.bucketAmounts,
        formData.termBucketAmounts,
        sortedTerms,
        hasTerms,
        editableAmounts,
    ])

    const totalAmount =
        hasTerms && hasTermAmounts
            ? sortedTerms.reduce((sum, term) => sum + getTotalForTerm(term.id), 0)
            : Object.values(formData.bucketAmounts).reduce(
                  (sum, b) => sum + b.amount,
                  0,
              )

    const perTermAverage =
        hasTerms && sortedTerms.length > 0
            ? Math.round(totalAmount / sortedTerms.length)
            : totalAmount

    const gradeSummary = formData.selectedGrades?.length
        ? formData.selectedGrades.length <= 3
            ? formData.selectedGrades.join(', ')
            : `${formData.selectedGrades.length} grades`
        : formData.grade || '—'

    const termColumns = hasTerms ? sortedTerms : [{ id: '_single', name: 'Per term' }]
    const termColWidth =
        termColumns.length > 0
            ? `${Math.floor(62 / termColumns.length)}%`
            : '20%'

    const canEditLines = editableAmounts && showLineEdit && hasTerms

    return (
        <div className="space-y-5">
            {editableAmounts && onEditSetup ? (
                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 border-emerald-200 text-emerald-900"
                        onClick={onEditSetup}
                    >
                        <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                        Edit categories & grade amounts
                    </Button>
                </div>
            ) : null}

            {editableAmounts && setupDraft?.categories?.length ? (
                <FeesWizardSection
                    title="Category split"
                    action={
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setShowSplits((v) => !v)}
                        >
                            {showSplits ? (
                                <>
                                    <ChevronUp className="mr-1 h-3.5 w-3.5" />
                                    Hide
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="mr-1 h-3.5 w-3.5" />
                                    Edit %
                                </>
                            )}
                        </Button>
                    }
                >
                    {showSplits ? (
                        <CategorySplitEditor
                            compact
                            categories={setupDraft.categories}
                            splits={amounts.draftSplits}
                            onChange={amounts.applyCategorySplits}
                            previewTotalKes={amounts.previewTotalKes}
                        />
                    ) : (
                        <p className="text-xs text-slate-500">
                            {setupDraft.categories.length} categories · adjust
                            percentages to redistribute line items
                        </p>
                    )}
                </FeesWizardSection>
            ) : null}

            <FeesWizardSection title="Plan details">
                <div className="space-y-4">
                    {editingName ? (
                        <Input
                            autoFocus
                            value={formData.name}
                            onChange={(e) => onChange('name', e.target.value)}
                            onBlur={() => setEditingName(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
                            className="h-10 font-semibold"
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setEditingName(true)}
                            className="group flex w-full items-center justify-between gap-2 rounded-lg border border-transparent py-1 text-left hover:border-slate-200 hover:bg-slate-50"
                        >
                            <span className="text-base font-semibold text-slate-900">
                                {formData.name || 'Untitled plan'}
                            </span>
                            <Edit2 className="h-4 w-4 shrink-0 text-slate-400 opacity-0 group-hover:opacity-100" />
                        </button>
                    )}
                    <FeesMetaGrid
                        items={[
                            { label: 'Year', value: formData.academicYear },
                            { label: 'Grades', value: gradeSummary },
                            { label: 'Students', value: boardingLabel(formData.boardingType) },
                            {
                                label: 'Items',
                                value: `${formData.selectedBuckets?.length ?? 0} categories`,
                            },
                        ]}
                    />
                </div>
            </FeesWizardSection>

            <FeesWizardSection
                title="Fee breakdown"
                noPadding
                action={
                    editableAmounts && hasTerms ? (
                        <div className="flex items-center gap-1">
                            {sortedTerms.length >= 2 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={amounts.copyTerm1ToAllTerms}
                                >
                                    <Copy className="mr-1 h-3.5 w-3.5" />
                                    Copy T1 → all
                                </Button>
                            ) : null}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setShowLineEdit((v) => !v)}
                            >
                                {showLineEdit ? 'Lock lines' : 'Edit lines'}
                            </Button>
                        </div>
                    ) : undefined
                }
            >
                {errors?.bucketAmounts && (
                    <p className="px-4 pt-3 text-xs text-red-600">{errors.bucketAmounts}</p>
                )}
                <FeesAmountTable className="rounded-none border-0 shadow-none">
                    <colgroup>
                        <col className="w-[38%]" />
                        {termColumns.map((term) => (
                            <col key={term.id} style={{ width: termColWidth }} />
                        ))}
                    </colgroup>
                    <thead>
                        <tr className={feesTableHead}>
                            <th className={feesTableThFirst}>Category</th>
                            {termColumns.map((term) => (
                                <th key={term.id} className={feesTableThTerm}>
                                    {term.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className={feesTableRowTotal}>
                            <td className={cn(feesTableCellLabel, 'text-emerald-900')}>
                                Term total
                            </td>
                            {termColumns.map((term) => {
                                const total = hasTerms
                                    ? getTotalForTerm(term.id)
                                    : totalAmount
                                return (
                                    <td
                                        key={term.id}
                                        className={cn(
                                            feesTableCellAmount,
                                            'text-emerald-800',
                                            editableAmounts && hasTerms && 'py-2 px-2',
                                        )}
                                    >
                                        {editableAmounts && hasTerms ? (
                                            <div className="relative min-w-[100px]">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                                                    KES
                                                </span>
                                                <Input
                                                    {...amounts.bindTermTotalInput(term.id)}
                                                    placeholder="e.g. 45000"
                                                    className="h-9 border-emerald-200/80 bg-white pl-10 text-right text-sm font-bold tabular-nums"
                                                />
                                            </div>
                                        ) : (
                                            <FeesKesCell amount={total} bold />
                                        )}
                                    </td>
                                )
                            })}
                        </tr>
                        {bucketRows.map((row, idx) => {
                            const primary = isPrimaryFeeCategory(row.name)
                            return (
                                <tr
                                    key={row.bucketId}
                                    className={cn(
                                        'border-b border-slate-100',
                                        idx % 2 === 1 && !primary && 'bg-slate-50/50',
                                        primary && 'bg-emerald-50/30',
                                    )}
                                >
                                    <td className={feesTableCellLabel}>
                                        <span
                                            className={cn(
                                                primary && 'font-semibold text-slate-900',
                                            )}
                                        >
                                            {row.name}
                                        </span>
                                        {!row.isMandatory && (
                                            <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-amber-600">
                                                Optional
                                            </span>
                                        )}
                                    </td>
                                    {row.amounts.map((amount, i) => {
                                        const termId = termColumns[i]?.id
                                        const showInput =
                                            canEditLines &&
                                            termId &&
                                            termId !== '_single'
                                        return (
                                            <td
                                                key={termColumns[i]?.id ?? i}
                                                className={cn(
                                                    feesTableCellAmount,
                                                    showInput && 'py-2 px-2',
                                                )}
                                            >
                                                {showInput ? (
                                                    <div className="relative min-w-[88px]">
                                                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                                                            KES
                                                        </span>
                                                        <Input
                                                            {...amounts.bindLineAmountInput(
                                                                row.bucketId,
                                                                termId,
                                                            )}
                                                            className="h-8 bg-white pl-8 text-right text-xs tabular-nums"
                                                        />
                                                    </div>
                                                ) : (
                                                    <FeesKesCell
                                                        amount={amount}
                                                        bold={primary}
                                                    />
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-slate-200 bg-slate-50">
                            <td className={cn(feesTableCellLabel, 'py-3')}>
                                <span className="block text-slate-800">Year total</span>
                                {hasTerms && sortedTerms.length > 1 && (
                                    <span className="mt-0.5 block text-[11px] font-normal text-slate-400 tabular-nums">
                                        ~{perTermAverage.toLocaleString()} / term
                                    </span>
                                )}
                            </td>
                            <td
                                colSpan={termColumns.length}
                                className={cn(feesTableCellAmount, 'py-3')}
                            >
                                <span
                                    className="text-lg font-bold tabular-nums"
                                    style={{ color: FEES_BRAND.primaryDark }}
                                >
                                    <span className="mr-1.5 text-sm font-normal text-slate-400">
                                        KES
                                    </span>
                                    {totalAmount.toLocaleString()}
                                </span>
                            </td>
                        </tr>
                    </tfoot>
                </FeesAmountTable>
            </FeesWizardSection>

            <p className="px-1 text-sm text-slate-500">
                Next: add your school letterhead, bank details, and preview the
                official fee structure before saving.
            </p>
        </div>
    )
}
