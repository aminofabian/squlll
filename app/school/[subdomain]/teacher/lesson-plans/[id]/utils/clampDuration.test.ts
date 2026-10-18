import { describe, expect, it } from 'vitest'
import { clampDuration } from './clampDuration'

describe('clampDuration', () => {
  it('keeps the duration within the allowed range', () => {
    expect(clampDuration(1)).toBe(5)
    expect(clampDuration(500)).toBe(240)
    expect(clampDuration(42.4)).toBe(42)
  })

  it('falls back to the default for non-numbers', () => {
    expect(clampDuration(Number.NaN)).toBe(40)
  })
})
