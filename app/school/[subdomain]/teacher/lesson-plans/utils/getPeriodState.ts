import type { LessonPlanPeriod } from '@/lib/lesson-planning/api'

export type PeriodState = 'recorded' | 'recordDue' | 'planned' | 'unplanned'

export function getPeriodState(period: LessonPlanPeriod, today: string): PeriodState {
  if (period.record) return 'recorded'
  if (period.date < today) return 'recordDue'
  if (period.plan) return 'planned'
  return 'unplanned'
}
