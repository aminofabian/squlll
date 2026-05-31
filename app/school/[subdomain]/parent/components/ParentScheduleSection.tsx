'use client'

import { Calendar, Clock, MapPin, RefreshCw, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParentChildSchedule } from '@/lib/parent/useParentChildSchedule'
import type { ParentPortalChild } from '@/lib/parent/types'

interface ParentScheduleSectionProps {
  child?: ParentPortalChild
}

export function ParentScheduleSection({ child }: ParentScheduleSectionProps) {
  const gradeId = child?.gradeId || null
  const isDemo = !gradeId || child?.studentId?.startsWith('demo-')
  const { todayLessons, termName, loading, error, refetch } =
    useParentChildSchedule(isDemo ? null : gradeId)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-primary/20 bg-white p-4 shadow-xl md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-primary">
              <Calendar className="h-6 w-6" />
              Today&apos;s Schedule
            </h2>
            {child ? (
              <p className="text-sm text-slate-600">
                {child.name}
                {termName ? ` · ${termName}` : ''}
              </p>
            ) : null}
          </div>
          {!isDemo ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          ) : null}
        </div>

        {isDemo ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Link a child to see their class timetable for today.
          </p>
        ) : null}

        {error ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {!isDemo ? (
          <>
            {loading && todayLessons.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading schedule…
              </p>
            ) : todayLessons.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No lessons scheduled for today (or timetable not published).
              </p>
            ) : (
              <div className="space-y-3">
                {todayLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex flex-col gap-2 rounded-xl border-2 border-primary/20 p-4 hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                        P{lesson.periodNumber}
                      </div>
                      <div>
                        <p className="font-black text-slate-800">
                          {lesson.subject.name}
                        </p>
                        <p className="flex items-center gap-1 text-sm text-slate-600">
                          <User className="h-3.5 w-3.5" />
                          {lesson.teacher.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {lesson.room || 'TBA'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Period {lesson.periodNumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
