'use client'

import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsLgUp } from '@/hooks/use-lg-up'
import {
  EXAM_SLOT_MINUTES,
  EXAM_GRID_GRADE_COL,
  EXAM_GRID_ROW_HEIGHT,
  EXAM_GRID_TIME_COL,
  buildExamDays,
  buildGradeColumns,
  buildTimeSlots,
  isCompleteDraft,
  placeExamBlocksByGrade,
  totalDurationForDay,
  type ExamTimetableDraft,
} from './exam-timetable.utils'
import { ExamSchoolMobileSchedule } from './ExamTimetableMobileViews'
import { ExamGridExamBlock, ExamGridTimeRail } from './ExamGridExamBlock'
import {
  ExamTimetableDayToolbar,
  ExamTimetableMetaChip,
} from './ExamTimetableDayToolbar'
import { ExamTimetableDesktopLayout } from './ExamTimetableDesktopLayout'

interface ExamSchoolTimetableGridProps {
  drafts: ExamTimetableDraft[]
  grades: Array<{ id: string; name: string }>
  sessionStart?: string | null
  sessionEnd?: string | null
  dailyStartTime?: string | null
  dailyEndTime?: string | null
  examDaysOfWeek?: number[] | null
  clashingPaperIds?: Set<string>
  placementActive?: boolean
  onCellClick: (gradeId: string, date: string, time: string) => void
  onExamClick: (draft: ExamTimetableDraft) => void
  sidePanel?: React.ReactNode
}

export function ExamSchoolTimetableGrid({
  drafts,
  grades,
  sessionStart,
  sessionEnd,
  dailyStartTime,
  dailyEndTime,
  examDaysOfWeek,
  clashingPaperIds,
  placementActive = false,
  onCellClick,
  onExamClick,
  sidePanel,
}: ExamSchoolTimetableGridProps) {
  const gradeColumns = useMemo(() => buildGradeColumns(grades), [grades])
  const examDays = useMemo(
    () => buildExamDays(drafts, sessionStart, sessionEnd, examDaysOfWeek),
    [drafts, sessionStart, sessionEnd, examDaysOfWeek],
  )
  const timeSlots = useMemo(
    () => buildTimeSlots(drafts, EXAM_SLOT_MINUTES, dailyStartTime, dailyEndTime),
    [drafts, dailyStartTime, dailyEndTime],
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

  const placedBlocks = useMemo(
    () =>
      placeExamBlocksByGrade(drafts, gradeColumns, selectedDay, timeSlots),
    [drafts, gradeColumns, selectedDay, timeSlots],
  )

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
  const gridColumns = `${EXAM_GRID_TIME_COL}px repeat(${gradeColumns.length}, minmax(${EXAM_GRID_GRADE_COL}px, 1fr))`

  const scheduledCount = (day: string) =>
    drafts.filter((d) => d.date === day && isCompleteDraft(d)).length

  const dayDuration = (day: string) => totalDurationForDay(drafts, day)

  if (gradeColumns.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <p className="text-xs text-slate-600">No grades in this exam session.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {showMobile ? (
        <ExamSchoolMobileSchedule
          examDays={examDays}
          selectedDay={activeDay}
          onSelectDay={setSelectedDay}
          timeSlots={timeSlots}
          gradeColumns={gradeColumns}
          drafts={drafts}
          placementActive={placementActive}
          clashingPaperIds={clashingPaperIds}
          onCellClick={onCellClick}
          onExamClick={onExamClick}
        />
      ) : examDays.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200/80 bg-slate-50/50 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <p className="text-xs text-slate-600">
            Set the exam period above to show day tabs for the whole-school grid.
          </p>
        </div>
      ) : (
        <ExamTimetableDesktopLayout
          toolbar={
            <ExamTimetableDayToolbar
              icon={LayoutGrid}
              title="Whole-school timetable"
              subtitle="Every grade in each time slot"
              examDays={examDays}
              selectedDay={activeDay}
              onSelectDay={setSelectedDay}
              countForDay={scheduledCount}
              durationForDay={dayDuration}
              meta={
                <>
                  <ExamTimetableMetaChip tone="teal">
                    {gradeColumns.length} grades
                  </ExamTimetableMetaChip>
                  <ExamTimetableMetaChip>{examDays.length} days</ExamTimetableMetaChip>
                </>
              }
            />
          }
          table={
            <div className="overflow-x-auto border-2 border-[#246a59] bg-white dark:bg-slate-900">
              <div
                className="min-w-max"
                style={{
                  minWidth: EXAM_GRID_TIME_COL + gradeColumns.length * EXAM_GRID_GRADE_COL,
                }}
              >
                <div
                  className="grid border-b-2 border-[#246a59]/30"
                  style={{ gridTemplateColumns: gridColumns }}
                >
                  <div className="flex items-center justify-center border-r-2 border-[#246a59]/30 bg-[#246a59]/5 px-1.5 py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#246a59]">
                      Time
                    </span>
                  </div>
                  {gradeColumns.map((grade) => (
                    <div
                      key={grade.id}
                      className="border-r-2 border-[#246a59]/30 bg-[#246a59]/5 px-1 py-1 text-center last:border-r-0"
                      title={grade.displayName}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wide text-[#246a59]">
                        {grade.shortLabel}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid" style={{ gridTemplateColumns: gridColumns }}>
                  <ExamGridTimeRail timeSlots={timeSlots} rowHeight={rowHeight} />

                  {gradeColumns.map((grade, gradeIndex) => (
                    <div
                      key={grade.id}
                      className="relative border-r-2 border-[#246a59]/30 last:border-r-0"
                      style={{ height: gridHeight }}
                    >
                      {timeSlots.map((time, rowIndex) => (
                        <button
                          key={`${grade.id}-${time}`}
                          type="button"
                          className={cn(
                            'absolute left-0 right-0 border-b border-[#246a59]/15 transition-colors',
                            placementActive
                              ? 'cursor-crosshair hover:bg-[#246a59]/10'
                              : 'hover:bg-[#246a59]/5',
                            rowIndex % 2 === 0
                              ? 'bg-white dark:bg-slate-900'
                              : 'bg-[#246a59]/[0.03] dark:bg-slate-900/80',
                          )}
                          style={{
                            top: rowIndex * rowHeight,
                            height: rowHeight,
                          }}
                          onClick={() => {
                            if (!selectedDay) return
                            onCellClick(grade.id, selectedDay, time)
                          }}
                          aria-label={`Schedule ${grade.displayName} on ${selectedDay} at ${time}`}
                        />
                      ))}

                      {placedBlocks
                        .filter((block) => block.gradeIndex === gradeIndex)
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
                            onClick={() => onExamClick(block.draft)}
                          />
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
          sidebar={sidePanel}
        />
      )}
    </div>
  )
}
