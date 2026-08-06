'use client'

import type { ReactNode } from 'react'
import {
  ArrowLeft,
  Filter,
  GraduationCap,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

function StatChip({
  label,
  value,
  accent = 'muted',
}: {
  label: string
  value: string | number
  accent?: 'teal' | 'emerald' | 'muted'
}) {
  const accents = {
    teal: 'text-[#246a59]',
    emerald: 'text-emerald-700 dark:text-emerald-400',
    muted: 'text-slate-700 dark:text-slate-200',
  }
  return (
    <div className="flex min-w-0 flex-col items-center px-2.5 py-1 sm:items-start">
      <span className={cn('text-sm font-bold tabular-nums leading-none', accents[accent])}>
        {value}
      </span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
    </div>
  )
}

export function ExamListHero({
  viewMode,
  subtitle,
  selectedGradeLabel,
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
    <div className="border-b border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto max-w-6xl px-3 py-2.5 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {isStudent && onBackFromStudent ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 rounded-md border border-slate-200/80 bg-white px-2 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  onClick={onBackFromStudent}
                >
                  <ArrowLeft className="h-3 w-3 shrink-0" />
                  Back
                </Button>
              ) : null}
              <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                {isStudent ? 'Student performance' : 'Exams'}
              </h1>
              {!isStudent ? (
                selectedGradeLabel ? (
                  <span className="hidden items-center gap-1 rounded-md border border-[#246a59]/20 bg-[#246a59]/8 px-1.5 py-0.5 text-[10px] font-medium text-[#246a59] sm:inline-flex dark:border-[#246a59]/35 dark:bg-[#246a59]/15 dark:text-emerald-200">
                    <GraduationCap className="h-3 w-3 shrink-0" />
                    {selectedGradeLabel}
                  </span>
                ) : (
                  <span className="hidden items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:inline-flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    <GraduationCap className="h-3 w-3 shrink-0 opacity-70" />
                    All grades
                  </span>
                )
              ) : null}
            </div>
            <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">{subtitle}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {showMobileGradeButton && onOpenGrades ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 rounded-md border-slate-200/80 bg-white px-2 text-[11px] lg:hidden dark:border-slate-700 dark:bg-slate-900"
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
                className="hidden h-7 rounded-md border-slate-200/80 bg-white px-2 text-[11px] lg:inline-flex dark:border-slate-700 dark:bg-slate-900"
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
                className="h-7 gap-1 rounded-md border-slate-200/80 bg-white px-2 text-[11px] dark:border-slate-700 dark:bg-slate-900"
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

        {(filters || (stats && stats.length > 0)) ? (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
            {filters ? (
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50/90 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900/60">
                {filters}
              </div>
            ) : null}
            {stats && stats.length > 0 ? (
              <div className="grid shrink-0 grid-cols-3 divide-x divide-slate-200/80 rounded-lg border border-slate-200/80 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900 sm:flex">
                {stats.map((stat) => (
                  <StatChip
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
