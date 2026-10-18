import type { LessonActivity } from '@/lib/lesson-planning/api'

export function sumActivityMinutes(activities: LessonActivity[]): number {
  return activities.reduce(
    (total, activity) => total + (Number(activity.minutes) || 0),
    0,
  )
}
