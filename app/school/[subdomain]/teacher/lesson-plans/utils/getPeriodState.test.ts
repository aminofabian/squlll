import { describe, expect, it } from 'vitest'
import type { LessonPlan, LessonPlanPeriod, LessonRecord } from '@/lib/lesson-planning/api'
import { getPeriodState } from './getPeriodState'

const period = (date: string, extra: Partial<LessonPlanPeriod> = {}) =>
  ({ date, ...extra }) as LessonPlanPeriod

const TODAY = '2026-10-18'

describe('getPeriodState', () => {
  it('reports recorded lessons first', () => {
    expect(getPeriodState(period('2026-10-10', { record: {} as LessonRecord }), TODAY)).toBe('recorded')
  })

  it('flags past lessons without a record as due', () => {
    expect(getPeriodState(period('2026-10-17', { plan: {} as LessonPlan }), TODAY)).toBe('recordDue')
  })

  it('separates planned from unplanned upcoming lessons', () => {
    expect(getPeriodState(period(TODAY, { plan: {} as LessonPlan }), TODAY)).toBe('planned')
    expect(getPeriodState(period('2026-10-19'), TODAY)).toBe('unplanned')
  })
})
