import { LESSON_PLAN_EDITOR } from '../constants/lessonPlanEditor'

export function clampDuration(minutes: number): number {
  if (!Number.isFinite(minutes)) return LESSON_PLAN_EDITOR.defaultDurationMinutes
  return Math.min(
    Math.max(Math.round(minutes), LESSON_PLAN_EDITOR.minDurationMinutes),
    LESSON_PLAN_EDITOR.maxDurationMinutes,
  )
}
