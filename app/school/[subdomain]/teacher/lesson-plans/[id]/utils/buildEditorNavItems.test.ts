import { describe, expect, it } from 'vitest'
import { buildEditorNavItems } from './buildEditorNavItems'

const completed = {
  details: true,
  curriculum: false,
  activities: false,
  assessment: false,
  reflection: false,
  history: false,
}

describe('buildEditorNavItems', () => {
  it('hides review history until there are reviews', () => {
    expect(buildEditorNavItems(completed, false).map((item) => item.id)).not.toContain('history')
    expect(buildEditorNavItems(completed, true).map((item) => item.id)).toContain('history')
  })

  it('carries the completion flag onto each item', () => {
    const [details, curriculum] = buildEditorNavItems(completed, false)
    expect(details.complete).toBe(true)
    expect(curriculum.complete).toBe(false)
  })
})
