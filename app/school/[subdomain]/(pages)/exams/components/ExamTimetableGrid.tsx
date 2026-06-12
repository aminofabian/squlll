'use client'

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useIsLgUp } from '@/hooks/use-lg-up'
import {
  EXAM_SLOT_MINUTES,
  EXAM_GRID_DAY_COL,
  EXAM_GRID_ROW_HEIGHT,
  EXAM_GRID_TIME_COL,
  buildExamDays,
  buildTimeSlots,
  formatExamDayHeader,
  isCompleteDraft,
  placeExamBlocks,
  type ExamTimetableDraft,
} from './exam-timetable.utils'
import { ExamGradeMobileSchedule } from './ExamTimetableMobileViews'
import { ExamGridExamBlock, ExamGridTimeRail } from './ExamGridExamBlock'

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

  const [selectedDay, setSelectedDay] = useState('')

  useEffect(() => {
    if (examDays.length === 0) {
      setSelectedDay('')
      return
    }
    setSelectedDay((current) =>
      current && examDays.includes(current) ? current : examDays[0],
    )
  }, [examDays])

  const activeDay = useMemo(
    () =>
      selectedDay && examDays.includes(selectedDay)
        ? selectedDay
        : examDays[0] ?? '',
    [selectedDay, examDays],
  )

  const isLgUp = useIsLgUp()
  const showMobile = isLgUp !== true

  const rowHeight = EXAM_GRID_ROW_HEIGHT
  const gridHeight = timeSlots.length * rowHeight
  const gridColumns = `${EXAM_GRID_TIME_COL}px repeat(${examDays.length}, minmax(${EXAM_GRID_DAY_COL}px, 1fr))`

  if (showMobile) {
    return (
      <ExamGradeMobileSchedule
        examDays={examDays}
        selectedDay={activeDay}
        onSelectDay={setSelectedDay}
        timeSlots={timeSlots}
        drafts={drafts}
        placementActive={placementActive}
        clashingPaperIds={clashingPaperIds}
        onSlotClick={onCellClick}
        onExamClick={onExamClick}
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:ring-slate-800">
      <div
        className="min-w-max"
        style={{ minWidth: EXAM_GRID_TIME_COL + examDays.length * EXAM_GRID_DAY_COL }}
      >
        <div
          className="grid border-b border-slate-200 dark:border-slate-700"
          style={{ gridTemplateColumns: gridColumns }}
        >
          <div className="flex items-center border-r border-slate-200 bg-slate-50/90 px-1.5 py-1 dark:border-slate-700 dark:bg-slate-900/90">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Time
            </span>
          </div>
          {examDays.map((day) => {
            const { weekday, label } = formatExamDayHeader(day)
            const isWeekend = weekday === 'SAT' || weekday === 'SUN'
            return (
              <div
                key={day}
                className={cn(
                  'border-r border-slate-200 px-1 py-1 text-center last:border-r-0 dark:border-slate-700',
                  isWeekend
                    ? 'bg-amber-50/80 dark:bg-amber-950/20'
                    : 'bg-slate-50/90 dark:bg-slate-900/90',
                )}
              >
                <div
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wide',
                    isWeekend ? 'text-amber-700 dark:text-amber-300' : 'text-[#246a59]',
                  )}
                >
                  {weekday}
                </div>
                <div className="text-[11px] font-semibold leading-tight text-slate-800 dark:text-slate-100">
                  {label}
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid" style={{ gridTemplateColumns: gridColumns }}>
          <ExamGridTimeRail timeSlots={timeSlots} rowHeight={rowHeight} />

          {examDays.map((day, dayIndex) => (
            <div
              key={day}
              className="relative border-r border-slate-200 last:border-r-0 dark:border-slate-700"
              style={{ height: gridHeight }}
            >
              {timeSlots.map((time, rowIndex) => (
                <button
                  key={`${day}-${time}`}
                  type="button"
                  className={cn(
                    'absolute left-0 right-0 border-b border-slate-100 transition-colors dark:border-slate-800',
                    placementActive
                      ? 'cursor-crosshair hover:bg-[#246a59]/10'
                      : 'hover:bg-[#246a59]/5',
                    rowIndex % 2 === 0
                      ? 'bg-white dark:bg-slate-900'
                      : 'bg-slate-50/40 dark:bg-slate-800/20',
                  )}
                  style={{
                    top: rowIndex * rowHeight,
                    height: rowHeight,
                  }}
                  onClick={() => onCellClick(day, time)}
                  aria-label={`Schedule exam on ${day} at ${time}`}
                />
              ))}

              {placedBlocks
                .filter((block) => block.dayIndex === dayIndex)
                .map((block) => (
                  <ExamGridExamBlock
                    key={block.draft.paperId}
                    draft={block.draft}
                    rowStart={block.rowStart}
                    rowSpan={block.rowSpan}
                    column={block.column}
                    columnCount={block.columnCount}
                    rowHeight={rowHeight}
                    hasClash={clashingPaperIds?.has(block.draft.paperId)}
                    showGrade
                    onClick={() => onExamClick(block.draft)}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
