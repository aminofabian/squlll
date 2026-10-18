import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { LessonPlanWeek } from '@/lib/lesson-planning/api'
import { formatWeekRange } from '../utils/formatWeekRange'

const NAV_BUTTON =
  'flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:text-slate-300'

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
    <div className="inline-flex shrink-0 items-center gap-1 self-start rounded-xl border border-border bg-card p-1 sm:self-auto">
      <button type="button" className={NAV_BUTTON} onClick={onPrevious} disabled={!week} aria-label="Previous week">
        <ChevronLeft className="size-4" />
      </button>
      <p className="min-w-[9rem] text-center text-xs tabular-nums">
        <span className="text-muted-foreground">{week ? `Wk ${week.weekNumber} · ` : ''}</span>
        <span className="font-medium">{week ? formatWeekRange(week.weekStartDate, week.weekEndDate) : 'No week'}</span>
      </p>
      <button type="button" className={NAV_BUTTON} onClick={onNext} disabled={!week} aria-label="Next week">
        <ChevronRight className="size-4" />
      </button>
      <span className="mx-0.5 h-4 w-px bg-border" />
      <button type="button" onClick={onToday} className="h-7 rounded-lg px-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10">
        Today
      </button>
    </div>
  )
}
