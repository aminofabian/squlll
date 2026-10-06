'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Check,
  ChevronDown,
  Info,
  Loader2,
  Plus,
  Wallet,
  X,
} from 'lucide-react'
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

/** Plain-language help for the most common fee lines */
const LINE_HINTS: Record<string, string> = {
  Tuition: 'Lessons, teaching and exams',
  Lunch: 'Meals during the school day',
  Transport: 'Getting to and from school',
  Boarding: 'Accommodation and care',
}

/** One-tap term totals for the most common school fees */
const COMMON_AMOUNTS = [10000, 15000, 20000, 30000, 50000]

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

/** Friendly inline validation message */
function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-2 text-xs font-medium text-red-600" role="alert">
      {message}
    </p>
  )
}

/** A single selectable fee line, e.g. "Lunch" */
function FeeLineOption({
  label,
  hint,
  checked,
  locked,
  onToggle,
}: {
  label: string
  hint?: string
  checked: boolean
  locked?: boolean
  onToggle: () => void
}) {
  const id = `fee-line-${label.replace(/\s+/g, '-').toLowerCase()}`

  if (locked) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2.5">
        <span
          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px]"
          style={{ backgroundColor: FEES_BRAND.primary }}
          aria-hidden
        >
          <Check className="h-3 w-3 text-white" />
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-slate-900">
            {label}
            <span className="rounded bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              Always included
            </span>
          </span>
          {hint ? (
            <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>
          ) : null}
        </span>
      </div>
    )
  }

  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
        checked
          ? 'border-emerald-300 bg-emerald-50/70'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60',
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>
        ) : null}
      </span>
    </label>
  )
}

/** Big radio-style card used to choose how fees are set */
function FeeModeCard({
  selected,
  onSelect,
  title,
  description,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors',
        selected
          ? 'border-transparent'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60',
      )}
      style={
        selected
          ? {
              backgroundColor: FEES_BRAND.primaryLight,
              boxShadow: `inset 0 0 0 1px ${FEES_BRAND.primary}`,
            }
          : undefined
      }
    >
      <span
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
          selected ? 'border-transparent' : 'border-slate-300',
        )}
        style={selected ? { backgroundColor: FEES_BRAND.primary } : undefined}
        aria-hidden
      >
        {selected ? <Check className="h-3 w-3 text-white" /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-900">
          {title}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
          {description}
        </span>
      </span>
    </button>
  )
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
  const [customError, setCustomError] = useState('')
  const [showExtraLines, setShowExtraLines] = useState(false)
  const didAutoYear = useRef(false)
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

  const gradeCount = value.selectedGrades.length
  const termsCount = sortedTerms.length
  const annualTotal =
    termsCount > 0 ? value.termTotalKes * termsCount : 0
  const allGradesSelected =
    gradeOptions.length > 0 &&
    gradeOptions.every((g) => value.selectedGrades.includes(g))

  const extraPresets = useMemo(
    () =>
      ALL_PRESET_FEE_CATEGORIES.filter(
        (c) => !QUICK_LINES.includes(c as (typeof QUICK_LINES)[number]),
      ),
    [],
  )
  const selectedExtraPresets = extraPresets.filter((c) =>
    value.categories.includes(c),
  )
  const customLines = value.categories.filter(
    (c) =>
      !QUICK_LINES.includes(c as (typeof QUICK_LINES)[number]) &&
      !ALL_PRESET_FEE_CATEGORIES.includes(c),
  )

  useEffect(() => {
    if (readOnlyYear || didAutoYear.current || yearsLoading) return
    if (value.academicYearId) {
      didAutoYear.current = true
      return
    }
    const active = getActiveAcademicYear?.() ?? academicYears[0]
    if (!active) return
    didAutoYear.current = true
    onChange({
      academicYearId: active.id,
      academicYearName: active.name,
      terms: sortTermsForLetter(active.terms ?? []),
    })
  }, [
    academicYears,
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
    if (!name) return
    if (isDuplicateCategory(name, value.categories)) {
      setCustomError('That charge is already on the list.')
      return
    }
    onChange({ categories: [...value.categories, name] })
    setCustomInput('')
    setCustomError('')
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
    const next = { ...value.gradeAmounts }
    for (const g of value.selectedGrades) next[g] = rounded
    onChange({ gradeAmounts: next, termTotalKes: rounded })
    setBulkAmount('')
  }

  const selectSameForAll = () => {
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
  }

  const selectDifferentByGrade = () => {
    const next = { ...value.gradeAmounts }
    const seed = value.termTotalKes
    if (seed > 0) {
      for (const g of value.selectedGrades) {
        if (!(next[g] > 0)) next[g] = seed
      }
    }
    onChange({ sameFeeForAll: false, gradeAmounts: next })
  }

  const setTermTotal = (amount: number) => onChange({ termTotalKes: amount })

  const selectedCountLabel = gradeCount
    ? `${gradeCount} selected`
    : 'None selected'

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: FEES_BRAND.primaryLight }}
          aria-hidden
        >
          <Wallet className="h-4 w-4" style={{ color: FEES_BRAND.primary }} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            Start with the total each student pays in one term
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Pick the year and grades, type one term total, then tick what it
            covers. On the next step you&apos;ll split that total into fee
            lines.
          </p>
        </div>
      </div>

      <FeesWizardSection
        title="Which year?"
        description="These fees apply to the terms in this academic year."
      >
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
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-medium text-slate-800">
              {formatAcademicYearDisplay(
                value.academicYearName || selectedYear?.name || '—',
              )}
            </p>
            {sortedTerms.length > 0 ? (
              <span className="text-sm text-slate-500">
                · {sortedTerms.map((t) => t.name).join(' · ')}
              </span>
            ) : null}
          </div>
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
        <FieldError message={errors?.academicYearId} />
        {sortedTerms.length === 0 && value.academicYearId ? (
          <p className="mt-2 text-xs text-amber-800">
            Add at least one term in school settings to continue.
          </p>
        ) : null}
      </FeesWizardSection>

      <FeesWizardSection
        title="Which grades?"
        description="Every selected grade pays the amount below."
        action={
          gradeOptions.length > 1 ? (
            <button
              type="button"
              onClick={() =>
                onChange({
                  selectedGrades: allGradesSelected ? [] : [...gradeOptions],
                })
              }
              className="text-xs font-medium text-emerald-700 hover:underline"
            >
              {allGradesSelected ? 'Clear all' : 'Select all'}
            </button>
          ) : undefined
        }
      >
        {gradesLoading ? (
          <div className="flex h-10 items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading grades…
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              {gradeOptions.map((grade) => {
                const on = value.selectedGrades.includes(grade)
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleGrade(grade)}
                    aria-pressed={on}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                      on
                        ? 'border-transparent text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                    )}
                    style={
                      on ? { backgroundColor: FEES_BRAND.primary } : undefined
                    }
                  >
                    {on ? <Check className="h-3.5 w-3.5" /> : null}
                    {grade}
                  </button>
                )
              })}
            </div>
            <p className="mt-2.5 text-xs text-slate-500">{selectedCountLabel}</p>
          </>
        )}
        <FieldError message={errors?.selectedGrades} />
      </FeesWizardSection>

      <FeesWizardSection
        title="How much per student?"
        description="This is the total for one term, per student — you'll split it into fee lines next."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <FeeModeCard
            selected={value.sameFeeForAll}
            onSelect={selectSameForAll}
            title="Same for every grade"
            description="One term total for all the grades you picked."
          />
          <FeeModeCard
            selected={!value.sameFeeForAll}
            onSelect={selectDifferentByGrade}
            title="Different for each grade"
            description="Set a separate term total for each grade."
          />
        </div>

        {value.sameFeeForAll ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
            <Label htmlFor="term-total" className="text-sm text-slate-700">
              Fee per student, each term
            </Label>
            <div className="mt-2 flex items-center gap-2">
              <div className="relative w-full max-w-[15rem]">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                  KES
                </span>
                <Input
                  id="term-total"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  className={cn(
                    'h-11 pl-12 text-base font-medium tabular-nums',
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
                    setTermTotal(Number.isFinite(n) && n >= 0 ? n : 0)
                  }}
                  onBlur={() => {
                    if (value.termTotalKes > 0) {
                      setTermTotal(roundToNearestTen(value.termTotalKes))
                    }
                  }}
                />
              </div>
              <span className="text-sm text-slate-500">per term</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500">Common totals:</span>
              {COMMON_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setTermTotal(amount)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium tabular-nums transition-colors',
                    value.termTotalKes === amount
                      ? 'border-transparent text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                  )}
                  style={
                    value.termTotalKes === amount
                      ? { backgroundColor: FEES_BRAND.primary }
                      : undefined
                  }
                >
                  {amount.toLocaleString('en-KE')}
                </button>
              ))}
            </div>

            {value.termTotalKes > 0 ? (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-emerald-900">
                    Term total per student
                  </span>
                  <KesAmount amount={value.termTotalKes} size="sm" />
                </div>
                <p className="mt-1 text-xs text-emerald-800/80">
                  {gradeCount > 0
                    ? `Applies to ${gradeCount} grade${gradeCount === 1 ? '' : 's'}.`
                    : 'Applies to every selected grade.'}
                  {termsCount > 1
                    ? ` About KES ${annualTotal.toLocaleString('en-KE')} a year across ${termsCount} terms.`
                    : ''}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-xs font-medium text-slate-600">
                Fill every grade with
              </span>
              <div className="relative w-40">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                  KES
                </span>
                <Input
                  className="h-9 pl-11 text-sm tabular-nums"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="18,000"
                  value={bulkAmount}
                  onChange={(e) => setBulkAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      applyBulkToSelected()
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 text-xs"
                onClick={applyBulkToSelected}
                disabled={!bulkAmount.trim()}
              >
                Apply to all
              </Button>
            </div>

            <div className="max-h-[min(320px,45vh)] space-y-1.5 overflow-y-auto pr-0.5">
              {value.selectedGrades.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Select at least one grade above to set amounts.
                </p>
              ) : (
                value.selectedGrades.map((grade) => {
                  const amt = value.gradeAmounts[grade] ?? 0
                  return (
                    <div
                      key={grade}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-sm font-medium text-slate-900">
                        {grade}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-slate-500">KES</span>
                        <Input
                          className="h-9 w-28 text-right text-sm tabular-nums"
                          inputMode="numeric"
                          autoComplete="off"
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
                })
              )}
            </div>

            {amountBands.length > 1 ? (
              <p className="flex items-start gap-1.5 text-xs text-slate-600">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>
                  These grades pay{' '}
                  <span className="font-medium text-slate-800">
                    {amountBands.length} different amounts
                  </span>
                  , so we&apos;ll create {amountBands.length} fee schedules. The
                  next step splits the first one.
                </span>
              </p>
            ) : null}
          </div>
        )}

        <FieldError message={errors?.termTotalKes} />
      </FeesWizardSection>

      <FeesWizardSection
        title="What does the fee cover?"
        description="Tick everything included in the term total above. Tuition is always included."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {QUICK_LINES.map((cat) => (
            <FeeLineOption
              key={cat}
              label={cat}
              hint={LINE_HINTS[cat]}
              checked={value.categories.includes(cat)}
              locked={cat === REQUIRED_LINE}
              onToggle={() => toggleCategory(cat)}
            />
          ))}
        </div>

        {extraPresets.length > 0 ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowExtraLines((v) => !v)}
              aria-expanded={showExtraLines}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline"
            >
              {showExtraLines
                ? 'Hide extra charge types'
                : `Show ${extraPresets.length} more charge types`}
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  showExtraLines && 'rotate-180',
                )}
              />
            </button>

            {showExtraLines ? (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {extraPresets.map((cat) => (
                  <FeeLineOption
                    key={cat}
                    label={cat}
                    checked={value.categories.includes(cat)}
                    onToggle={() => toggleCategory(cat)}
                  />
                ))}
              </div>
            ) : selectedExtraPresets.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedExtraPresets.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="inline-flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: FEES_BRAND.primary }}
                  >
                    {cat}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 border-t border-slate-100 pt-3">
          <Label
            htmlFor="custom-fee-line"
            className="text-sm text-slate-700"
          >
            Add your own charge
          </Label>
          <p className="mt-0.5 text-xs text-slate-500">
            For anything not listed, like swimming or music lessons.
          </p>
          <div className="mt-2 flex gap-2">
            <Input
              id="custom-fee-line"
              className={cn(
                'h-9 text-sm',
                customError && 'border-red-500',
              )}
              placeholder="e.g. Swimming, Music lessons"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value)
                if (customError) setCustomError('')
              }}
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
              className="h-9 shrink-0 gap-1 px-3 text-xs"
              onClick={addCustom}
              disabled={!customInput.trim()}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          {customError ? (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {customError}
            </p>
          ) : null}

          {customLines.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {customLines.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className="inline-flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: FEES_BRAND.primary }}
                >
                  {cat}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <FieldError message={errors?.categories} />
      </FeesWizardSection>
    </div>
  )
}
