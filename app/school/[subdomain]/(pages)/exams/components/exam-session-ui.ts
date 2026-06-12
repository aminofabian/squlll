import type { ExamSessionRecord } from '@/lib/exams/examSessions'
import { cn } from '@/lib/utils'

/** Shared accent for the exam module */
export const EXAM_ACCENT = '#246a59'

export const examSurfaceClass =
  'overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:rounded-2xl'

export const examPageShellClass =
  'relative flex min-h-full flex-col bg-[#f4f6f8] dark:bg-slate-950'

export const examHeroGlowClass =
  'pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,rgba(36,106,89,0.18),transparent_50%),radial-gradient(ellipse_60%_50%_at_90%_0%,rgba(0,115,234,0.12),transparent_45%),radial-gradient(ellipse_50%_40%_at_50%_100%,rgba(139,92,246,0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,rgba(36,106,89,0.25),transparent_50%),radial-gradient(ellipse_60%_50%_at_90%_0%,rgba(0,115,234,0.15),transparent_45%)]'

export const examCreativeSurfaceClass =
  'overflow-hidden rounded-xl border border-white/60 bg-white/75 shadow-lg shadow-slate-300/20 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-none sm:rounded-2xl'

export const examPageHeaderClass =
  'sticky top-0 z-20 shrink-0 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90'

export const examPageHeaderAccentClass =
  'h-[2px] bg-gradient-to-r from-[#246a59] via-teal-400/90 to-[#0073ea]/50'

export const examSectionNavClass =
  'flex gap-0.5 overflow-x-auto rounded-lg border border-slate-200/80 bg-white p-0.5 shadow-sm scrollbar-none snap-x snap-mandatory dark:border-slate-800 dark:bg-slate-900'

export const examPanelHeaderBarClass =
  'border-b border-slate-100 bg-gradient-to-b from-slate-50/90 to-white px-3 py-1.5 dark:border-slate-800 dark:from-slate-900/90 dark:to-slate-900 sm:px-3.5 sm:py-2'

export const examPanelBodyClass = 'p-2 sm:p-3'

export const examTableShellClass =
  'overflow-hidden rounded-xl border border-slate-200/80 bg-white ring-1 ring-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:ring-slate-800'

export const examTableHeadClass =
  'border-b border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-slate-50/40 dark:border-slate-800 dark:from-slate-900/90 dark:to-slate-900/50'

export const examMicroLabelClass =
  'text-[10px] font-semibold uppercase tracking-wider text-slate-500'

export const examEmptyStateClass =
  'flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/80 bg-slate-50/50 px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40'

export const examTabActiveClass =
  'bg-gradient-to-br from-[#2f8f7a] via-[#246a59] to-[#1a4c40] text-white shadow-md shadow-[#246a59]/30 ring-1 ring-white/20'

export const examTabIdleClass =
  'text-slate-500 hover:bg-white/80 hover:text-slate-800 hover:shadow-sm dark:hover:bg-slate-800/80 dark:hover:text-slate-200'

export const examTabGroupLabelClass =
  'rounded-md bg-slate-100/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-800/80'

export const examStatCardClass =
  'group relative overflow-hidden rounded-xl border border-slate-200/60 bg-gradient-to-br from-white via-white to-slate-50/80 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900/80 dark:hover:shadow-none'

export function examIconTileClass(tone: 'teal' | 'blue' | 'violet' | 'amber' = 'teal') {
  const tones = {
    teal: 'bg-[#246a59]/10 text-[#246a59] ring-[#246a59]/15',
    blue: 'bg-[#0073ea]/10 text-[#0073ea] ring-[#0073ea]/15',
    violet: 'bg-violet-500/10 text-violet-600 ring-violet-500/15',
    amber: 'bg-amber-500/10 text-amber-700 ring-amber-500/15',
  }
  return cn(
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
    tones[tone],
  )
}

export function sessionStatusChipClass(status: ExamSessionRecord['status']) {
  const map: Record<ExamSessionRecord['status'], string> = {
    DRAFT: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
    SCHEDULED:
      'border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
    IN_PROGRESS:
      'border-sky-200/80 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300',
    MARKING:
      'border-amber-200/80 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
    UNDER_REVIEW:
      'border-violet-200/80 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300',
    PUBLISHED:
      'border-[#246a59]/30 bg-[#246a59]/10 text-[#1a4c40] dark:border-[#246a59]/40 dark:bg-[#246a59]/15 dark:text-emerald-200',
    CLOSED:
      'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
  }
  return cn(
    'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
    map[status] ?? map.DRAFT,
  )
}

export function sessionMetaChipClass(variant: 'muted' | 'live' | 'portal' = 'muted') {
  const variants = {
    muted:
      'border-slate-200/80 bg-white/80 text-slate-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400',
    live: 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300',
    portal:
      'border-slate-200/80 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
  }
  return cn(
    'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
    variants[variant],
  )
}

export const examFilterSelectClass =
  'h-7 rounded-md border border-slate-200/80 bg-white px-2 text-[11px] text-slate-700 shadow-sm transition-colors hover:border-[#246a59]/30 focus:border-[#246a59]/40 focus:outline-none focus:ring-2 focus:ring-[#246a59]/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'

export function timetableFillProgressClass(percent: number) {
  if (percent >= 100) {
    return 'bg-emerald-100 dark:bg-emerald-950/40 [&_[data-slot=progress-indicator]]:bg-emerald-500'
  }
  if (percent >= 50) {
    return 'bg-[#246a59]/10 [&_[data-slot=progress-indicator]]:bg-[#246a59]'
  }
  if (percent > 0) {
    return 'bg-amber-100 dark:bg-amber-950/30 [&_[data-slot=progress-indicator]]:bg-amber-500'
  }
  return 'bg-slate-100 dark:bg-slate-800 [&_[data-slot=progress-indicator]]:bg-slate-300'
}

export function examTypeChipClass(type: 'CA' | 'EXAM') {
  return type === 'EXAM'
    ? 'border-[#246a59]/25 bg-[#246a59]/8 text-[#1a4c40] dark:border-[#246a59]/35 dark:bg-[#246a59]/15 dark:text-emerald-200'
    : 'border-[#0073ea]/25 bg-[#0073ea]/8 text-[#0073ea] dark:border-[#0073ea]/35 dark:bg-[#0073ea]/15'
}

/** Mobile timetable — sticky control strip */
export const examTimetableMobileStripClass =
  'sticky top-0 z-10 -mx-3 flex items-center gap-1.5 border-b border-white/40 bg-white/80 px-2 py-1.5 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/85 sm:mx-0 sm:hidden'

export const examTimetableProgressPillClass =
  'shrink-0 rounded-lg bg-gradient-to-br from-[#246a59] to-[#1a4c40] px-2 py-0.5 text-[10px] font-bold tabular-nums text-white shadow-sm shadow-[#246a59]/30'

/** Session detail — compact but readable base (no aggressive downscaling) */
export const examSessionMicroScopeClass = 'text-xs leading-normal text-slate-700 dark:text-slate-300'

export const examTimetablePeriodChipClass =
  'flex min-w-0 flex-1 items-center gap-1 rounded-lg border border-slate-200/60 bg-white/80 px-2 py-1 text-left shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80'

export const examTimetablePanelHeaderClass =
  'relative overflow-hidden rounded-xl border border-slate-200/60 bg-gradient-to-br from-white via-white to-[#246a59]/[0.04] p-3 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-[#246a59]/10'

export const examTimetablePeriodBarClass =
  'overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-r from-slate-50/90 via-white to-[#0073ea]/[0.04] shadow-sm dark:border-slate-700 dark:from-slate-900/80 dark:via-slate-900 dark:to-[#0073ea]/10'

export const examTimetableUnscheduledStripClass =
  'overflow-hidden border-2 border-[#246a59] bg-white dark:border-[#246a59] dark:bg-slate-950'

export const examTimetableMobileEditorClass =
  '-mx-3 space-y-1.5 border-b border-slate-100 bg-slate-50/50 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900/40 sm:mx-0 sm:hidden'

export const examTimetableDayStripClass =
  'overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white via-slate-50/30 to-white shadow-lg shadow-slate-200/30 dark:border-slate-700/80 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 dark:shadow-none'

export const examTimetableDayStripHeaderClass =
  'flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-100 px-2.5 py-1.5 dark:border-slate-800 sm:px-3'

export const examTimetableDayTabsTrackClass =
  'relative flex justify-center overflow-x-auto px-2 py-2 scrollbar-none snap-x snap-mandatory sm:px-2.5 sm:py-2.5'

