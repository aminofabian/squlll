'use client'

import { useMemo, useState } from 'react'
import {
  CalendarRange,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  School,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import type { TermDraft } from '@/lib/utils/school-calendar-presets'
import { STREAM_NAME_SUGGESTIONS } from '@/lib/utils/school-calendar-presets'
import {
  DateField,
  FieldGroup,
  PresetOption,
  StepBody,
  StepIntro,
  onboardingInputClass,
} from './onboarding-ui'

export function DoneBanner({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/80 dark:bg-emerald-950/40 dark:border-emerald-800 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">{label}</p>
        <p className="text-sm text-emerald-700/90 dark:text-emerald-300/90 mt-1">{detail}</p>
      </div>
    </div>
  )
}

export function formatDisplayDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

type AcademicYearStepProps = {
  hasAcademicYear: boolean
  activeYearLabel?: string
  activeYearRange?: string
  form: { name: string; startDate: string; endDate: string }
  onFormChange: (field: 'name' | 'startDate' | 'endDate', value: string) => void
  onSuggestCurrentYear: () => void
  onSuggestMoe: () => void
  suggestedYearLabel: string
  moeYear: number
  isCreating: boolean
  onCreate: () => void
}

type YearPreset = 'standard' | 'moe' | 'custom'

export function AcademicYearStepContent({
  hasAcademicYear,
  activeYearLabel,
  activeYearRange,
  form,
  onFormChange,
  onSuggestCurrentYear,
  onSuggestMoe,
  suggestedYearLabel,
  moeYear,
  isCreating,
  onCreate,
}: AcademicYearStepProps) {
  const [activePreset, setActivePreset] = useState<YearPreset | null>('standard')

  const preview = useMemo(() => {
    if (!form.startDate || !form.endDate) return null
    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) return null
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return {
      days,
      range: `${formatDisplayDate(form.startDate)} – ${formatDisplayDate(form.endDate)}`,
    }
  }, [form.startDate, form.endDate])

  const isValid =
    form.name.trim() &&
    form.startDate &&
    form.endDate &&
    new Date(form.startDate) < new Date(form.endDate)

  if (hasAcademicYear && activeYearLabel && activeYearRange) {
    return (
      <>
        <StepIntro
          icon={CalendarRange}
          title="Academic year"
          description="Your school calendar is ready for terms and classes."
        />
        <StepBody>
          <DoneBanner label={`${activeYearLabel} is ready`} detail={activeYearRange} />
        </StepBody>
      </>
    )
  }

  const selectStandard = () => {
    setActivePreset('standard')
    onSuggestCurrentYear()
  }

  const selectMoe = () => {
    setActivePreset('moe')
    onSuggestMoe()
  }

  return (
    <>
      <StepIntro
        icon={CalendarRange}
        title="Academic year"
        description="Choose a quick template or enter your own dates. You can edit everything before saving."
      />
      <StepBody className="space-y-7">
        <section>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-3">
            Quick fill
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PresetOption
              selected={activePreset === 'standard'}
              onClick={selectStandard}
              icon={School}
              title={`${suggestedYearLabel} school year`}
              subtitle={`1 Jan – 31 Dec ${suggestedYearLabel}`}
              badge="Common"
            />
            <PresetOption
              selected={activePreset === 'moe'}
              onClick={selectMoe}
              icon={Sparkles}
              title={`Kenya MoE ${moeYear}`}
              subtitle="Official ministry term calendar dates"
            />
          </div>
        </section>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400">
              or customize
            </span>
          </div>
        </div>

        <section className="space-y-4">
          <FieldGroup label="Year name" htmlFor="year-name" hint="Shown across fees, reports, and timetables">
            <Input
              id="year-name"
              placeholder={`e.g. ${suggestedYearLabel}`}
              value={form.name}
              onChange={(e) => {
                setActivePreset('custom')
                onFormChange('name', e.target.value)
              }}
              className={onboardingInputClass}
            />
          </FieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Starts" htmlFor="year-start">
              <DateField
                id="year-start"
                value={form.startDate}
                max={form.endDate || undefined}
                onChange={(v) => {
                  setActivePreset('custom')
                  onFormChange('startDate', v)
                }}
              />
            </FieldGroup>
            <FieldGroup label="Ends" htmlFor="year-end">
              <DateField
                id="year-end"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(v) => {
                  setActivePreset('custom')
                  onFormChange('endDate', v)
                }}
              />
            </FieldGroup>
          </div>
        </section>

        {preview && (
          <div className="rounded-xl border border-[#246a59]/20 bg-[#246a59]/5 px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {form.name || 'Untitled year'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{preview.range}</p>
            </div>
            <span className="text-xs font-medium text-[#246a59] bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border border-[#246a59]/15">
              {preview.days} days
            </span>
          </div>
        )}

        <Button
          onClick={onCreate}
          disabled={isCreating || !isValid}
          className="w-full h-12 rounded-xl text-base font-medium bg-[#246a59] hover:bg-[#1a4d42] shadow-sm"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating…
            </>
          ) : (
            'Create academic year'
          )}
        </Button>
      </StepBody>
    </>
  )
}

type TermsStepProps = {
  hasAcademicYear: boolean
  hasTerms: boolean
  academicYearName?: string
  existingTermNames?: string
  termDrafts: TermDraft[]
  onTermDraftsChange: (drafts: TermDraft[]) => void
  termMode: 'suggested' | 'moe' | 'custom'
  onTermModeChange: (mode: 'suggested' | 'moe' | 'custom') => void
  suggestedTermCount: number
  onSuggestedTermCountChange: (n: number) => void
  onApplySuggested: () => void
  onApplyMoe: () => void
  moeYear: number
  customTerm: TermDraft
  onCustomTermChange: (t: TermDraft) => void
  isCreating: boolean
  onCreateDrafts: () => void
  onAddCustomTerm: () => void
}

export function TermsStepContent({
  hasAcademicYear,
  hasTerms,
  academicYearName,
  existingTermNames,
  termDrafts,
  onTermDraftsChange,
  termMode,
  onTermModeChange,
  suggestedTermCount,
  onSuggestedTermCountChange,
  onApplySuggested,
  onApplyMoe,
  moeYear,
  customTerm,
  onCustomTermChange,
  isCreating,
  onCreateDrafts,
  onAddCustomTerm,
}: TermsStepProps) {
  if (!hasAcademicYear) {
    return (
      <p className="text-sm text-slate-500 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4">
        Go back and create an academic year first.
      </p>
    )
  }

  if (hasTerms && existingTermNames) {
    return <DoneBanner label="Terms are set up" detail={existingTermNames} />
  }

  const updateDraft = (index: number, field: keyof TermDraft, value: string) => {
    const next = [...termDrafts]
    next[index] = { ...next[index], [field]: value }
    onTermDraftsChange(next)
  }

  const modeOptions = [
    { id: 'suggested' as const, label: 'Auto-split' },
    { id: 'moe' as const, label: `MoE ${moeYear}` },
    { id: 'custom' as const, label: 'Add manually' },
  ]

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Divide <strong className="text-slate-800 dark:text-slate-200">{academicYearName}</strong> into
        teaching periods. Pick a template, edit the list, then save.
      </p>

      <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 gap-1">
        {modeOptions.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTermModeChange(id)}
            className={`flex-1 text-xs sm:text-sm font-medium py-2.5 px-2 rounded-lg transition-all ${
              termMode === id
                ? 'bg-white dark:bg-slate-900 text-[#246a59] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {termMode === 'suggested' && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Label className="text-sm">Number of terms</Label>
              {[2, 3, 4].map((n) => (
                <Button
                  key={n}
                  type="button"
                  size="sm"
                  variant={suggestedTermCount === n ? 'secondary' : 'ghost'}
                  onClick={() => onSuggestedTermCountChange(n)}
                >
                  {n}
                </Button>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={onApplySuggested}>
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Generate dates
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              We&apos;ll spread dates evenly across your academic year. You can edit each row below.
            </p>
          </CardContent>
        </Card>
      )}

      {termMode === 'moe' && (
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Optional shortcut for Kenyan public schools — official {moeYear} term dates from the Ministry of
              Education.
            </p>
            <Button type="button" size="sm" variant="outline" onClick={onApplyMoe}>
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Load MoE term dates
            </Button>
          </CardContent>
        </Card>
      )}

      {termMode === 'custom' && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input
                  placeholder="Term 1"
                  value={customTerm.name}
                  onChange={(e) => onCustomTermChange({ ...customTerm, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Start</Label>
                <DateField
                  compact
                  showHint={false}
                  value={customTerm.startDate}
                  onChange={(v) => onCustomTermChange({ ...customTerm, startDate: v })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End</Label>
                <DateField
                  compact
                  showHint={false}
                  value={customTerm.endDate}
                  min={customTerm.startDate || undefined}
                  onChange={(v) => onCustomTermChange({ ...customTerm, endDate: v })}
                />
              </div>
            </div>
            <Button type="button" size="sm" variant="secondary" onClick={onAddCustomTerm}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add to list
            </Button>
          </CardContent>
        </Card>
      )}

      {termDrafts.length > 0 && (
        <div className="space-y-3">
          <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Terms to create ({termDrafts.length})
          </Label>
          <ul className="rounded-xl border border-slate-200 dark:border-slate-700 divide-y max-h-56 overflow-y-auto">
            {termDrafts.map((term, i) => (
              <li
                key={`${term.name}-${i}`}
                className="p-3 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center bg-white dark:bg-slate-900"
              >
                <Input
                  value={term.name}
                  onChange={(e) => updateDraft(i, 'name', e.target.value)}
                  className={`h-10 ${onboardingInputClass}`}
                />
                <DateField
                  compact
                  showHint={false}
                  value={term.startDate}
                  aria-label={`${term.name} start date`}
                  onChange={(v) => updateDraft(i, 'startDate', v)}
                />
                <DateField
                  compact
                  showHint={false}
                  value={term.endDate}
                  min={term.startDate || undefined}
                  aria-label={`${term.name} end date`}
                  onChange={(v) => updateDraft(i, 'endDate', v)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => onTermDraftsChange(termDrafts.filter((_, j) => j !== i))}
                  aria-label="Remove term"
                >
                  <Trash2 className="h-4 w-4 text-slate-400" />
                </Button>
              </li>
            ))}
          </ul>
          <Button
            onClick={onCreateDrafts}
            disabled={isCreating || termDrafts.length === 0}
            className="w-full h-12 rounded-xl bg-[#246a59] hover:bg-[#1a4d42]"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving terms...
              </>
            ) : (
              `Save ${termDrafts.length} term${termDrafts.length === 1 ? '' : 's'}`
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export type StreamDraft = { id: string; name: string; capacity: string }

export type GradeStreamPlans = Record<string, StreamDraft[]>

type GradeRow = {
  gradeId: string
  gradeName: string
  levelName: string
  existingStreams: string[]
}

type StreamsStepProps = {
  gradeRows: GradeRow[]
  gradeStreamPlans: GradeStreamPlans
  onGradeStreamPlansChange: (plans: GradeStreamPlans) => void
  isCreating: boolean
  onCreateSelected: () => void
}

function newStreamDraft(name = '', capacity = '30'): StreamDraft {
  return { id: `stream-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, capacity }
}

function cloneDrafts(drafts: StreamDraft[]): StreamDraft[] {
  return drafts.map((d) => newStreamDraft(d.name, d.capacity))
}

function countPlannedCreates(gradeRows: GradeRow[], plans: GradeStreamPlans): number {
  let total = 0
  for (const grade of gradeRows) {
    for (const draft of plans[grade.gradeId] || []) {
      const name = draft.name.trim()
      if (!name) continue
      if (grade.existingStreams.some((s) => s.toLowerCase() === name.toLowerCase())) continue
      total++
    }
  }
  return total
}

export function StreamsStepContent({
  gradeRows,
  gradeStreamPlans,
  onGradeStreamPlansChange,
  isCreating,
  onCreateSelected,
}: StreamsStepProps) {
  if (gradeRows.length === 0) {
    return (
      <p className="text-sm text-slate-500 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4">
        No grades found from your curriculum setup. Finish setup first or add levels on the Classes page.
      </p>
    )
  }

  const plannedCreates = countPlannedCreates(gradeRows, gradeStreamPlans)
  const sourceGradeId = gradeRows[0]?.gradeId

  const setGradePlans = (gradeId: string, drafts: StreamDraft[]) => {
    onGradeStreamPlansChange({ ...gradeStreamPlans, [gradeId]: drafts })
  }

  const addStreamToGrade = (gradeId: string, name = '', capacity = '30') => {
    const current = gradeStreamPlans[gradeId] || []
    setGradePlans(gradeId, [...current, newStreamDraft(name, capacity)])
  }

  const addPresetsToGrade = (gradeId: string, names: string[], existing: string[]) => {
    const current = gradeStreamPlans[gradeId] || []
    const have = new Set([
      ...existing.map((s) => s.toLowerCase()),
      ...current.map((d) => d.name.trim().toLowerCase()).filter(Boolean),
    ])
    const toAdd = names.filter((n) => !have.has(n.toLowerCase())).map((n) => newStreamDraft(n, '30'))
    if (toAdd.length > 0) {
      setGradePlans(gradeId, [...current, ...toAdd])
    }
  }

  const updateGradeDraft = (
    gradeId: string,
    draftId: string,
    field: 'name' | 'capacity',
    value: string,
  ) => {
    const current = gradeStreamPlans[gradeId] || []
    setGradePlans(
      gradeId,
      current.map((d) => (d.id === draftId ? { ...d, [field]: value } : d)),
    )
  }

  const removeGradeDraft = (gradeId: string, draftId: string) => {
    const current = gradeStreamPlans[gradeId] || []
    if (current.length <= 1) return
    setGradePlans(
      gradeId,
      current.filter((d) => d.id !== draftId),
    )
  }

  const copyPlansToAllGrades = () => {
    const template = gradeStreamPlans[sourceGradeId] || []
    if (template.length === 0) return
    const next = { ...gradeStreamPlans }
    for (const g of gradeRows) {
      if (g.gradeId === sourceGradeId) continue
      const cloned = cloneDrafts(template).filter(
        (d) =>
          !g.existingStreams.some((s) => s.toLowerCase() === d.name.trim().toLowerCase()),
      )
      next[g.gradeId] = cloned
    }
    onGradeStreamPlansChange(next)
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Set up streams <strong>per grade</strong>. Grade 4 might have A and B, while Grade 5 only has
        A — configure each class separately below.
      </p>

      {gradeRows.length > 1 && (gradeStreamPlans[sourceGradeId]?.length ?? 0) > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={copyPlansToAllGrades}
        >
          Copy {gradeRows[0]?.gradeName}&apos;s streams to all grades
        </Button>
      )}

      <ul className="space-y-4 max-h-[min(28rem,60vh)] overflow-y-auto pr-1">
        {gradeRows.map((grade) => {
          const drafts = gradeStreamPlans[grade.gradeId] || []
          const pendingNames = drafts
            .map((d) => d.name.trim())
            .filter(
              (name) =>
                name &&
                !grade.existingStreams.some((s) => s.toLowerCase() === name.toLowerCase()),
            )

          return (
            <li
              key={grade.gradeId}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {grade.gradeName}
                    </p>
                    <p className="text-xs text-slate-500">{grade.levelName}</p>
                  </div>
                  {grade.existingStreams.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {grade.existingStreams.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                        >
                          {s} ✓
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-2">
                {drafts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No new streams — add one below.</p>
                ) : (
                  drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="grid gap-2 sm:grid-cols-[1fr_88px_auto] sm:items-center"
                    >
                      <Input
                        placeholder="Stream name"
                        value={draft.name}
                        onChange={(e) =>
                          updateGradeDraft(grade.gradeId, draft.id, 'name', e.target.value)
                        }
                        className={`h-10 ${onboardingInputClass}`}
                      />
                      <Input
                        type="number"
                        min={1}
                        placeholder="Cap."
                        value={draft.capacity}
                        onChange={(e) =>
                          updateGradeDraft(grade.gradeId, draft.id, 'capacity', e.target.value)
                        }
                        className={`h-10 ${onboardingInputClass}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-slate-400 hover:text-red-600"
                        disabled={drafts.length <= 1}
                        onClick={() => removeGradeDraft(grade.gradeId, draft.id)}
                        aria-label={`Remove stream from ${grade.gradeName}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => addStreamToGrade(grade.gradeId)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add stream
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => addPresetsToGrade(grade.gradeId, ['A', 'B', 'C'], grade.existingStreams)}
                  >
                    A, B, C
                  </Button>
                  {STREAM_NAME_SUGGESTIONS.filter(
                    (s) =>
                      !grade.existingStreams.some((x) => x.toLowerCase() === s.toLowerCase()) &&
                      !drafts.some((d) => d.name.trim().toLowerCase() === s.toLowerCase()),
                  )
                    .slice(0, 4)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addStreamToGrade(grade.gradeId, s, '30')}
                        className="text-xs px-2 py-1 border border-slate-200 rounded-full bg-white hover:border-[#246a59]/40 hover:text-[#246a59] dark:bg-slate-900"
                      >
                        + {s}
                      </button>
                    ))}
                </div>

                {pendingNames.length > 0 && (
                  <p className="text-xs text-[#246a59] pt-1">
                    Will add: {pendingNames.join(', ')}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {plannedCreates > 0 && (
        <p className="text-sm text-center text-slate-600 dark:text-slate-400 rounded-lg bg-[#246a59]/5 border border-[#246a59]/15 py-2.5 px-3">
          Ready to create <strong className="text-[#246a59]">{plannedCreates}</strong> stream
          {plannedCreates === 1 ? '' : 's'} across your grades
        </p>
      )}

      <Button
        onClick={onCreateSelected}
        disabled={isCreating || plannedCreates === 0}
        className="w-full h-12 rounded-xl bg-[#246a59] hover:bg-[#1a4d42]"
      >
        {isCreating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating streams...
          </>
        ) : plannedCreates > 0 ? (
          `Create ${plannedCreates} stream${plannedCreates === 1 ? '' : 's'}`
        ) : (
          'Add streams to at least one grade'
        )}
      </Button>
    </div>
  )
}
