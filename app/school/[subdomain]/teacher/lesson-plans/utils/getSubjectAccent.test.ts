import { describe, expect, it } from 'vitest'
import { SUBJECT_ACCENTS } from '../constants/subjectAccents'
import { getSubjectAccent } from './getSubjectAccent'

describe('getSubjectAccent', () => {
  it('returns the same accent for the same subject', () => {
    expect(getSubjectAccent('maths-id')).toBe(getSubjectAccent('maths-id'))
  })

  it('always returns a palette entry, even for an empty key', () => {
    expect(SUBJECT_ACCENTS).toContain(getSubjectAccent(''))
    expect(SUBJECT_ACCENTS).toContain(getSubjectAccent('a-very-long-subject-identifier'))
  })
})
