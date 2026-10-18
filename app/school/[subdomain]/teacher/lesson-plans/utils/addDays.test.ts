import { describe, expect, it } from 'vitest'
import { addDays } from './addDays'
import { formatWeekRange } from './formatWeekRange'

describe('addDays', () => {
  it('moves across month and year boundaries', () => {
    expect(addDays('2026-10-30', 7)).toBe('2026-11-06')
    expect(addDays('2027-01-02', -7)).toBe('2026-12-26')
  })
})

describe('formatWeekRange', () => {
  it('renders a short day-month range', () => {
    expect(formatWeekRange('2026-10-12', '2026-10-16', 'en-GB')).toBe('12 Oct – 16 Oct')
  })
})
