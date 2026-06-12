'use client'

import type { ReactNode } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Filter,
  GraduationCap,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { examHeroGlowClass } from './exam-session-ui'

interface ExamListHeroProps {
  viewMode: 'overview' | 'student'
  subtitle: string
  selectedGradeLabel?: string | null
  activeSectionLabel?: string
  showGradeControls?: boolean
  showMobileGradeButton?: boolean
  gradePanelOpen?: boolean
  onOpenGrades?: () => void
  onToggleGradePanel?: () => void
  onBackFromStudent?: () => void
  onRefresh?: () => void
  refreshing?: boolean
  createAction?: ReactNode
  filters?: ReactNode
  stats?: Array<{ label: string; value: string | number; accent?: 'teal' | 'emerald' | 'muted' }>
}

function StatPill({
  label,
  value,
  accent = 'muted',
}: {
  label: string
  value: string | number
  accent?: 'teal' | 'emerald' | 'muted'
}) {
  const accents = {
    teal: 'from-[#246a59]/15 to-[#246a59]/5 text-[#246a59] ring-[#246a59]/15',
    emerald: 'from-emerald-500/15 to-emerald-500/5 text-emerald-700 ring-emerald-500/15',
    muted: 'from-slate-100 to-white text-slate-700 ring-slate-200/80 dark:from-slate-800 dark:to-slate-900 dark:text-slate-200 dark:ring-slate-700',
  }
  return (
    <div
      className={cn(
        'flex min-w-[3.5rem] flex-1 flex-col items-center rounded-lg bg-gradient-to-b px-2 py-1 ring-1 backdrop-blur-sm sm:flex-none',
        accents[accent],
      )}
    >
      <span className="text-sm font-bold tabular-nums leading-none">{value}</span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider opacity-90">
        {label}
      </span>
    </div>
  )
}

export function ExamListHero({
  viewMode,
  subtitle,
  selectedGradeLabel,
  activeSectionLabel,
  showGradeControls,
  showMobileGradeButton,
  gradePanelOpen,
  onOpenGrades,
  onToggleGradePanel,
  onBackFromStudent,
  onRefresh,
  refreshing,
  createAction,
  filters,
  stats,
}: ExamListHeroProps) {
  const isStudent = viewMode === 'student'

  return (
    <div className="relative overflow-hidden border-b border-slate-200/60 bg-white/40 dark:border-slate-800 dark:bg-slate-950/40">
      <div className={examHeroGlowClass} aria-hidden />

      <div className="relative mx-auto max-w-6xl px-3 py-2 sm:px-5 sm:py-2.5">
        {/* Title row + actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {isStudent && onBackFromStudent ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 rounded-md border border-slate-200/80 bg-white/80 px-2 text-[11px] text-slate-600 shadow-sm backdrop-blur-md hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300"
                  onClick={onBackFromStudent}
                >
                  <ArrowLeft className="h-3 w-3 shrink-0" />
                  Back
                </Button>
              ) : (
                <span className="inline-flex h-6 items-center gap-1 rounded-md border border-[#246a59]/20 bg-[#246a59]/8 px-2 text-[9px] font-bold uppercase tracking-wider text-[#246a59] dark:border-[#246a59]/30 dark:bg-[#246a59]/15 dark:text-emerald-200">
                  <BookOpen className="h-3 w-3" />
                  Exam module
                </span>
              )}
              {!isStudent && activeSectionLabel ? (
                <span className="inline-flex items-center rounded-full border border-[#246a59]/25 bg-[#246a59]/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#246a59] dark:border-[#246a59]/35 dark:bg-[#246a59]/15 dark:text-emerald-200">
                  {activeSectionLabel}
                </span>
              ) : null}
              {!isStudent ? (
                selectedGradeLabel ? (
                  <span className="inline-flex items-center gap-0.5 rounded-full border border-[#246a59]/25 bg-[#246a59]/8 px-1.5 py-0.5 text-[9px] font-medium text-[#246a59] dark:border-[#246a59]/35 dark:bg-[#246a59]/15 dark:text-emerald-200">
                    <GraduationCap className="h-2.5 w-2.5 shrink-0" />
                    {selectedGradeLabel}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 rounded-full border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    <GraduationCap className="h-2.5 w-2.5 shrink-0 opacity-70" />
                    All grades
                  </span>
                )
              ) : null}
            </div>
            <h1 className="mt-1.5 text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
              {isStudent ? 'Student performance' : 'Exams'}
            </h1>
            <p className="mt-0.5 text-[11px] text-slate-600 sm:text-xs">{subtitle}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {showMobileGradeButton && onOpenGrades ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 rounded-md border-slate-200/80 bg-white/80 px-2 text-[11px] lg:hidden dark:border-slate-700 dark:bg-slate-900/80"
                onClick={onOpenGrades}
              >
                <Filter className="h-3 w-3" />
                Grades
              </Button>
            ) : null}
            {showGradeControls && onToggleGradePanel ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hidden h-7 rounded-md border-slate-200/80 bg-white/80 px-2 text-[11px] lg:inline-flex dark:border-slate-700 dark:bg-slate-900/80"
                onClick={onToggleGradePanel}
              >
                {gradePanelOpen ? 'Hide grades' : 'Show grades'}
              </Button>
            ) : null}
            {onRefresh ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 rounded-md border-slate-200/80 bg-white/80 px-2 text-[11px] dark:border-slate-700 dark:bg-slate-900/80"
                onClick={onRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={cn('h-3 w-3', refreshing && 'animate-spin')} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            ) : null}
            {createAction}
          </div>
        </div>

        {/* Filters + stats on one row when space allows */}
        {filters || (stats && stats.length > 0) ? (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {filters ? (
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded-lg border border-slate-200/70 bg-slate-50/80 px-2 py-1.5 dark:border-slate-700/70 dark:bg-slate-900/50">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                  Filters
                </span>
                {filters}
              </div>
            ) : null}
            {stats && stats.length > 0 ? (
              <div className="grid shrink-0 grid-cols-3 gap-1.5 sm:flex sm:gap-1.5">
                {stats.map((stat) => (
                  <StatPill
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    accent={stat.accent}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
