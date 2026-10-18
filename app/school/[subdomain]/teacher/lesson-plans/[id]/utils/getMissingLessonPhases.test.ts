import { describe, expect, it } from 'vitest'
import { getMissingLessonPhases } from './getMissingLessonPhases'

describe('getMissingLessonPhases', () => {
  it('suggests every phase for an empty plan', () => {
    expect(getMissingLessonPhases([]).map((p) => p.title)).toEqual([
      'Introduction',
      'Development',
      'Application',
      'Conclusion',
    ])
  })

  it('matches existing titles case-insensitively and by substring', () => {
    const missing = getMissingLessonPhases([
      { minutes: 5, title: 'INTRODUCTION' },
      { minutes: 5, title: 'Group application task' },
    ])
    expect(missing.map((p) => p.title)).toEqual(['Development', 'Conclusion'])
  })
})
