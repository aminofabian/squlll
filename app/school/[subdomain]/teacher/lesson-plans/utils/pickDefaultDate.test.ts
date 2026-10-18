import { describe, expect, it } from 'vitest'
import type { LessonPlanDay, LessonPlanPeriod } from '@/lib/lesson-planning/api'
import { pickDefaultDate } from './pickDefaultDate'

const day = (date: string, periodCount: number): LessonPlanDay => ({
  date,
  dayOfWeek: 1,
  dayName: 'Day',
  periods: Array.from({ length: periodCount }, () => ({}) as LessonPlanPeriod),
})

const days = [day('2026-10-12', 0), day('2026-10-13', 2), day('2026-10-14', 1)]

describe('pickDefaultDate', () => {
  it('keeps the current selection when it is in the week', () => {
    expect(pickDefaultDate(days, '2026-10-14', '2026-10-12')).toBe('2026-10-12')
  })

  it('prefers today when it has lessons', () => {
    expect(pickDefaultDate(days, '2026-10-14')).toBe('2026-10-14')
  })

  it('falls back to the first day with lessons, then the first day', () => {
    expect(pickDefaultDate(days, '2026-10-12')).toBe('2026-10-13')
    expect(pickDefaultDate([day('2026-10-12', 0)], '2026-10-20')).toBe('2026-10-12')
    expect(pickDefaultDate([], '2026-10-20')).toBe('')
  })
})
