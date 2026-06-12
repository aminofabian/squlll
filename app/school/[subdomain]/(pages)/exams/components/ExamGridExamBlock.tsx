'use client'

import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  EXAM_GRID_ROW_HEIGHT,
  formatDurationMinutes,
  formatDurationMinutesShort,
  minutesToDisplayTime,
  subjectAccent,
  timeToMinutes,
  type ExamTimetableDraft,
} from './exam-timetable.utils'

type ExamGridExamBlockProps = {
  draft: ExamTimetableDraft
  rowStart: number
  rowSpan: number
  column?: number
  columnCount?: number
  rowHeight?: number
  hasClash?: boolean
  /** Show grade name under subject (single-grade multi-day grid) */
  showGrade?: boolean
  onClick: () => void
}

export function ExamGridExamBlock({
  draft,
  rowStart,
  rowSpan,
  column = 0,
  columnCount = 1,
  rowHeight = EXAM_GRID_ROW_HEIGHT,
  hasClash,
  showGrade = false,
  onClick,
}: ExamGridExamBlockProps) {
  const accent = subjectAccent(draft.subject)
  const widthPct = 100 / columnCount
  const leftPct = column * widthPct
  const endMinutes =
    timeToMinutes(draft.startTime) + Number(draft.durationMinutes)
  const durationLabel =
    rowSpan >= 2
      ? formatDurationMinutes(draft.durationMinutes)
      : formatDurationMinutesShort(draft.durationMinutes)
  const showTime = rowSpan >= 3
  const showRoom = rowSpan >= 4 && draft.roomName

  return (
    <button
      type="button"
      className={cn(
        'absolute z-10 overflow-hidden rounded border px-1 py-0.5 text-center shadow-sm transition-shadow hover:shadow-md',
        hasClash
          ? 'border-red-500 bg-red-50 text-red-900 ring-1 ring-red-300 dark:border-red-700 dark:bg-red-950/50 dark:text-red-100'
          : accent.bg,
      )}
      style={{
        top: rowStart * rowHeight + 1,
        height: rowSpan * rowHeight - 2,
        left: `calc(${leftPct}% + 1px)`,
        width: `calc(${widthPct}% - 2px)`,
      }}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-0.5 px-0.5">
        <div
          className={cn(
            'w-full font-semibold leading-tight text-slate-900 dark:text-slate-100',
            rowSpan >= 3 ? 'line-clamp-3 text-[10px]' : 'line-clamp-2 text-[9px]',
          )}
        >
          {draft.subject}
        </div>
        {durationLabel ? (
          <div className="text-[9px] font-medium tabular-nums text-slate-600 opacity-90 dark:text-slate-300">
            {durationLabel}
          </div>
        ) : null}
        {showGrade && rowSpan >= 2 ? (
          <div className="line-clamp-1 text-[9px] opacity-80">{draft.grade}</div>
        ) : null}
        {showTime ? (
          <div className="font-mono text-[9px] tabular-nums opacity-70">
            {draft.startTime.slice(0, 5)}–{minutesToDisplayTime(endMinutes)}
          </div>
        ) : null}
        {showRoom ? (
          <div className="flex max-w-full items-center justify-center gap-0.5 truncate text-[9px] opacity-75">
            <MapPin className="h-2 w-2 shrink-0" />
            <span className="truncate">{draft.roomName}</span>
          </div>
        ) : null}
      </div>
    </button>
  )
}

export function ExamGridTimeRail({
  timeSlots,
  rowHeight = EXAM_GRID_ROW_HEIGHT,
}: {
  timeSlots: string[]
  rowHeight?: number
}) {
  return (
    <div className="relative border-r border-slate-200 dark:border-slate-700">
      {timeSlots.map((time, index) => (
        <div
          key={time}
          className={cn(
            'flex items-center justify-center border-b border-slate-100 dark:border-slate-800',
            index % 2 === 0
              ? 'bg-slate-50/60 dark:bg-slate-800/30'
              : 'bg-white dark:bg-slate-900',
          )}
          style={{ height: rowHeight }}
        >
          <span className="font-mono text-[10px] font-medium tabular-nums text-slate-600 dark:text-slate-400">
            {time}
          </span>
        </div>
      ))}
    </div>
  )
}
