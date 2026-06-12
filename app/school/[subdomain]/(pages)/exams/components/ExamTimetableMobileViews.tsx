'use client'

import { Calendar, ChevronRight, LayoutGrid, MapPin, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  formatDurationMinutes,
  isCompleteDraft,
  minutesToDisplayTime,
  subjectAccent,
  timeToMinutes,
  totalDurationForDay,
  type ExamTimetableDraft,
  type ExamGradeColumn,
} from './exam-timetable.utils'
import {
  ExamTimetableDayToolbar,
  ExamTimetableMetaChip,
} from './ExamTimetableDayToolbar'

export { ExamTimetableDayTabs } from './ExamTimetableDayToolbar'

function endTimeDisplay(startTime: string, durationMinutes: string | number) {
  const end = timeToMinutes(startTime) + Number(durationMinutes)
  return minutesToDisplayTime(end)
}

function ExamMobileCard({
  draft,
  hasClash,
  onClick,
  compact,
}: {
  draft: ExamTimetableDraft
  hasClash?: boolean
  onClick: () => void
  compact?: boolean
}) {
  const accent = subjectAccent(draft.subject)
  const duration = formatDurationMinutes(draft.durationMinutes)
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5 text-center transition-colors active:scale-[0.99] sm:gap-1 sm:rounded-xl sm:px-3 sm:py-2.5 sm:shadow-sm',
        hasClash
          ? 'border-red-400 bg-red-50 dark:border-red-800 dark:bg-red-950/40'
          : cn('border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-900', accent.bg),
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full sm:h-2 sm:w-2', accent.dot)} />
      <div className="min-w-0 w-full">
        <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100 sm:text-sm sm:leading-snug">
          {draft.subject}
        </p>
        {!compact ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{draft.grade}</p>
        ) : null}
        <div className="mt-0.5 flex flex-wrap items-center justify-center gap-x-1.5 text-[9px] text-slate-500 sm:mt-1 sm:gap-x-2 sm:text-[10px]">
          {duration ? (
            <span className="font-medium text-slate-600 dark:text-slate-300">{duration}</span>
          ) : null}
          {draft.startTime ? (
            <span className="font-mono tabular-nums opacity-80">
              {draft.startTime.slice(0, 5)}–{endTimeDisplay(draft.startTime, draft.durationMinutes)}
            </span>
          ) : null}
          {draft.roomName ? (
            <span className="inline-flex items-center gap-0.5 truncate">
              <MapPin className="h-2 w-2 shrink-0 sm:h-2.5 sm:w-2.5" />
              {draft.roomName}
            </span>
          ) : null}
        </div>
      </div>
      <ChevronRight className="h-3 w-3 shrink-0 text-slate-300 sm:h-4 sm:w-4" />
    </button>
  )
}

/** Single-grade mobile: day tabs + time-slot agenda */
export function ExamGradeMobileSchedule({
  examDays,
  selectedDay,
  onSelectDay,
  timeSlots,
  drafts,
  placementActive,
  clashingPaperIds,
  onSlotClick,
  onExamClick,
}: {
  examDays: string[]
  selectedDay: string
  onSelectDay: (day: string) => void
  timeSlots: string[]
  drafts: ExamTimetableDraft[]
  placementActive?: boolean
  clashingPaperIds?: Set<string>
  onSlotClick: (day: string, time: string) => void
  onExamClick: (draft: ExamTimetableDraft) => void
}) {
  const displayDay = selectedDay || examDays[0] || ''

  const dayDrafts = drafts.filter(
    (d) => d.date === displayDay && isCompleteDraft(d),
  )
  const examBySlot = new Map(
    dayDrafts.map((d) => [d.startTime.slice(0, 5), d]),
  )

  const scheduledCount = (day: string) =>
    drafts.filter((d) => d.date === day && isCompleteDraft(d)).length

  const dayDuration = (day: string) => totalDurationForDay(drafts, day)

  return (
    <div className="space-y-1.5 sm:space-y-3">
      <ExamTimetableDayToolbar
        icon={Calendar}
        title="Exam days"
        subtitle="Select a day to view the schedule"
        examDays={examDays}
        selectedDay={selectedDay}
        onSelectDay={onSelectDay}
        countForDay={scheduledCount}
        durationForDay={dayDuration}
        meta={
          <>
            <ExamTimetableMetaChip>{examDays.length} days</ExamTimetableMetaChip>
            <ExamTimetableMetaChip tone="teal">
              {drafts.filter(isCompleteDraft).length} scheduled
            </ExamTimetableMetaChip>
          </>
        }
      />

      {examDays.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-500 dark:border-slate-700 sm:rounded-xl sm:px-4 sm:py-8 sm:text-sm">
          Set the exam period to show days.
        </div>
      ) : displayDay ? (
        <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-900 sm:rounded-xl sm:ring-1 sm:ring-slate-100 dark:sm:ring-slate-800">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {timeSlots.map((time) => {
              const exam = examBySlot.get(time)
              return (
                <div key={time} className="flex gap-1.5 px-2 py-1 sm:gap-2 sm:px-3 sm:py-2">
                  <div className="flex w-9 shrink-0 items-center sm:w-12 sm:flex-col sm:items-start sm:pt-1">
                    <span className="font-mono text-[10px] font-semibold tabular-nums text-slate-500 dark:text-slate-400 sm:text-[11px] sm:text-slate-600 dark:sm:text-slate-300">
                      {time}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    {exam ? (
                      <ExamMobileCard
                        draft={exam}
                        hasClash={clashingPaperIds?.has(exam.paperId)}
                        onClick={() => onExamClick(exam)}
                        compact
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSlotClick(displayDay, time)}
                        className={cn(
                          'flex min-h-[36px] w-full items-center justify-center gap-1 rounded-lg border border-dashed px-2 py-1.5 text-[10px] transition-colors sm:min-h-[44px] sm:justify-start sm:gap-2 sm:px-3 sm:py-2 sm:text-xs',
                          placementActive
                            ? 'border-[#246a59]/40 bg-[#246a59]/5 text-[#246a59]'
                            : 'border-slate-200/80 text-slate-400 hover:border-[#246a59]/30 dark:border-slate-700',
                        )}
                      >
                        <Plus className="h-3 w-3 shrink-0" />
                        <span className="hidden sm:inline">Tap to schedule</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/** Whole-school mobile: day tabs + compact grid (grades header once) */
export function ExamSchoolMobileSchedule({
  examDays,
  selectedDay,
  onSelectDay,
  timeSlots,
  gradeColumns,
  drafts,
  placementActive,
  clashingPaperIds,
  onCellClick,
  onExamClick,
}: {
  examDays: string[]
  selectedDay: string
  onSelectDay: (day: string) => void
  timeSlots: string[]
  gradeColumns: ExamGradeColumn[]
  drafts: ExamTimetableDraft[]
  placementActive?: boolean
  clashingPaperIds?: Set<string>
  onCellClick: (gradeId: string, date: string, time: string) => void
  onExamClick: (draft: ExamTimetableDraft) => void
}) {
  const scheduledCount = (day: string) =>
    drafts.filter((d) => d.date === day && isCompleteDraft(d)).length

  const dayDuration = (day: string) => totalDurationForDay(drafts, day)

  const displayDay = selectedDay || examDays[0] || ''

  const examKey = (gradeId: string, time: string) => {
    const match = drafts.find(
      (d) =>
        d.gradeId === gradeId &&
        d.date === displayDay &&
        isCompleteDraft(d) &&
        d.startTime.slice(0, 5) === time,
    )
    return match
  }

  return (
    <div className="space-y-1.5 sm:space-y-3">
      <ExamTimetableDayToolbar
        icon={LayoutGrid}
        title="Whole-school timetable"
        subtitle="Every grade in each time slot"
        examDays={examDays}
        selectedDay={selectedDay}
        onSelectDay={onSelectDay}
        countForDay={scheduledCount}
        durationForDay={dayDuration}
        meta={
          <>
            <ExamTimetableMetaChip>{gradeColumns.length} grades</ExamTimetableMetaChip>
            <ExamTimetableMetaChip>{examDays.length} days</ExamTimetableMetaChip>
          </>
        }
      />

      {examDays.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-500 dark:border-slate-700 sm:rounded-xl sm:px-4 sm:py-8 sm:text-sm">
          Set the exam period to show days.
        </div>
      ) : displayDay ? (
        <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-900 sm:rounded-xl sm:ring-1 sm:ring-slate-100 dark:sm:ring-slate-800">
          <div className="overflow-x-auto scrollbar-none">
            <div
              className="grid min-w-max"
              style={{
                gridTemplateColumns: `2.5rem repeat(${gradeColumns.length}, 4.25rem)`,
              }}
            >
              <div className="sticky left-0 z-20 border-b border-r border-slate-100 bg-slate-50 px-0.5 py-1 dark:border-slate-800 dark:bg-slate-900" />
              {gradeColumns.map((grade) => (
                <div
                  key={`head-${grade.id}`}
                  className="border-b border-r border-slate-100 bg-slate-50/90 px-0.5 py-1 text-center last:border-r-0 dark:border-slate-800 dark:bg-slate-900/90"
                  title={grade.displayName}
                >
                  <span className="text-[8px] font-bold uppercase tracking-wide text-[#246a59]">
                    {grade.shortLabel}
                  </span>
                </div>
              ))}

              {timeSlots.map((time, rowIndex) => (
                <div key={time} className="contents">
                  <div
                    className={cn(
                      'sticky left-0 z-10 flex items-center border-b border-r border-slate-100 px-1 py-1 dark:border-slate-800',
                      rowIndex % 2 === 0
                        ? 'bg-white dark:bg-slate-900'
                        : 'bg-slate-50/70 dark:bg-slate-900/80',
                    )}
                  >
                    <span className="font-mono text-[9px] font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                      {time}
                    </span>
                  </div>
                  {gradeColumns.map((grade) => {
                    const exam = examKey(grade.id, time)
                    const accent = exam ? subjectAccent(exam.subject) : null
                    const hasClash = exam && clashingPaperIds?.has(exam.paperId)

                    if (exam) {
                      const duration = formatDurationMinutes(exam.durationMinutes)
                      return (
                        <button
                          key={`${time}-${grade.id}`}
                          type="button"
                          onClick={() => onExamClick(exam)}
                          className={cn(
                            'flex min-h-[2rem] flex-col items-center justify-center border-b border-r border-slate-100 px-0.5 py-0.5 text-center last:border-r-0 dark:border-slate-800',
                            rowIndex % 2 === 0
                              ? 'bg-white dark:bg-slate-900'
                              : 'bg-slate-50/70 dark:bg-slate-900/80',
                            hasClash
                              ? 'bg-red-50 dark:bg-red-950/40'
                              : accent?.bg,
                            hasClash && 'ring-1 ring-inset ring-red-300 dark:ring-red-800',
                          )}
                        >
                          <span className="line-clamp-2 px-0.5 text-[9px] font-semibold leading-tight text-slate-800 dark:text-slate-100">
                            {exam.subject}
                          </span>
                          {duration ? (
                            <span className="text-[8px] font-medium text-slate-500 dark:text-slate-400">
                              {duration}
                            </span>
                          ) : null}
                        </button>
                      )
                    }

                    return (
                      <button
                        key={`${time}-${grade.id}`}
                        type="button"
                        onClick={() => onCellClick(grade.id, displayDay, time)}
                        className={cn(
                          'flex min-h-[2rem] items-center justify-center border-b border-r border-slate-100 last:border-r-0 dark:border-slate-800',
                          rowIndex % 2 === 0
                            ? 'bg-white dark:bg-slate-900'
                            : 'bg-slate-50/70 dark:bg-slate-900/80',
                          placementActive
                            ? 'text-[#246a59] hover:bg-[#246a59]/5'
                            : 'text-slate-300',
                        )}
                        aria-label={`Schedule ${grade.displayName} at ${time}`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
