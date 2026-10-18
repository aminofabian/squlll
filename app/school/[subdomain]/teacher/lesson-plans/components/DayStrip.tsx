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
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
      {days.map((day) => {
        const active = day.date === selectedDate
        const isToday = day.date === today
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelect(day.date)}
            className={cn(
              'relative flex min-w-[4.5rem] flex-1 flex-col items-center gap-1 rounded-2xl border px-2 pb-2.5 pt-2 transition-all',
              active
                ? 'border-transparent bg-gradient-to-b from-primary to-primary-dark text-primary-foreground shadow-lg shadow-primary/25'
                : 'border-border/70 bg-card hover:-translate-y-0.5 hover:border-primary/40',
              isToday && !active && 'ring-2 ring-primary/30',
            )}
          >
            <span className={cn('text-[10px] font-semibold uppercase tracking-[0.14em]', active ? 'opacity-80' : 'text-muted-foreground')}>
              {isToday ? 'Today' : day.dayName.slice(0, WEEKDAY_ABBREVIATION_LENGTH)}
            </span>
            <span className="text-2xl font-bold leading-none tabular-nums">
              {new Date(`${day.date}T12:00:00Z`).getUTCDate()}
            </span>
            <span className="flex h-1.5 items-center gap-0.5">
              {day.periods.map((period) => (
                <span
                  key={period.timetableEntryId}
                  className={cn('size-1.5 rounded-full', active ? 'bg-white/80' : PERIOD_STATE_STYLES[getPeriodState(period, today)].dot)}
                />
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}
