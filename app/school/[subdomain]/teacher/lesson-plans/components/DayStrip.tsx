import type { LessonPlanDay } from '@/lib/lesson-planning/api'
import { cn } from '@/lib/utils'
import { PERIOD_STATE_STYLES } from '../constants/periodStateStyles'
import { getPeriodState } from '../utils/getPeriodState'

const WEEKDAY_ABBREVIATION_LENGTH = 3

export function DayStrip({
  days,
  today,
  selectedDate,
  onSelect,
}: {
  days: LessonPlanDay[]
  today: string
  selectedDate: string
  onSelect: (date: string) => void
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
      {days.map((day) => {
        const active = day.date === selectedDate
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelect(day.date)}
            className={cn(
              'flex min-w-[3.75rem] flex-1 flex-col items-center gap-1 rounded-xl border py-2 transition-colors',
              active ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card hover:bg-muted/50',
            )}
          >
            <span className={cn('text-[11px]', active ? 'font-medium' : 'text-muted-foreground')}>
              {day.date === today ? 'Today' : day.dayName.slice(0, WEEKDAY_ABBREVIATION_LENGTH)}
            </span>
            <span className="text-base font-semibold leading-none tabular-nums">
              {new Date(`${day.date}T12:00:00Z`).getUTCDate()}
            </span>
            <span className="flex h-1 items-center gap-0.5">
              {day.periods.map((period) => (
                <span key={period.timetableEntryId} className={cn('size-1 rounded-full', PERIOD_STATE_STYLES[getPeriodState(period, today)].dot)} />
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}
