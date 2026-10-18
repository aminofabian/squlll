import type { LessonActivity } from '@/lib/lesson-planning/api'

export function phaseToActivity(phase: { title: string; minutes: number }): LessonActivity {
  return { title: phase.title, minutes: phase.minutes, description: '' }
}
