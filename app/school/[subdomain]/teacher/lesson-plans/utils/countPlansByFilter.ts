import type { LessonPlan } from '@/lib/lesson-planning/api'
import { PLAN_FILTERS, type PlanFilter } from '../constants/planFilters'

export function countPlansByFilter(plans: LessonPlan[]): Record<PlanFilter, number> {
  const counts = Object.fromEntries(PLAN_FILTERS.map(({ value }) => [value, 0])) as Record<PlanFilter, number>
  counts.ALL = plans.length
  for (const plan of plans) counts[plan.status] += 1
  return counts
}
