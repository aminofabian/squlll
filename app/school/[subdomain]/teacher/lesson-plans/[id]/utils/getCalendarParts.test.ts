import { describe, expect, it } from 'vitest'
import { getCalendarParts } from './getCalendarParts'

describe('getCalendarParts', () => {
  it('splits a lesson date into calendar tile parts in UTC', () => {
    const parts = getCalendarParts('2026-10-19', 'en-GB')
    expect(parts).toMatchObject({ day: 19, month: 'Oct', weekday: 'Monday' })
    expect(parts.longDate).toMatch(/Monday,? 19 October 2026/)
  })
})
