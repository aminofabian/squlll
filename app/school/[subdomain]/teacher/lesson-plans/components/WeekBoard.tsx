'use client'

import React from 'react'
import { Coffee } from 'lucide-react'
import type { LessonPlanPeriod, LessonPlanWeek } from '@/lib/lesson-planning/api'
import { DayStrip } from './DayStrip'
import { PeriodCard } from './PeriodCard'
import { PlannerEmptyState } from './PlannerEmptyState'

export function WeekBoard({
  data,
  selectedDate,
  onSelectDate,
  onPrepare,
  onRecord,
  preparingId,
}: {
  data: LessonPlanWeek
  selectedDate: string
  onSelectDate: (date: string) => void
  onPrepare: (period: LessonPlanPeriod) => void
  onRecord: (period: LessonPlanPeriod) => void
  preparingId: string | null
}) {
  const selectedDay =
    data.days.find((day) => day.date === selectedDate) ?? data.days.find((day) => day.periods.length > 0) ?? data.days[0]
  const periods = selectedDay?.periods ?? []
  const plannedCount = periods.filter((period) => period.plan).length

  return (
    <div className="space-y-4">
      <DayStrip days={data.days} today={data.today} selectedDate={selectedDay?.date ?? ''} onSelect={onSelectDate} />
      {periods.length > 0 ? (
        <>
          <p className="px-1 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{selectedDay?.dayName}</span> · {periods.length} lesson
            {periods.length === 1 ? '' : 's'} · {plannedCount} planned
          </p>
          <ol className="space-y-3">
            {periods.map((period) => (
              <PeriodCard
                key={`${period.timetableEntryId}-${period.date}`}
                period={period}
                today={data.today}
                preparing={preparingId === period.timetableEntryId}
                onPrepare={onPrepare}
                onRecord={onRecord}
              />
            ))}
          </ol>
        </>
      ) : (
        <PlannerEmptyState
          icon={Coffee}
          title={`No lessons on ${selectedDay?.dayName ?? 'this day'}`}
          description={`Your timetable has no periods for this day in ${data.termName}. Plans can also be written ahead from a scheme of work.`}
        />
      )}
    </div>
  )
}
