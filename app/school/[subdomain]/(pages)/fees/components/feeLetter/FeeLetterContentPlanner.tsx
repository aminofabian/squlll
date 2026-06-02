'use client'

import { GraduationCap, CalendarRange, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FEES_BRAND } from '../../lib/fees-ui'
import { LetterGradeSelector } from '../FeeStructureWizard/LetterGradeSelector'
import { LetterTermSelector } from '../FeeStructureWizard/LetterTermSelector'

type FeeLetterContentPlannerProps = {
  grades: string[]
  previewGrade: string
  onGradeChange: (grade: string) => void
  terms: Array<{ id: string; name: string }>
  selectedTermIds: string[]
  onTermIdsChange: (ids: string[]) => void
  termScopeHint?: string | null
}

function PlannerStep({
  step,
  title,
  hint,
  icon: Icon,
  children,
}: {
  step: number
  title: string
  hint: string
  icon: typeof GraduationCap
  children: React.ReactNode
}) {
  return (
    <div className="fee-letter-planner-step flex min-h-0 flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
          style={{ backgroundColor: FEES_BRAND.primary }}
        >
          {step}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: FEES_BRAND.primary }} />
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          </div>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{hint}</p>
        </div>
      </div>
      <div className="pl-11">{children}</div>
    </div>
  )
}

export function FeeLetterContentPlanner({
  grades,
  previewGrade,
  onGradeChange,
  terms,
  selectedTermIds,
  onTermIdsChange,
  termScopeHint,
}: FeeLetterContentPlannerProps) {
  const scopeLabel =
    termScopeHint ||
    (previewGrade ? `Grade: ${previewGrade}` : 'Select grade and terms')

  return (
    <section className="fee-letter-content-planner overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/90 shadow-sm">
      <div
        className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 sm:px-5"
        style={{ backgroundColor: `${FEES_BRAND.primary}06` }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Step 1 · Letter content
        </p>
        <div className="hidden items-center gap-1 sm:flex">
          {[1, 2].map((n) => (
            <span
              key={n}
              className={cn(
                'h-1.5 rounded-full transition-all',
                n === 1 ? 'w-6' : 'w-1.5',
              )}
              style={{
                backgroundColor: n === 1 ? FEES_BRAND.primary : '#cbd5e1',
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-slate-100">
        <PlannerStep
          step={1}
          title="Grade on the letter"
          hint="Shown in the title parents read on the printout."
          icon={GraduationCap}
        >
          <LetterGradeSelector
            grades={grades}
            value={previewGrade}
            onChange={onGradeChange}
            variant="planner"
            showHelper={false}
          />
        </PlannerStep>

        {terms.length > 0 ? (
          <PlannerStep
            step={2}
            title="Terms to include"
            hint="Full year or pick specific terms — tap to toggle."
            icon={CalendarRange}
          >
            <LetterTermSelector
              terms={terms}
              selectedIds={selectedTermIds}
              onChange={onTermIdsChange}
              variant="planner"
              showHelper={false}
            />
          </PlannerStep>
        ) : (
          <div className="hidden lg:block" aria-hidden />
        )}
      </div>

      <div
        className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        style={{ backgroundColor: FEES_BRAND.surface }}
      >
        <p className="text-[11px] text-slate-500">
          Fee tabs above are for editing amounts only — not printed on the letter.
        </p>
        <div
          className="inline-flex items-center gap-2 self-start rounded-lg px-3 py-1.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200/80 sm:self-auto"
          style={{ backgroundColor: '#fff' }}
        >
          <span className="text-slate-400">Preview scope</span>
          <ArrowRight className="h-3 w-3 text-slate-300" />
          <span className="font-semibold" style={{ color: FEES_BRAND.primaryDark }}>
            {scopeLabel}
          </span>
        </div>
      </div>
    </section>
  )
}
