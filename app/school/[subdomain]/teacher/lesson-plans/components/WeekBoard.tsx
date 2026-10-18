'use client'

import React from 'react'
import Link from 'next/link'
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  MapPin,
  PencilLine,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type {
  LessonPlanDay,
  LessonPlanPeriod,
  LessonPlanWeek,
} from '@/lib/lesson-planning/api'
import {
  LessonDeliveryStatusPill,
  LessonPlanStatusPill,
} from '@/components/lesson-planning/StatusPill'

function dayLabel(day: LessonPlanDay, today: string) {
  const date = new Date(`${day.date}T12:00:00Z`)
  const dayNumber = date.getUTCDate()
  return {
    name: day.dayName.slice(0, 3),
    number: dayNumber,
    isToday: day.date === today,
  }
}

function PeriodCard({
  period,
  onPrepare,
  onRecord,
  preparing,
}: {
  period: LessonPlanPeriod
  onPrepare: (period: LessonPlanPeriod) => void
  onRecord: (period: LessonPlanPeriod) => void
  preparing: boolean
}) {
  const plan = period.plan
  const record = period.record
  const href = plan ? `/teacher/lesson-plans/${plan.id}` : null

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex shrink-0 items-center gap-3 sm:w-28 sm:flex-col sm:items-start sm:gap-1">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            P{period.periodNumber}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {period.startTime}–{period.endTime}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              {period.subjectName}
            </h3>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              {period.className}
              {period.streamName ? ` ${period.streamName}` : ''}
            </span>
            {period.roomName && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                {period.roomName}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {plan ? (
              <>
                <LessonPlanStatusPill status={plan.status} />
                <span className="truncate text-xs text-muted-foreground">
                  {plan.topic || 'No topic set yet'}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                No plan prepared
                {period.suggestedSchemeEntry
                  ? ` · next on scheme: ${period.suggestedSchemeEntry.topic}`
                  : ''}
              </span>
            )}
            {record && <LessonDeliveryStatusPill status={record.status} />}
            {record && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3" />
                {record.coveragePercent}% covered
              </span>
            )}
          </div>

          {plan?.specificLearningOutcomes && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {plan.specificLearningOutcomes}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {href ? (
            <Button asChild size="sm" variant="outline">
              <Link href={href}>
                <BookOpen className="size-3.5" />
                Open plan
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onPrepare(period)}
              disabled={preparing}
            >
              <PencilLine className="size-3.5" />
              Prepare
            </Button>
          )}
          <Button
            size="sm"
            variant={record ? 'ghost' : 'secondary'}
            onClick={() => onRecord(period)}
          >
            <ClipboardCheck className="size-3.5" />
            {record ? 'Update record' : 'Record'}
          </Button>
        </div>
      </div>
    </div>
  )
}

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
    data.days.find((day) => day.date === selectedDate) ??
    data.days.find((day) => day.periods.length > 0) ??
    data.days[0]

  return (
    <div className="space-y-4">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {data.days.map((day) => {
          const label = dayLabel(day, data.today)
          const active = day.date === selectedDay?.date
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelectDate(day.date)}
              className={cn(
                'flex min-w-[72px] flex-col items-center rounded-xl border px-3 py-2 transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:border-primary/40',
              )}
            >
              <span
                className={cn(
                  'text-[11px] font-medium uppercase tracking-wide',
                  active ? 'text-primary-foreground/80' : 'text-muted-foreground',
                )}
              >
                {label.name}
              </span>
              <span className="text-lg font-semibold leading-tight">
                {label.number}
              </span>
              {label.isToday && (
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    active ? 'text-primary-foreground/80' : 'text-primary',
                  )}
                >
                  Today
                </span>
              )}
            </button>
          )
        })}
      </div>

      {selectedDay && selectedDay.periods.length > 0 ? (
        <div className="space-y-3">
          {selectedDay.periods.map((period) => (
            <PeriodCard
              key={`${period.timetableEntryId}-${period.date}`}
              period={period}
              onPrepare={onPrepare}
              onRecord={onRecord}
              preparing={preparingId === period.timetableEntryId}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted">
            <BookOpen className="size-5 text-muted-foreground" />
          </div>
          <h3 className="mt-3 text-sm font-semibold">
            No lessons on {selectedDay?.dayName ?? 'this day'}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            Your timetable has no periods for this day in {data.termName}. Plans
            can also be written ahead from a scheme of work.
          </p>
        </div>
      )}
    </div>
  )
}
