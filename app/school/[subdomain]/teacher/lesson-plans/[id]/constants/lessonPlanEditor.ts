export const LESSON_PLAN_EDITOR = {
  autosaveDelayMs: 1200,
  defaultDurationMinutes: 40,
  minDurationMinutes: 5,
  maxDurationMinutes: 240,
  durationStepMinutes: 5,
  durationPresets: [30, 35, 40, 60, 80],
  newActivityMinutes: 5,
  maxActivityMinutes: 600,
  listHref: '/teacher/lesson-plans',
} as const
