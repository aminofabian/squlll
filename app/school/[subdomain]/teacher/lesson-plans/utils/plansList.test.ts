import { describe, expect, it } from 'vitest'
import type { LessonPlan } from '@/lib/lesson-planning/api'
import { countPlansByFilter } from './countPlansByFilter'
import { filterPlans } from './filterPlans'
import { groupPlansByDate } from './groupPlansByDate'

const plan = (id: string, extra: Partial<LessonPlan>) =>
  ({ id, status: 'DRAFT', lessonDate: '2026-10-12', subjectName: 'Maths', className: 'Grade 4', ...extra }) as LessonPlan

const plans = [
  plan('a', { topic: 'Fractions' }),
  plan('b', { status: 'APPROVED', lessonDate: '2026-10-14', subjectName: 'English' }),
  plan('c', { status: 'APPROVED', strand: 'Numbers' }),
]

describe('filterPlans', () => {
  it('filters by status and searches across text fields', () => {
    expect(filterPlans(plans, 'APPROVED', '').map((p) => p.id)).toEqual(['b', 'c'])
    expect(filterPlans(plans, 'ALL', '  numbers ').map((p) => p.id)).toEqual(['c'])
    expect(filterPlans(plans, 'DRAFT', 'english')).toEqual([])
  })
})

describe('groupPlansByDate', () => {
  it('groups by lesson date with the newest first', () => {
    const groups = groupPlansByDate(plans)
    expect(groups.map(([date, items]) => [date, items.length])).toEqual([
      ['2026-10-14', 1],
      ['2026-10-12', 2],
    ])
  })
})

describe('countPlansByFilter', () => {
  it('counts every status plus the total', () => {
    expect(countPlansByFilter(plans)).toEqual({ ALL: 3, DRAFT: 1, SUBMITTED: 0, APPROVED: 2, RETURNED: 0 })
  })
})
