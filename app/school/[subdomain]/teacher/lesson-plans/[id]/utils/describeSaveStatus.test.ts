import { describe, expect, it } from 'vitest'
import { describeSaveStatus } from './describeSaveStatus'

const base = { saving: false, isDirty: false, saveError: null, lastSavedAt: null }

describe('describeSaveStatus', () => {
  it('prioritises errors over saving and dirty states', () => {
    expect(
      describeSaveStatus({ ...base, saving: true, isDirty: true, saveError: 'Offline' }),
    ).toEqual({ tone: 'error', label: 'Offline' })
  })

  it('reports saving before unsaved changes', () => {
    expect(describeSaveStatus({ ...base, saving: true, isDirty: true }).tone).toBe('saving')
    expect(describeSaveStatus({ ...base, isDirty: true }).tone).toBe('dirty')
  })

  it('falls back to the last save, then server timestamp, then draft', () => {
    expect(describeSaveStatus({ ...base, lastSavedAt: new Date() }).label).toMatch(/^Saved /)
    expect(
      describeSaveStatus({ ...base, updatedAt: '2026-10-18T10:00:00Z' }).tone,
    ).toBe('saved')
    expect(describeSaveStatus(base)).toEqual({ tone: 'idle', label: 'Draft' })
  })
})
