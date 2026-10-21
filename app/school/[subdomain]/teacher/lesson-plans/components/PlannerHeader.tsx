import type { LessonPlanWeek } from '@/lib/lesson-planning/api'
import { getGreeting } from '../utils/getGreeting'
import { WeekNavigator } from './WeekNavigator'

export function PlannerHeader({
  termName,
  week,
  onPrevious,
  onNext,
  onToday,
}: {
  termName?: string
  week: LessonPlanWeek | null
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}) {
  return (
    <header className="tp-reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p suppressHydrationWarning className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/75">
          {getGreeting(new Date())}
          {termName ? ` · ${termName}` : ''}
        </p>
        <h1 className="mt-2 font-display text-[2.1rem] leading-[1.04] tracking-[-0.015em] text-foreground sm:text-[2.55rem]">
          Lesson plans
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Prepare from your timetable, teach from the plan, then record what actually happened.
        </p>
      </div>
      <WeekNavigator week={week} onPrevious={onPrevious} onNext={onNext} onToday={onToday} />
    </header>
  )
}
