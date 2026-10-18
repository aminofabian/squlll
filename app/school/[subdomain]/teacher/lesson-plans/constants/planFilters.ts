import type { LessonPlanStatus } from '@/lib/lesson-planning/api'

export type PlanFilter = LessonPlanStatus | 'ALL'

export const PLAN_FILTERS: Array<{ value: PlanFilter; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'DRAFT', label: 'Drafts' },
  { value: 'SUBMITTED', label: 'Awaiting review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'RETURNED', label: 'Returned' },
]
