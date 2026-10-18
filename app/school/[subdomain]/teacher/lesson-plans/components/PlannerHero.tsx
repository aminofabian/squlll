import { NotebookPen } from 'lucide-react'
import type { LessonPlanWeek } from '@/lib/lesson-planning/api'
import { getGreeting } from '../utils/getGreeting'
import { ProgressRing } from './ProgressRing'
import { WeekNavigator } from './WeekNavigator'

export function PlannerHero({
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
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-dark via-primary to-primary-light px-5 pb-20 pt-5 text-primary-foreground shadow-lg shadow-primary/20 sm:px-7 sm:pt-7">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 size-72 rounded-full bg-amber-300/20 blur-3xl" />
      <NotebookPen className="pointer-events-none absolute -bottom-6 right-6 size-40 rotate-12 opacity-[0.07]" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ring-1 ring-inset ring-white/20">
            {termName ?? 'Term'}
          </span>
          <p suppressHydrationWarning className="mt-3 text-sm opacity-80">
            {getGreeting(new Date())} — here is your teaching week.
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">Lesson plans</h1>
          <p className="mt-1 max-w-md text-sm opacity-85">
            Prepare from your timetable, teach from the plan, then record what actually happened.
          </p>
        </div>
        <ProgressRing percent={week?.stats.preparationRate ?? 0} caption="prepared" className="hidden text-white sm:block" />
      </div>

      <div className="relative mt-5">
        <WeekNavigator week={week} onPrevious={onPrevious} onNext={onNext} onToday={onToday} />
      </div>
    </header>
  )
}
