import { describe, expect, it } from 'vitest'
import { getGreeting } from './getGreeting'

const at = (hour: number) => new Date(2026, 9, 18, hour)

describe('getGreeting', () => {
  it('greets by time of day', () => {
    expect(getGreeting(at(7))).toBe('Good morning')
    expect(getGreeting(at(12))).toBe('Good afternoon')
    expect(getGreeting(at(17))).toBe('Good evening')
  })
})
