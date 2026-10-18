import type { LessonActivity } from '@/lib/lesson-planning/api'
import { sumActivityMinutes } from './sumActivityMinutes'

const FULL_WIDTH_PERCENT = 100

export function buildActivityTimeline(
  activities: LessonActivity[],
  durationMinutes: number,
) {
  const totalMinutes = sumActivityMinutes(activities)
  const scale = Math.max(totalMinutes, durationMinutes, 1)
  const toPercent = (minutes: number) => (minutes / scale) * FULL_WIDTH_PERCENT
  const remainingMinutes = Math.max(durationMinutes - totalMinutes, 0)

  let startMinute = 0
  const segments = activities.map((activity, index) => {
    const minutes = Number(activity.minutes) || 0
    const segment = {
      index,
      title: activity.title,
      minutes,
      startMinute,
      endMinute: startMinute + minutes,
      percent: toPercent(minutes),
    }
    startMinute += minutes
    return segment
  })

  return {
    totalMinutes,
    remainingMinutes,
    overflowMinutes: Math.max(totalMinutes - durationMinutes, 0),
    remainingPercent: toPercent(remainingMinutes),
    segments,
  }
}
