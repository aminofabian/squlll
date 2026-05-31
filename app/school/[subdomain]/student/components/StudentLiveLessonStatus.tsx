'use client'

import { CurrentLessonBanner } from '@/components/timetable'
import { useStudentNextClass } from '@/lib/student/useStudentNextClass'

export function StudentLiveLessonStatus() {
  const { currentStatus, formattedTime, loading } = useStudentNextClass()

  if (loading) {
    return (
      <div className="h-24 animate-pulse rounded-md border border-primary/10 bg-card" />
    )
  }

  return (
    <CurrentLessonBanner
      status={currentStatus}
      formattedTime={formattedTime}
      viewType="student"
    />
  )
}
