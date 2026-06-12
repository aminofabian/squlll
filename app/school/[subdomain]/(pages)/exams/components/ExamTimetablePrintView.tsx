'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  formatPaperDisplayName,
  formatPrintPaperLabel,
  type ExamPrintSubjectLabelMode,
} from '@/lib/exams/examPaperComponents'
import {
  EXAM_SLOT_MINUTES,
  buildGradeColumns,
  buildTimeSlots,
  formatDurationMinutes,
  formatDurationMinutesShort,
  formatExamDayHeader,
  isCompleteDraft,
  minutesToDisplayTime,
  minutesToTime,
  placeExamBlocks,
  placeExamBlocksByGrade,
  timeToMinutes,
  type ExamGradeColumn,
  type ExamTimetableDraft,
} from './exam-timetable.utils'

export type ExamPrintOrientation = 'auto' | 'portrait' | 'landscape'

interface ExamTimetablePrintViewProps {
  sessionName: string
  sessionMeta?: string
  periodLabel: string
  grades: Array<{ id: string; name: string }>
  drafts: ExamTimetableDraft[]
  isSchoolView: boolean
  orientation?: ExamPrintOrientation
  subjectLabelMode?: ExamPrintSubjectLabelMode
  dailyStartTime?: string | null
  dailyEndTime?: string | null
}

const PRINT_SUBJECT_PALETTE = [
  { bg: '#eff6ff', border: '#93c5fd', text: '#1e3a8a' },
  { bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46' },
  { bg: '#f5f3ff', border: '#c4b5fd', text: '#4c1d95' },
  { bg: '#fffbeb', border: '#fcd34d', text: '#78350f' },
  { bg: '#fdf2f8', border: '#f9a8d4', text: '#831843' },
  { bg: '#ecfeff', border: '#67e8f9', text: '#164e63' },
]

function subjectPrintStyle(subject: string) {
  let hash = 0
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PRINT_SUBJECT_PALETTE[Math.abs(hash) % PRINT_SUBJECT_PALETTE.length]
}

function buildScheduledExamDays(drafts: ExamTimetableDraft[]): string[] {
  return [...new Set(drafts.filter(isCompleteDraft).map((row) => row.date))]
    .filter(Boolean)
    .sort()
}

/** Only the hours that contain exams — keeps the print grid from overflowing the page */
function buildCompactTimeSlots(
  drafts: ExamTimetableDraft[],
  dailyStartTime?: string | null,
  dailyEndTime?: string | null,
): string[] {
  const scheduled = drafts.filter(isCompleteDraft)
  if (scheduled.length === 0) {
    return buildTimeSlots([], EXAM_SLOT_MINUTES, dailyStartTime, dailyEndTime)
  }

  let minMinutes = Infinity
  let maxMinutes = -Infinity

  for (const row of scheduled) {
    const start = timeToMinutes(row.startTime)
    const end = start + Number(row.durationMinutes)
    minMinutes = Math.min(minMinutes, start)
    maxMinutes = Math.max(maxMinutes, end)
  }

  minMinutes = Math.max(
    0,
    Math.floor((minMinutes - EXAM_SLOT_MINUTES) / EXAM_SLOT_MINUTES) * EXAM_SLOT_MINUTES,
  )
  maxMinutes = Math.ceil((maxMinutes + EXAM_SLOT_MINUTES) / EXAM_SLOT_MINUTES) * EXAM_SLOT_MINUTES

  const slots: string[] = []
  for (let t = minMinutes; t < maxMinutes; t += EXAM_SLOT_MINUTES) {
    slots.push(minutesToTime(t))
  }

  return slots.length > 0 ? slots : buildTimeSlots(scheduled, EXAM_SLOT_MINUTES, dailyStartTime, dailyEndTime)
}

type GridCell =
  | { kind: 'skip' }
  | { kind: 'empty' }
  | {
      kind: 'exam'
      paperId: string
      subjectName: string
      subjectCode?: string
      paperLabel?: string | null
      startTime: string
      durationMinutes: string
      roomName: string
      rowSpan: number
    }

function buildTableRows(
  columnCount: number,
  timeSlots: string[],
  blocks: Array<{
    columnIndex: number
    rowStart: number
    rowSpan: number
    paperId: string
    subjectName: string
    subjectCode?: string
    paperLabel?: string | null
    startTime: string
    durationMinutes: string
    roomName: string
  }>,
): GridCell[][] {
  const rowCount = timeSlots.length
  const covered = Array.from({ length: rowCount }, () =>
    Array<boolean>(columnCount).fill(false),
  )
  const blockAt = new Map<string, (typeof blocks)[number]>()

  for (const block of blocks) {
    blockAt.set(`${block.rowStart}-${block.columnIndex}`, block)
    for (let row = block.rowStart + 1; row < block.rowStart + block.rowSpan; row++) {
      if (row < rowCount) covered[row][block.columnIndex] = true
    }
  }

  return Array.from({ length: rowCount }, (_, rowIndex) =>
    Array.from({ length: columnCount }, (_, columnIndex) => {
      if (covered[rowIndex][columnIndex]) return { kind: 'skip' as const }
      const block = blockAt.get(`${rowIndex}-${columnIndex}`)
      if (block) {
        return {
          kind: 'exam' as const,
          paperId: block.paperId,
          subjectName: block.subjectName,
          subjectCode: block.subjectCode,
          paperLabel: block.paperLabel,
          startTime: block.startTime,
          durationMinutes: block.durationMinutes,
          roomName: block.roomName,
          rowSpan: block.rowSpan,
        }
      }
      return { kind: 'empty' as const }
    }),
  )
}

type SubjectLegendEntry = {
  code: string
  fullName: string
}

function buildSubjectLegend(drafts: ExamTimetableDraft[]): SubjectLegendEntry[] {
  const map = new Map<string, SubjectLegendEntry>()

  for (const draft of drafts.filter(isCompleteDraft)) {
    const subjectName = draft.subjectName ?? draft.subject
    const code = formatPrintPaperLabel(
      subjectName,
      draft.subjectCode,
      draft.paperLabel,
      'code',
    )
    const fullName = formatPaperDisplayName(subjectName, draft.paperLabel)
    map.set(code, { code, fullName })
  }

  return [...map.values()].sort((a, b) =>
    a.code.localeCompare(b.code, undefined, { sensitivity: 'base' }),
  )
}

function PrintSubjectLegend({ entries }: { entries: SubjectLegendEntry[] }) {
  if (entries.length === 0) return null

  const midpoint = Math.ceil(entries.length / 2)
  const columns = [entries.slice(0, midpoint), entries.slice(midpoint)]

  return (
    <div className="exam-print-legend">
      <p className="exam-print-legend-title">Subject key</p>
      <div className="exam-print-legend-columns">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="exam-print-legend-col">
            {column.map((entry) => (
              <div key={entry.code} className="exam-print-legend-item">
                <span className="exam-print-legend-code">{entry.code}</span>
                <span className="exam-print-legend-name">{entry.fullName}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function endTimeLabel(startTime: string, durationMinutes: string): string {
  const start = timeToMinutes(startTime)
  const duration = Number(durationMinutes)
  if (Number.isNaN(start) || Number.isNaN(duration) || duration <= 0) {
    return startTime.slice(0, 5) || '—'
  }
  return minutesToDisplayTime(start + duration)
}

function PrintTimetableTable({
  columnHeaders,
  timeSlots,
  tableRows,
  subjectLabelMode,
}: {
  columnHeaders: Array<{ key: string; line1: string; line2?: string }>
  timeSlots: string[]
  tableRows: GridCell[][]
  subjectLabelMode: ExamPrintSubjectLabelMode
}) {
  return (
    <table className="exam-print-table">
      <colgroup>
        <col className="exam-print-col-time" />
        {columnHeaders.map((col) => (
          <col key={col.key} className="exam-print-col-day" />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th>Time</th>
          {columnHeaders.map((col) => (
            <th key={col.key}>
              <span className="exam-print-th-line1">{col.line1}</span>
              {col.line2 ? (
                <span className="exam-print-th-line2">{col.line2}</span>
              ) : null}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {timeSlots.map((time, rowIndex) => (
          <tr key={`${time}-${rowIndex}`}>
            <td className="exam-print-time-cell">{time.slice(0, 5)}</td>
            {tableRows[rowIndex].map((cell, columnIndex) => {
              if (cell.kind === 'skip') return null

              if (cell.kind === 'empty') {
                return (
                  <td
                    key={`${columnHeaders[columnIndex].key}-${rowIndex}`}
                    className="exam-print-empty-cell"
                  />
                )
              }

              const subjectLabel = formatPrintPaperLabel(
                cell.subjectName,
                cell.subjectCode,
                cell.paperLabel,
                subjectLabelMode,
              )
              const palette = subjectPrintStyle(cell.subjectName)
              const duration = formatDurationMinutesShort(cell.durationMinutes)
              const rowSpan = cell.rowSpan
              const showTime = rowSpan >= 3
              const showRoom = rowSpan >= 4 && cell.roomName.trim()

              return (
                <td
                  key={cell.paperId}
                  rowSpan={rowSpan}
                  className="exam-print-exam-cell"
                  style={{
                    backgroundColor: palette.bg,
                    borderColor: palette.border,
                    color: palette.text,
                  }}
                >
                  <div className="exam-print-exam-cell-inner">
                    <strong>{subjectLabel}</strong>
                    <span>
                      {rowSpan >= 2
                        ? formatDurationMinutes(cell.durationMinutes)
                        : duration}
                    </span>
                    {showTime ? (
                      <span className="exam-print-exam-range">
                        {cell.startTime.slice(0, 5)}–
                        {endTimeLabel(cell.startTime, cell.durationMinutes)}
                      </span>
                    ) : null}
                    {showRoom ? <span>{cell.roomName.trim()}</span> : null}
                  </div>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PrintGradeGrid({
  examDays,
  gradeDrafts,
  subjectLabelMode,
  dailyStartTime,
  dailyEndTime,
}: {
  examDays: string[]
  gradeDrafts: ExamTimetableDraft[]
  subjectLabelMode: ExamPrintSubjectLabelMode
  dailyStartTime?: string | null
  dailyEndTime?: string | null
}) {
  const timeSlots = useMemo(
    () => buildCompactTimeSlots(gradeDrafts, dailyStartTime, dailyEndTime),
    [gradeDrafts, dailyStartTime, dailyEndTime],
  )

  const placedBlocks = useMemo(
    () => placeExamBlocks(gradeDrafts, examDays, timeSlots),
    [gradeDrafts, examDays, timeSlots],
  )

  const columnHeaders = examDays.map((day) => {
    const { weekday, label } = formatExamDayHeader(day)
    return { key: day, line1: weekday, line2: label }
  })

  const tableRows = useMemo(
    () =>
      buildTableRows(
        examDays.length,
        timeSlots,
        placedBlocks.map((block) => ({
          columnIndex: block.dayIndex,
          rowStart: block.rowStart,
          rowSpan: block.rowSpan,
          paperId: block.draft.paperId,
          subjectName: block.draft.subjectName ?? block.draft.subject,
          subjectCode: block.draft.subjectCode,
          paperLabel: block.draft.paperLabel,
          startTime: block.draft.startTime,
          durationMinutes: block.draft.durationMinutes,
          roomName: block.draft.roomName,
        })),
      ),
    [examDays.length, timeSlots, placedBlocks],
  )

  const legend = useMemo(
    () => buildSubjectLegend(gradeDrafts),
    [gradeDrafts],
  )

  return (
    <>
      <PrintTimetableTable
        columnHeaders={columnHeaders}
        timeSlots={timeSlots}
        tableRows={tableRows}
        subjectLabelMode={subjectLabelMode}
      />
      {subjectLabelMode === 'code' ? <PrintSubjectLegend entries={legend} /> : null}
    </>
  )
}

function PrintSchoolDayGrid({
  day,
  gradeColumns,
  drafts,
  subjectLabelMode,
  dailyStartTime,
  dailyEndTime,
}: {
  day: string
  gradeColumns: ExamGradeColumn[]
  drafts: ExamTimetableDraft[]
  subjectLabelMode: ExamPrintSubjectLabelMode
  dailyStartTime?: string | null
  dailyEndTime?: string | null
}) {
  const dayDrafts = useMemo(
    () => drafts.filter((row) => row.date === day && isCompleteDraft(row)),
    [drafts, day],
  )

  const timeSlots = useMemo(
    () => buildCompactTimeSlots(dayDrafts, dailyStartTime, dailyEndTime),
    [dayDrafts, dailyStartTime, dailyEndTime],
  )

  const placedBlocks = useMemo(
    () => placeExamBlocksByGrade(drafts, gradeColumns, day, timeSlots),
    [drafts, gradeColumns, day, timeSlots],
  )

  const columnHeaders = gradeColumns.map((grade) => ({
    key: grade.id,
    line1: grade.shortLabel,
    line2: grade.displayName,
  }))

  const tableRows = useMemo(
    () =>
      buildTableRows(
        gradeColumns.length,
        timeSlots,
        placedBlocks.map((block) => ({
          columnIndex: block.gradeIndex,
          rowStart: block.rowStart,
          rowSpan: block.rowSpan,
          paperId: block.draft.paperId,
          subjectName: block.draft.subjectName ?? block.draft.subject,
          subjectCode: block.draft.subjectCode,
          paperLabel: block.draft.paperLabel,
          startTime: block.draft.startTime,
          durationMinutes: block.draft.durationMinutes,
          roomName: block.draft.roomName,
        })),
      ),
    [gradeColumns.length, timeSlots, placedBlocks],
  )

  const legend = useMemo(() => buildSubjectLegend(dayDrafts), [dayDrafts])

  return (
    <>
      <PrintTimetableTable
        columnHeaders={columnHeaders}
        timeSlots={timeSlots}
        tableRows={tableRows}
        subjectLabelMode={subjectLabelMode}
      />
      {subjectLabelMode === 'code' ? <PrintSubjectLegend entries={legend} /> : null}
    </>
  )
}

export function ExamTimetablePrintView({
  sessionName,
  sessionMeta,
  periodLabel,
  grades,
  drafts,
  isSchoolView,
  orientation = 'auto',
  subjectLabelMode = 'full',
  dailyStartTime,
  dailyEndTime,
}: ExamTimetablePrintViewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const gradeColumns = useMemo(() => buildGradeColumns(grades), [grades])

  const schoolDaySections = useMemo(() => {
    if (!isSchoolView) return []
    return buildScheduledExamDays(drafts).map((day) => ({
      day,
      examCount: drafts.filter((row) => row.date === day && isCompleteDraft(row)).length,
    }))
  }, [drafts, isSchoolView])

  const gradeSections = useMemo(() => {
    if (isSchoolView) return []

    return gradeColumns
      .map((grade) => {
        const gradeDrafts = drafts.filter(
          (row) => row.gradeId === grade.id && isCompleteDraft(row),
        )
        return {
          grade,
          examDays: buildScheduledExamDays(gradeDrafts),
          gradeDrafts,
          examCount: gradeDrafts.length,
        }
      })
      .filter((section) => section.examCount > 0)
  }, [drafts, gradeColumns, isSchoolView])

  const totalScheduled = drafts.filter(isCompleteDraft).length
  const scheduledDayCount = buildScheduledExamDays(drafts).length
  const maxColumns = isSchoolView
    ? gradeColumns.length
    : gradeSections.reduce((max, s) => Math.max(max, s.examDays.length), 0)
  const resolvedOrientation =
    orientation === 'auto'
      ? maxColumns >= 3
        ? 'landscape'
        : 'portrait'
      : orientation
  const singleGradeLabel =
    !isSchoolView && gradeSections.length === 1
      ? gradeSections[0].grade.displayName
      : null

  if (!mounted) return null

  return createPortal(
    <div
      data-exam-timetable-print-root
      className="exam-print-root"
      data-exam-print-orientation={resolvedOrientation}
    >
      <header className="exam-print-header">
        <div className="exam-print-header-row exam-print-header-row--nav">
          <span className="exam-print-kicker">Exam timetable</span>
          {isSchoolView ? (
            <span className="exam-print-badge">All grades</span>
          ) : singleGradeLabel ? (
            <span className="exam-print-badge">{singleGradeLabel}</span>
          ) : null}
        </div>

        <h1 className="exam-print-title">{sessionName}</h1>

        <div className="exam-print-context-strip">
          {sessionMeta ? (
            <span className="exam-print-chip">{sessionMeta}</span>
          ) : null}
          <span className="exam-print-chip">{periodLabel}</span>
        </div>

        <div className="exam-print-stats">
          <div className="exam-print-stat">
            <strong>{totalScheduled}</strong>
            <span>Papers</span>
          </div>
          <div className="exam-print-stat">
            <strong>{gradeColumns.length}</strong>
            <span>Grade{gradeColumns.length === 1 ? '' : 's'}</span>
          </div>
          <div className="exam-print-stat">
            <strong>{scheduledDayCount}</strong>
            <span>Day{scheduledDayCount === 1 ? '' : 's'}</span>
          </div>
        </div>
      </header>

      {totalScheduled === 0 ? (
        <p className="exam-print-empty">No scheduled exams to print.</p>
      ) : isSchoolView ? (
        schoolDaySections.map(({ day, examCount }) => {
          const { weekday, label } = formatExamDayHeader(day)
          return (
            <section key={day} className="exam-print-section">
              <div className="exam-print-section-head">
                <h2>
                  {weekday} · {label}
                </h2>
                <span>
                  {examCount} exam{examCount === 1 ? '' : 's'}
                </span>
              </div>
            <PrintSchoolDayGrid
              day={day}
              gradeColumns={gradeColumns}
              drafts={drafts}
              subjectLabelMode={subjectLabelMode}
              dailyStartTime={dailyStartTime}
              dailyEndTime={dailyEndTime}
            />
            </section>
          )
        })
      ) : (
        gradeSections.map(({ grade, examDays, gradeDrafts, examCount }) => (
          <section key={grade.id} className="exam-print-section">
            {gradeSections.length > 1 ? (
              <div className="exam-print-section-head">
                <h2>{grade.displayName}</h2>
                <span>
                  {examCount} exam{examCount === 1 ? '' : 's'} · {examDays.length} day
                  {examDays.length === 1 ? '' : 's'}
                </span>
              </div>
            ) : null}
            <PrintGradeGrid
              examDays={examDays}
              gradeDrafts={gradeDrafts}
              subjectLabelMode={subjectLabelMode}
              dailyStartTime={dailyStartTime}
              dailyEndTime={dailyEndTime}
            />
          </section>
        ))
      )}
    </div>,
    document.body,
  )
}
