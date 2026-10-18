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
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p suppressHydrationWarning className="text-xs text-muted-foreground">
          {getGreeting(new Date())}
          {termName ? ` · ${termName}` : ''}
        </p>
        <h1 className="text-xl font-semibold tracking-tight">Lesson plans</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Prepare from your timetable, teach from the plan, then record what actually happened.
        </p>
      </div>
      <WeekNavigator week={week} onPrevious={onPrevious} onNext={onNext} onToday={onToday} />
    </header>
  )
}
