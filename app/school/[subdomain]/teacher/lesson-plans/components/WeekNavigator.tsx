import { ChevronLeft, ChevronRight, LocateFixed } from 'lucide-react'
import type { LessonPlanWeek } from '@/lib/lesson-planning/api'
import { formatWeekRange } from '../utils/formatWeekRange'

const NAV_BUTTON =
  'flex size-8 items-center justify-center rounded-xl transition-colors hover:bg-white/20 disabled:opacity-40'

export function WeekNavigator({
  week,
  onPrevious,
  onNext,
  onToday,
}: {
  week: LessonPlanWeek | null
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl bg-white/15 p-1 ring-1 ring-inset ring-white/20 backdrop-blur-md">
      <button type="button" className={NAV_BUTTON} onClick={onPrevious} disabled={!week} aria-label="Previous week">
        <ChevronLeft className="size-4" />
      </button>
      <div className="min-w-[8.5rem] px-1 text-center leading-tight">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-75">
          {week ? `Week ${week.weekNumber}` : 'Week'}
        </p>
        <p className="text-xs font-semibold tabular-nums">
          {week ? formatWeekRange(week.weekStartDate, week.weekEndDate) : '—'}
        </p>
      </div>
      <button type="button" className={NAV_BUTTON} onClick={onNext} disabled={!week} aria-label="Next week">
        <ChevronRight className="size-4" />
      </button>
      <button
        type="button"
        onClick={onToday}
        className="ml-1 inline-flex h-8 items-center gap-1 rounded-xl bg-white px-3 text-xs font-semibold text-primary shadow-sm transition-transform hover:scale-[1.03]"
      >
        <LocateFixed className="size-3.5" /> Today
      </button>
    </div>
  )
}
