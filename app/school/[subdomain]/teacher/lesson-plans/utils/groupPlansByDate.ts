import type { LessonPlan } from '@/lib/lesson-planning/api'

export function groupPlansByDate(plans: LessonPlan[]): Array<[string, LessonPlan[]]> {
  const groups = new Map<string, LessonPlan[]>()
  for (const plan of plans) {
    groups.set(plan.lessonDate, [...(groups.get(plan.lessonDate) ?? []), plan])
  }
  return [...groups.entries()].sort(([a], [b]) => (a < b ? 1 : -1))
}
