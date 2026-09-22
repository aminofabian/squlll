'use client'

import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Loader2, Plus } from 'lucide-react'
import { useAcademicYears } from '@/lib/hooks/useAcademicYears'
import { useGradeLevelsForSchoolType } from '@/lib/hooks/useGradeLevelsForSchoolType'
import { FEES_BRAND } from '../../../lib/fees-ui'
import { formatAcademicYearDisplay } from '../../../lib/feePlanStats'
import { sortTermsForLetter } from '../../../lib/sortTermsForLetter'
import {
  ALL_PRESET_FEE_CATEGORIES,
  isDuplicateCategory,
  titleCaseCategory,
} from '../../../lib/feeCategories'
import { roundToNearestTen } from '../../../lib/feesAmounts'
import { FeesWizardSection } from '../FeesWizardLayout'
import { KesAmount } from '../../KesAmount'

const REQUIRED_LINE = 'Tuition'
const QUICK_LINES = ['Tuition', 'Lunch', 'Transport', 'Boarding'] as const

export type StepFeesValue = {
  academicYearId: string
  academicYearName: string
  terms: Array<{ id: string; name: string }>
  selectedGrades: string[]
  /** When true, every selected grade uses termTotalKes */
  sameFeeForAll: boolean
  /** Shared term total when sameFeeForAll */
  termTotalKes: number
  /** Per-grade term totals when !sameFeeForAll */
  gradeAmounts: Record<string, number>
  categories: string[]
}

interface StepFeesProps {
  value: StepFeesValue
  onChange: (next: Partial<StepFeesValue>) => void
  errors?: Record<string, string>
  readOnlyYear?: boolean
}

/** Representative term total for breakdown (first grade with an amount) */
export function representativeTermTotal(value: StepFeesValue): number {
  if (value.sameFeeForAll) {
    return roundToNearestTen(value.termTotalKes)
  }
  for (const g of value.selectedGrades) {
    const amt = value.gradeAmounts[g] ?? 0
    if (amt > 0) return roundToNearestTen(amt)
  }
  return 0
}

/** Grades grouped by rounded term amount — one fee schedule per group */
export function groupGradesByTermAmount(
  value: StepFeesValue,
): Array<{ amount: number; grades: string[] }> {
  const map = new Map<number, string[]>()
  for (const g of value.selectedGrades) {
    const raw = value.sameFeeForAll
      ? value.termTotalKes
      : (value.gradeAmounts[g] ?? 0)
    const amt = roundToNearestTen(raw)
    if (amt <= 0) continue
    const list = map.get(amt) ?? []
    list.push(g)
    map.set(amt, list)
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([amount, grades]) => ({ amount, grades }))
}

export function StepFees({
  value,
  onChange,
  errors,
  readOnlyYear = false,
}: StepFeesProps) {
  const {
    academicYears,
    loading: yearsLoading,
    getActiveAcademicYear,
  } = useAcademicYears()
  const { data: gradeLevels = [], isLoading: gradesLoading } =
    useGradeLevelsForSchoolType()
  const [customInput, setCustomInput] = useState('')
  const [didAutoYear, setDidAutoYear] = useState(false)
  const [bulkAmount, setBulkAmount] = useState('')

  const gradeOptions = useMemo(
    () =>
      gradeLevels
        .map((gl) => gl.gradeLevel?.name || gl.shortName || '')
        .filter((name): name is string => Boolean(name?.trim())),
    [gradeLevels],
  )

  const selectedYear = academicYears.find((y) => y.id === value.academicYearId)
  const sortedTerms = sortTermsForLetter(
    selectedYear?.terms ?? value.terms ?? [],
  )
  const amountBands = groupGradesByTermAmount(value)

  useEffect(() => {
    if (readOnlyYear || didAutoYear || yearsLoading) return
    if (value.academicYearId) {
      setDidAutoYear(true)
      return
    }
    const active = getActiveAcademicYear?.() ?? academicYears[0]
    if (!active) return
    setDidAutoYear(true)
    onChange({
      academicYearId: active.id,
      academicYearName: active.name,
      terms: sortTermsForLetter(active.terms ?? []),
    })
  }, [
    academicYears,
    didAutoYear,
    getActiveAcademicYear,
    onChange,
    readOnlyYear,
    value.academicYearId,
    yearsLoading,
  ])

  useEffect(() => {
    if (readOnlyYear) return
    if (value.selectedGrades.length > 0) return
    if (gradesLoading || gradeOptions.length === 0) return
    onChange({ selectedGrades: gradeOptions })
  }, [
    gradeOptions,
    gradesLoading,
    onChange,
    readOnlyYear,
    value.selectedGrades.length,
  ])

  const toggleGrade = (grade: string) => {
    const set = new Set(value.selectedGrades)
    if (set.has(grade)) set.delete(grade)
    else set.add(grade)
    onChange({ selectedGrades: Array.from(set) })
  }

  const toggleCategory = (cat: string) => {
    if (cat === REQUIRED_LINE) return
    const set = new Set(value.categories)
    if (set.has(cat)) set.delete(cat)
    else set.add(cat)
    const next = Array.from(set)
    if (!next.includes(REQUIRED_LINE)) next.unshift(REQUIRED_LINE)
    onChange({ categories: next })
  }

  const addCustom = () => {
    const name = titleCaseCategory(customInput)
    if (!name || isDuplicateCategory(name, value.categories)) return
    onChange({ categories: [...value.categories, name] })
    setCustomInput('')
  }

  const handleYearChange = (yearId: string) => {
    const year = academicYears.find((y) => y.id === yearId)
    if (!year) return
    onChange({
      academicYearId: year.id,
      academicYearName: year.name,
      terms: sortTermsForLetter(year.terms ?? []),
    })
  }

  const setGradeAmount = (grade: string, amount: number) => {
    onChange({
      gradeAmounts: {
        ...value.gradeAmounts,
        [grade]: amount,
      },
    })
  }

  const applyBulkToSelected = () => {
    const n = Number(bulkAmount.replace(/,/g, '').trim())
    if (!Number.isFinite(n) || n <= 0) return
    const rounded = roundToNearestTen(n)
    if (value.sameFeeForAll) {
      onChange({ termTotalKes: rounded })
    } else {
      const next = { ...value.gradeAmounts }
      for (const g of value.selectedGrades) next[g] = rounded
      onChange({ gradeAmounts: next, termTotalKes: rounded })
    }
    setBulkAmount('')
  }

  const extraPresets = ALL_PRESET_FEE_CATEGORIES.filter(
    (c) => !QUICK_LINES.includes(c as (typeof QUICK_LINES)[number]),
  )

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Enter what each grade pays per term. You&apos;ll split it into tuition,
        lunch, etc. next.
      </p>

      <FeesWizardSection title="Academic year">
        {yearsLoading ? (
          <div className="flex h-10 items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : academicYears.length === 0 ? (
          <p className="text-sm text-amber-800">
            Create an academic year and terms in school settings first.
          </p>
        ) : readOnlyYear || academicYears.length === 1 ? (
          <p className="text-sm font-medium text-slate-800">
            {formatAcademicYearDisplay(
              value.academicYearName || selectedYear?.name || '—',
            )}
            {sortedTerms.length > 0 ? (
              <span className="ml-2 font-normal text-slate-500">
                · {sortedTerms.map((t) => t.name).join(' · ')}
              </span>
            ) : null}
          </p>
        ) : (
          <Select
            value={value.academicYearId || undefined}
            onValueChange={handleYearChange}
          >
            <SelectTrigger
              className={cn('h-10', errors?.academicYearId && 'border-red-500')}
            >
              <SelectValue placeholder="Select academic year" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((y) => (
                <SelectItem key={y.id} value={y.id}>
                  {formatAcademicYearDisplay(y.name)}
                  {y.terms?.length
                    ? ` · ${y.terms.length} term${y.terms.length === 1 ? '' : 's'}`
                    : ''}
                  {y.isActive ? ' · current' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors?.academicYearId ? (
          <p className="mt-1 text-xs text-red-600">{errors.academicYearId}</p>
        ) : null}
        {sortedTerms.length === 0 && value.academicYearId ? (
          <p className="mt-2 text-xs text-amber-800">
            Add at least one term in school settings to continue.
          </p>
        ) : null}
      </FeesWizardSection>

      <FeesWizardSection
        title={`Grades${value.selectedGrades.length ? ` · ${value.selectedGrades.length}` : ''}`}
      >
        {gradesLoading ? (
          <div className="flex h-10 items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading grades…
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {gradeOptions.map((grade) => {
              const on = value.selectedGrades.includes(grade)
              return (
                <button
                  key={grade}
                  type="button"
                  onClick={() => toggleGrade(grade)}
                  className={cn(
                    'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                    on
                      ? 'border-transparent text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                  )}
                  style={on ? { backgroundColor: FEES_BRAND.primary } : undefined}
                >
                  {grade}
                </button>
              )
            })}
          </div>
        )}
        {errors?.selectedGrades ? (
          <p className="mt-2 text-xs text-red-600">{errors.selectedGrades}</p>
        ) : null}
      </FeesWizardSection>

      <FeesWizardSection title="Term totals">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const total = value.termTotalKes || representativeTermTotal(value)
              const nextAmounts = { ...value.gradeAmounts }
              if (total > 0) {
                for (const g of value.selectedGrades) nextAmounts[g] = total
              }
              onChange({
                sameFeeForAll: true,
                termTotalKes: total,
                gradeAmounts: nextAmounts,
              })
            }}
            className={cn(
              'rounded-md border px-3 py-1.5 text-xs font-medium',
              value.sameFeeForAll
                ? 'border-transparent text-white'
                : 'border-slate-200 bg-white text-slate-700',
            )}
            style={
              value.sameFeeForAll
                ? { backgroundColor: FEES_BRAND.primary }
                : undefined
            }
          >
            Same fee for all grades
          </button>
          <button
            type="button"
            onClick={() => {
              const next = { ...value.gradeAmounts }
              const seed = value.termTotalKes
              if (seed > 0) {
                for (const g of value.selectedGrades) {
                  if (!(next[g] > 0)) next[g] = seed
                }
              }
              onChange({ sameFeeForAll: false, gradeAmounts: next })
            }}
            className={cn(
              'rounded-md border px-3 py-1.5 text-xs font-medium',
              !value.sameFeeForAll
                ? 'border-transparent text-white'
                : 'border-slate-200 bg-white text-slate-700',
            )}
            style={
              !value.sameFeeForAll
                ? { backgroundColor: FEES_BRAND.primary }
                : undefined
            }
          >
            Different by grade
          </button>
        </div>

        {value.sameFeeForAll ? (
          <div>
            <div className="flex max-w-xs items-center gap-2">
              <span className="text-sm text-slate-500">KES</span>
              <Input
                type="text"
                inputMode="numeric"
                className={cn(
                  'h-10 tabular-nums',
                  errors?.termTotalKes && 'border-red-500',
                )}
                value={
                  value.termTotalKes > 0
                    ? value.termTotalKes.toLocaleString('en-KE')
                    : ''
                }
                placeholder="e.g. 18,000"
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, '').trim()
                  const n = Number(raw)
                  onChange({
                    termTotalKes: Number.isFinite(n) && n >= 0 ? n : 0,
                  })
                }}
                onBlur={() => {
                  if (value.termTotalKes > 0) {
                    onChange({
                      termTotalKes: roundToNearestTen(value.termTotalKes),
                    })
                  }
                }}
              />
            </div>
            {value.termTotalKes > 0 ? (
              <p className="mt-1.5 text-xs text-slate-500">
                <KesAmount amount={value.termTotalKes} /> per term · each
                selected grade
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                className="h-8 w-36 text-xs tabular-nums"
                placeholder="Amount for all…"
                value={bulkAmount}
                onChange={(e) => setBulkAmount(e.target.value)}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={applyBulkToSelected}
                disabled={!bulkAmount.trim()}
              >
                Apply to selected
              </Button>
            </div>
            <div className="max-h-[min(240px,40vh)] space-y-1.5 overflow-y-auto">
              {value.selectedGrades.map((grade) => {
                const amt = value.gradeAmounts[grade] ?? 0
                return (
                  <div
                    key={grade}
                    className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50/50 px-2.5 py-1.5"
                  >
                    <span className="min-w-0 truncate text-xs font-medium text-slate-800">
                      {grade}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">KES</span>
                      <Input
                        className="h-8 w-28 text-right text-xs tabular-nums"
                        inputMode="numeric"
                        value={amt > 0 ? amt.toLocaleString('en-KE') : ''}
                        placeholder="0"
                        onChange={(e) => {
                          const raw = e.target.value.replace(/,/g, '').trim()
                          const n = Number(raw)
                          setGradeAmount(
                            grade,
                            Number.isFinite(n) && n >= 0 ? n : 0,
                          )
                        }}
                        onBlur={() => {
                          if (amt > 0) {
                            setGradeAmount(grade, roundToNearestTen(amt))
                          }
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            {amountBands.length > 1 ? (
              <p className="text-xs text-slate-600">
                Will create{' '}
                <span className="font-medium text-slate-800">
                  {amountBands.length} fee schedules
                </span>{' '}
                (one per amount). Breakdown uses the first grade&apos;s total;
                other amounts keep the same line mix, scaled.
              </p>
            ) : null}
          </div>
        )}
        {errors?.termTotalKes ? (
          <p className="mt-1 text-xs text-red-600">{errors.termTotalKes}</p>
        ) : null}
      </FeesWizardSection>

      <FeesWizardSection title="Lines on the bill">
        <p className="mb-2 text-xs text-slate-500">
          Tuition is required. Add others only if you charge them.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_LINES.map((cat) => {
            const on = value.categories.includes(cat)
            const required = cat === REQUIRED_LINE
            return (
              <button
                key={cat}
                type="button"
                disabled={required}
                onClick={() => toggleCategory(cat)}
                className={cn(
                  'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                  on
                    ? 'border-transparent text-white'
                    : 'border-dashed border-slate-300 text-slate-600',
                  required && 'cursor-default opacity-90',
                )}
                style={on ? { backgroundColor: FEES_BRAND.primary } : undefined}
              >
                {cat}
                {required ? ' · Req' : ''}
              </button>
            )
          })}
          {value.categories
            .filter(
              (c) =>
                !QUICK_LINES.includes(c as (typeof QUICK_LINES)[number]),
            )
            .map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className="rounded-md border border-transparent px-2.5 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: FEES_BRAND.primary }}
              >
                {cat} ×
              </button>
            ))}
        </div>

        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-medium text-slate-600">
            More fee lines
          </summary>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {extraPresets.map((cat) => {
              const on = value.categories.includes(cat)
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    'rounded-md border px-2 py-0.5 text-[11px] font-medium',
                    on
                      ? 'border-transparent text-white'
                      : 'border-slate-200 bg-white text-slate-600',
                  )}
                  style={on ? { backgroundColor: FEES_BRAND.primary } : undefined}
                >
                  {cat}
                </button>
              )
            })}
          </div>
          <div className="mt-2 flex gap-2">
            <Input
              className="h-8 text-xs"
              placeholder="Custom line…"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustom()
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1 px-2.5 text-xs"
              onClick={addCustom}
              disabled={!customInput.trim()}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </details>
        {errors?.categories ? (
          <p className="mt-2 text-xs text-red-600">{errors.categories}</p>
        ) : null}
      </FeesWizardSection>
    </div>
  )
}
