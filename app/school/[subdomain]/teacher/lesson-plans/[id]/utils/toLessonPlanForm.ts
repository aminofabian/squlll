import type { LessonPlan } from '@/lib/lesson-planning/api'
import { LESSON_PLAN_EDITOR } from '../constants/lessonPlanEditor'
import type { LessonPlanForm } from '../types'

export function toLessonPlanForm(plan: LessonPlan): LessonPlanForm {
  return {
    durationMinutes: plan.durationMinutes ?? LESSON_PLAN_EDITOR.defaultDurationMinutes,
    strand: plan.strand ?? '',
    subStrand: plan.subStrand ?? '',
    topic: plan.topic ?? '',
    subTopic: plan.subTopic ?? '',
    specificLearningOutcomes: plan.specificLearningOutcomes ?? '',
    keyInquiryQuestion: plan.keyInquiryQuestion ?? '',
    activities: (plan.activities ?? []).map((activity) => ({
      minutes: activity.minutes,
      title: activity.title,
      description: activity.description ?? '',
    })),
    resources: plan.resources ?? '',
    assessment: plan.assessment ?? '',
    differentiation: plan.differentiation ?? '',
    homework: plan.homework ?? '',
  }
}
