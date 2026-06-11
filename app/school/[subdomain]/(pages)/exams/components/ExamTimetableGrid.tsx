'use client'

import { useMemo } from 'react'
import { Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  EXAM_SLOT_MINUTES,
  buildExamDays,
  buildTimeSlots,
  formatExamDayHeader,
  isCompleteDraft,
  placeExamBlocks,
  subjectAccent,
  timeToMinutes,
  type ExamTimetableDraft,
} from './exam-timetable.utils'

const ROW_HEIGHT = 36

interface ExamTimetableGridProps {
  drafts: ExamTimetableDraft[]
  sessionStart?: string | null
  sessionEnd?: string | null
  dailyStartTime?: string | null
  dailyEndTime?: string | null
  clashingPaperIds?: Set<string>
  placementActive?: boolean
  examDaysOfWeek?: number[] | null
  onCellClick: (date: string, time: string) => void
  onExamClick: (draft: ExamTimetableDraft) => void
}

export function ExamTimetableGrid({
  drafts,
  sessionStart,
  sessionEnd,
  dailyStartTime,
  dailyEndTime,
  clashingPaperIds,
  placementActive = false,
  examDaysOfWeek,
  onCellClick,
  onExamClick,
}: ExamTimetableGridProps) {
  const examDays = useMemo(
    () => buildExamDays(drafts, sessionStart, sessionEnd, examDaysOfWeek),
    [drafts, sessionStart, sessionEnd, examDaysOfWeek],
  )
  const timeSlots = useMemo(
    () => buildTimeSlots(drafts, EXAM_SLOT_MINUTES, dailyStartTime, dailyEndTime),
    [drafts, dailyStartTime, dailyEndTime],
  )
  const placedBlocks = useMemo(
    () => placeExamBlocks(drafts, examDays, timeSlots),
    [drafts, examDays, timeSlots],
  )

  const gridHeight = timeSlots.length * ROW_HEIGHT

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="min-w-[720px]">
        {/* Day headers */}
        <div
          className="grid border-b border-slate-200 dark:border-slate-700"
          style={{ gridTemplateColumns: `108px repeat(${examDays.length}, minmax(140px, 1fr))` }}
        >
          <div className="border-r border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/80">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Time
            </span>
          </div>
          {examDays.map((day) => {
            const { weekday, label, year } = formatExamDayHeader(day)
            const isWeekend = weekday === 'SAT' || weekday === 'SUN'
            return (
              <div
                key={day}
                className={cn(
                  'border-r border-slate-200 px-2 py-2 text-center last:border-r-0 dark:border-slate-700',
                  isWeekend
                    ? 'bg-amber-50/80 dark:bg-amber-950/20'
                    : 'bg-slate-50 dark:bg-slate-800/80',
                )}
              >
                <div
                  className={cn(
                    'text-[10px] font-bold tracking-wider',
                    isWeekend ? 'text-amber-700 dark:text-amber-300' : 'text-primary',
                  )}
                >
                  {weekday}
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {label}
                </div>
                <div className="text-[9px] text-slate-400">{year}</div>
              </div>
            )
          })}
        </div>

        {/* Grid body */}
        <div
          className="grid"
          style={{ gridTemplateColumns: `108px repeat(${examDays.length}, minmax(140px, 1fr))` }}
        >
          {/* Time rail */}
          <div className="relative border-r border-slate-200 dark:border-slate-700">
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className={cn(
                  'flex items-start border-b border-slate-100 px-3 pt-1 dark:border-slate-800',
                  index % 2 === 0 ? 'bg-slate-50/60 dark:bg-slate-800/30' : 'bg-white dark:bg-slate-900',
                )}
                style={{ height: ROW_HEIGHT }}
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="font-mono text-[11px] font-medium tabular-nums text-slate-600 dark:text-slate-300">
                    {time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {examDays.map((day, dayIndex) => (
            <div
              key={day}
              className="relative border-r border-slate-200 last:border-r-0 dark:border-slate-700"
              style={{ height: gridHeight }}
            >
              {/* Clickable slot grid */}
              {timeSlots.map((time, rowIndex) => (
                <button
                  key={`${day}-${time}`}
                  type="button"
                  className={cn(
                    'absolute left-0 right-0 border-b border-slate-100 transition-colors dark:border-slate-800',
                    placementActive
                      ? 'cursor-crosshair hover:bg-primary/10'
                      : 'hover:bg-primary/5',
                    rowIndex % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-800/20',
                  )}
                  style={{
                    top: rowIndex * ROW_HEIGHT,
                    height: ROW_HEIGHT,
                  }}
                  onClick={() => onCellClick(day, time)}
                  aria-label={`Schedule exam on ${day} at ${time}`}
                />
              ))}

              {/* Placed exam blocks */}
              {placedBlocks
                .filter((block) => block.dayIndex === dayIndex)
                .map((block) => {
                  const accent = subjectAccent(block.draft.subject)
                  const hasClash = clashingPaperIds?.has(block.draft.paperId)
                  const widthPct = 100 / block.columnCount
                  const leftPct = block.column * widthPct
                  const endMinutes =
                    timeToMinutes(block.draft.startTime) +
                    Number(block.draft.durationMinutes)

                  return (
                    <button
                      key={block.draft.paperId}
                      type="button"
                      className={cn(
                        'absolute z-10 overflow-hidden rounded-md border px-1.5 py-1 text-left shadow-sm transition-shadow hover:shadow-md',
                        hasClash
                          ? 'border-red-500 bg-red-50 text-red-900 ring-2 ring-red-300 dark:border-red-700 dark:bg-red-950/50 dark:text-red-100'
                          : accent.bg,
                      )}
                      style={{
                        top: block.rowStart * ROW_HEIGHT + 2,
                        height: block.rowSpan * ROW_HEIGHT - 4,
                        left: `calc(${leftPct}% + 2px)`,
                        width: `calc(${widthPct}% - 4px)`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onExamClick(block.draft)
                      }}
                    >
                      <div className="flex items-start gap-1">
                        <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', accent.dot)} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[11px] font-semibold leading-tight">
                            {block.draft.subject}
                          </div>
                          <div className="truncate text-[10px] opacity-80">
                            {block.draft.grade}
                          </div>
                          <div className="mt-0.5 font-mono text-[9px] tabular-nums opacity-70">
                            {block.draft.startTime.slice(0, 5)}–
                            {minutesToDisplay(endMinutes)}
                          </div>
                          {block.draft.roomName ? (
                            <div className="mt-0.5 flex items-center gap-0.5 truncate text-[9px] opacity-70">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />
                              {block.draft.roomName}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  )
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function minutesToDisplay(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
