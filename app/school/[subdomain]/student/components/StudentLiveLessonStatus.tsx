'use client'

import { CurrentLessonBanner } from '@/components/timetable'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudentNextClass } from '@/lib/student/useStudentNextClass'

export function StudentLiveLessonStatus({ compact = false }: { compact?: boolean }) {
  const { currentStatus, formattedTime, loading } = useStudentNextClass()

  if (loading) {
    return (
      <div className={compact
        ? 'rounded-xl border border-border bg-card px-3 py-2.5'
        : 'rounded-xl border border-border bg-card px-4 py-4'
      }>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          {compact ? <Skeleton className="h-3 w-10 shrink-0" /> : null}
        </div>
      </div>
    )
  }

  return (
    <CurrentLessonBanner
      status={currentStatus}
      formattedTime={formattedTime}
      viewType="student"
      compact={compact}
      showClock={!compact}
    />
  )
}
