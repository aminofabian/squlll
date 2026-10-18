import { describe, expect, it } from 'vitest'
import type { LessonPlanForm } from '../types'
import { getLessonPlanProgress } from './getLessonPlanProgress'

const emptyForm: LessonPlanForm = {
  durationMinutes: 40,
  strand: '',
  subStrand: '',
  topic: '',
  subTopic: '',
  specificLearningOutcomes: '',
  keyInquiryQuestion: '',
  activities: [],
  resources: '',
  assessment: '',
  differentiation: '',
  homework: '',
}

const completeForm: LessonPlanForm = {
  ...emptyForm,
  strand: 'Numbers',
  topic: 'Fractions',
  specificLearningOutcomes: 'Add fractions',
  activities: [{ minutes: 40, title: 'Introduction' }],
  resources: 'Charts',
  assessment: 'Oral questions',
}

describe('getLessonPlanProgress', () => {
  it('only counts the details step for a blank plan', () => {
    const progress = getLessonPlanProgress(emptyForm, false)
    expect(progress.planningDone).toBe(1)
    expect(progress.percent).toBe(25)
    expect(progress.isReady).toBe(false)
  })

  it('is ready when every planning step is filled', () => {
    const progress = getLessonPlanProgress(completeForm, true)
    expect(progress.isReady).toBe(true)
    expect(progress.percent).toBe(100)
    expect(progress.completed.reflection).toBe(true)
  })

  it('rejects whitespace and activities that overrun the lesson', () => {
    const progress = getLessonPlanProgress(
      {
        ...completeForm,
        topic: '   ',
        activities: [{ minutes: 45, title: 'Introduction' }],
      },
      false,
    )
    expect(progress.completed.curriculum).toBe(false)
    expect(progress.completed.activities).toBe(false)
  })
})
