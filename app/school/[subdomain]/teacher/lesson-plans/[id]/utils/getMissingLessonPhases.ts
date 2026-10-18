import type { LessonActivity } from '@/lib/lesson-planning/api'
import { LESSON_PHASES } from '../constants/lessonPhases'

export function getMissingLessonPhases(activities: LessonActivity[]) {
  const usedTitles = activities.map((activity) => activity.title.toLowerCase())
  return LESSON_PHASES.filter(
    (phase) =>
      !usedTitles.some((title) => title.includes(phase.title.toLowerCase())),
  )
}
