import type { LessonPlanForm } from '../types'
import { sumActivityMinutes } from './sumActivityMinutes'

const FULL_PERCENT = 100

const hasText = (value: string | null | undefined) => Boolean(value?.trim())

export function getLessonPlanProgress(form: LessonPlanForm, hasRecord: boolean) {
  const planningSteps = {
    details: form.durationMinutes > 0,
    curriculum:
      hasText(form.strand) &&
      hasText(form.topic) &&
      hasText(form.specificLearningOutcomes),
    activities:
      form.activities.some((activity) => hasText(activity.title)) &&
      sumActivityMinutes(form.activities) <= form.durationMinutes,
    assessment: hasText(form.resources) && hasText(form.assessment),
  }
  const planningTotal = Object.keys(planningSteps).length
  const planningDone = Object.values(planningSteps).filter(Boolean).length

  return {
    completed: { ...planningSteps, reflection: hasRecord, history: false },
    planningDone,
    planningTotal,
    percent: Math.round((planningDone / planningTotal) * FULL_PERCENT),
    isReady: planningDone === planningTotal,
  }
}
