'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  EyeOff,
  Filter,
  GraduationCap,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  examTimetableFill,
  publicationStateLabel,
  statusLabel,
  type ExamSessionRecord,
} from '@/lib/exams/examSessions'
import { examsListPath } from '@/lib/school/schoolRoutes'
import { cn } from '@/lib/utils'
import {
  examHeroGlowClass,
  examTypeChipClass,
  sessionMetaChipClass,
  sessionStatusChipClass,
  timetableFillProgressClass,
} from './exam-session-ui'

interface ExamSessionHeroProps {
  subdomain: string
  session: ExamSessionRecord
  subtitle: string
  selectedGradeLabel?: string | null
  onOpenGrades?: () => void
  onToggleGradePanel?: () => void
  gradePanelOpen?: boolean
  showGradeControls?: boolean
  showMobileGradeButton?: boolean
}

function HeroStat({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent: 'teal' | 'blue' | 'violet' | 'amber'
}) {
  const accents = {
    teal: 'from-[#246a59]/15 to-[#246a59]/5 text-[#246a59] ring-[#246a59]/15',
    blue: 'from-[#0073ea]/15 to-[#0073ea]/5 text-[#0073ea] ring-[#0073ea]/15',
    violet: 'from-violet-500/15 to-violet-500/5 text-violet-600 ring-violet-500/15',
    amber: 'from-amber-500/15 to-amber-500/5 text-amber-700 ring-amber-500/15',
  }
  return (
    <div
      className={cn(
        'flex min-w-[4.5rem] flex-1 flex-col items-center rounded-xl bg-gradient-to-b px-3 py-2 ring-1 backdrop-blur-sm sm:flex-none',
        accents[accent],
      )}
    >
      <span className="text-base font-bold tabular-nums leading-none">{value}</span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-90">
        {label}
      </span>
    </div>
  )
}

function publicationChipClass(state: ExamSessionRecord['publicationState']) {
  if (state === 'PUBLISHED') {
    return 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
  }
  if (state === 'SCHEDULED') {
    return 'border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300'
  }
  return 'border-slate-200/80 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
}

export function ExamSessionHero({
  subdomain,
  session,
  subtitle,
  selectedGradeLabel,
  onOpenGrades,
  onToggleGradePanel,
  gradePanelOpen,
  showGradeControls,
  showMobileGradeButton,
}: ExamSessionHeroProps) {
  const fill = examTimetableFill(session)
  const publicationState = session.publicationState ?? 'HIDDEN'

  return (
    <div className="relative overflow-hidden border-b border-slate-200/60 bg-white/40 dark:border-slate-800 dark:bg-slate-950/40">
      <div className={examHeroGlowClass} aria-hidden />

      <div className="relative mx-auto max-w-6xl px-3 py-3 sm:px-6 sm:py-4">
        {/* Row 1 — navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-lg border border-slate-200/80 bg-white/80 px-2.5 text-xs text-slate-600 shadow-sm backdrop-blur-md hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300"
            asChild
          >
            <Link href={examsListPath(subdomain)}>
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Exams</span>
            </Link>
          </Button>

          <div className="flex shrink-0 items-center gap-1.5">
            {showMobileGradeButton && onOpenGrades ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 rounded-lg border-slate-200/80 bg-white/80 text-xs lg:hidden dark:border-slate-700 dark:bg-slate-900/80"
                onClick={onOpenGrades}
              >
                <Filter className="h-3.5 w-3.5" />
                Grades
              </Button>
            ) : null}
            {showGradeControls && onToggleGradePanel ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hidden h-8 rounded-lg border-slate-200/80 bg-white/80 text-xs lg:inline-flex dark:border-slate-700 dark:bg-slate-900/80"
                onClick={onToggleGradePanel}
              >
                {gradePanelOpen ? 'Hide grades' : 'Show grades'}
              </Button>
            ) : null}
          </div>
        </div>

        {/* Row 2 — identity */}
        <div className="mt-3 sm:mt-4">
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
            {session.name}
          </h1>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">{subtitle}</p>
        </div>

        {/* Row 3 — status strip (all badges grouped) */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/70 bg-white/70 px-2.5 py-2 shadow-sm backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/70 sm:gap-2 sm:px-3">
          <span
            className={cn(
              'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
              examTypeChipClass(session.type),
            )}
          >
            {session.type}
          </span>
          <span className={sessionStatusChipClass(session.status)}>
            {statusLabel(session.status)}
          </span>
          {session.resultsPublished ? (
            <span className={sessionMetaChipClass('live')}>
              <Sparkles className="mr-0.5 inline h-2.5 w-2.5" />
              Results live
            </span>
          ) : (
            <span className={sessionMetaChipClass('portal')}>Portal hidden</span>
          )}
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
              publicationChipClass(publicationState),
            )}
          >
            {publicationState === 'HIDDEN' ? (
              <EyeOff className="h-2.5 w-2.5 shrink-0 opacity-70" />
            ) : null}
            {publicationStateLabel(publicationState)}
          </span>
          {selectedGradeLabel ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#246a59]/25 bg-[#246a59]/8 px-2 py-0.5 text-[10px] font-medium text-[#246a59] dark:border-[#246a59]/35 dark:bg-[#246a59]/15 dark:text-emerald-200">
              <GraduationCap className="h-2.5 w-2.5 shrink-0" />
              {selectedGradeLabel}
            </span>
          ) : null}
        </div>

        {/* Row 4 — stats */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-stretch">
          <HeroStat label="Grades" value={session.gradesCount} accent="teal" />
          <HeroStat label="Papers" value={session.papersCount} accent="blue" />
          <HeroStat label="Subjects" value={session.subjectsCount} accent="violet" />
          <div className="col-span-2 flex min-w-0 flex-col rounded-xl bg-white/70 px-3 py-2 ring-1 ring-slate-200/80 backdrop-blur-md dark:bg-slate-900/70 dark:ring-slate-700/80 sm:col-span-1 sm:min-w-[9rem] sm:flex-1 sm:max-w-[11rem]">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-base font-bold tabular-nums text-[#246a59]">
                {fill.total > 0 ? `${fill.percent}%` : '—'}
              </span>
              <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Timetable filled
            </span>
            {fill.total > 0 ? (
              <Progress
                value={fill.percent}
                className={cn('mt-1.5 h-1', timetableFillProgressClass(fill.percent))}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ExamSessionLoadingState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <div className="relative">
        <div className="h-14 w-14 animate-spin rounded-full border-[3px] border-[#246a59]/15 border-t-[#246a59]" />
        <BookOpen className="absolute inset-0 m-auto h-4 w-4 text-[#246a59]/60" />
      </div>
      <p className="text-sm font-medium text-slate-500">Loading exam session…</p>
    </div>
  )
}
