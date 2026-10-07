import { describe, expect, it } from 'vitest'
import { cleanOptional, toWalkthroughInput, walkthroughSchema } from './walkthrough'

const valid = {
  name: 'Jane Doe',
  email: 'jane@Sunrise.ac.ke',
  schoolName: 'Sunrise Academy',
}

describe('walkthroughSchema', () => {
  it('accepts a minimal submission', () => {
    expect(walkthroughSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a malformed email', () => {
    expect(walkthroughSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false)
  })

  it('rejects a too-short name or school', () => {
    expect(walkthroughSchema.safeParse({ ...valid, name: 'J' }).success).toBe(false)
    expect(walkthroughSchema.safeParse({ ...valid, schoolName: '' }).success).toBe(false)
  })

  it('trims surrounding whitespace', () => {
    const parsed = walkthroughSchema.safeParse({ ...valid, name: '  Jane Doe  ' })
    expect(parsed.success && parsed.data.name).toBe('Jane Doe')
  })
})

describe('toWalkthroughInput', () => {
  it('lowercases and trims the email', () => {
    const parsed = walkthroughSchema.parse(valid)
    expect(toWalkthroughInput(parsed).email).toBe('jane@sunrise.ac.ke')
  })

  it('drops optional fields that are empty or whitespace', () => {
    const parsed = walkthroughSchema.parse({
      ...valid,
      phone: '   ',
      role: '',
      message: undefined,
    })
    const input = toWalkthroughInput(parsed)
    expect(input.phone).toBeUndefined()
    expect(input.role).toBeUndefined()
    expect(input.message).toBeUndefined()
  })

  it('keeps optional fields that carry a value', () => {
    const parsed = walkthroughSchema.parse({
      ...valid,
      phone: '+254700000000',
      role: 'Head teacher',
      studentCount: '500 – 1,000',
    })
    const input = toWalkthroughInput(parsed)
    expect(input.phone).toBe('+254700000000')
    expect(input.role).toBe('Head teacher')
    expect(input.studentCount).toBe('500 – 1,000')
  })
})

describe('cleanOptional', () => {
  it('returns undefined for missing or blank values', () => {
    expect(cleanOptional(undefined)).toBeUndefined()
    expect(cleanOptional('')).toBeUndefined()
    expect(cleanOptional('   ')).toBeUndefined()
  })

  it('returns the trimmed value otherwise', () => {
    expect(cleanOptional('  hello  ')).toBe('hello')
  })
})
