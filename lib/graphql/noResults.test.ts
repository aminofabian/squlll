import { describe, expect, it } from 'vitest'
import { isNoResultsError } from './noResults'

describe('isNoResultsError', () => {
  it('is true for the API "no marks" message', () => {
    expect(
      isNoResultsError(new Error('No marks found for the specified academic year')),
    ).toBe(true)
  })

  it('is true for a bare 404 from a read endpoint', () => {
    expect(isNoResultsError(new Error('GraphQL request failed (404)'))).toBe(true)
  })

  it('is false for a genuine failure', () => {
    expect(isNoResultsError(new Error('Database connection lost'))).toBe(false)
    expect(isNoResultsError(null)).toBe(false)
  })
})
