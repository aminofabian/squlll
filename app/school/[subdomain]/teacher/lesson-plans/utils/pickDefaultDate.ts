import type { LessonPlanDay } from '@/lib/lesson-planning/api'

export function pickDefaultDate(days: LessonPlanDay[], today: string, current?: string): string {
  if (current && days.some((day) => day.date === current)) return current
  const todayWithLessons = days.find((day) => day.date === today && day.periods.length > 0)
  if (todayWithLessons) return todayWithLessons.date
  return days.find((day) => day.periods.length > 0)?.date ?? days[0]?.date ?? ''
}
