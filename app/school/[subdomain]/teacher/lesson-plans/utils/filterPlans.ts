import type { LessonPlan } from '@/lib/lesson-planning/api'
import type { PlanFilter } from '../constants/planFilters'

export function filterPlans(plans: LessonPlan[], filter: PlanFilter, query: string): LessonPlan[] {
  const needle = query.trim().toLowerCase()
  return plans.filter((plan) => {
    if (filter !== 'ALL' && plan.status !== filter) return false
    if (!needle) return true
    return [plan.topic, plan.subjectName, plan.className, plan.strand, plan.subStrand]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle))
  })
}
