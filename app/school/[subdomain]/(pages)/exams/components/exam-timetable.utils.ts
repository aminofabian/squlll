import {
  DEFAULT_EXAM_DAYS_OF_WEEK,
  isoDateToExamDay,
  normalizeExamDaysOfWeek,
} from '@/lib/exams/examDaysOfWeek'
import {
  abbreviateGradeShort,
  formatGradeDisplayName,
  getGradeSortOrder,
} from '@/lib/utils/grade-display'

export const EXAM_SLOT_MINUTES = 30
export const DEFAULT_DAY_START = 7 * 60
export const DEFAULT_DAY_END = 17 * 60

/** Desktop timetable grid density */
export const EXAM_GRID_ROW_HEIGHT = 28
export const EXAM_GRID_TIME_COL = 52
export const EXAM_GRID_GRADE_COL = 96
export const EXAM_GRID_DAY_COL = 112

export function minutesToDisplayTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Human-readable duration, e.g. "2 hours", "30 min", "1 hour 30 min" */
export function formatDurationMinutes(minutes: number | string): string {
  const total = Number(minutes)
  if (Number.isNaN(total) || total <= 0) return ''
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m} min`
  if (m === 0) return h === 1 ? '1 hour' : `${h} hours`
  const hourPart = h === 1 ? '1 hour' : `${h} hours`
  return `${hourPart} ${m} min`
}

/** Compact duration for small grid cells */
export function formatDurationMinutesShort(minutes: number | string): string {
  const total = Number(minutes)
  if (Number.isNaN(total) || total <= 0) return ''
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export type ExamTimetableDraft = {
  paperId: string
  /** Display label used on screen (full subject + paper) */
  subject: string
  subjectName: string
  subjectCode?: string
  paperLabel?: string | null
  grade: string
  gradeId: string
  date: string
  startTime: string
  durationMinutes: string
  roomName: string
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return 0
  return h * 60 + m
}

export function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatExamDayHeader(dateStr: string): {
  weekday: string
  label: string
  year: string
} {
  const d = new Date(`${dateStr}T12:00:00`)
  return {
    weekday: d.toLocaleDateString('en-KE', { weekday: 'short' }).toUpperCase(),
    label: d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }),
    year: d.toLocaleDateString('en-KE', { year: 'numeric' }),
  }
}

export function totalDurationForDay(
  drafts: ExamTimetableDraft[],
  day: string,
): number {
  return drafts
    .filter((d) => d.date === day && isCompleteDraft(d))
    .reduce((sum, d) => sum + Number(d.durationMinutes), 0)
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function isCompleteDraft(row: ExamTimetableDraft): boolean {
  const duration = Number(row.durationMinutes)
  return Boolean(
    row.date && row.startTime && row.durationMinutes && !Number.isNaN(duration) && duration > 0,
  )
}

function collectDaysInRange(
  startIso: string,
  endIso: string,
  allowedDays: Set<number>,
): string[] {
  const days: string[] = []
  const cursor = new Date(`${startIso}T12:00:00`)
  const last = new Date(`${endIso}T12:00:00`)
  if (cursor > last) return days

  while (cursor <= last) {
    const iso = cursor.toISOString().slice(0, 10)
    if (allowedDays.has(isoDateToExamDay(iso))) {
      days.push(iso)
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export function buildExamDays(
  drafts: ExamTimetableDraft[],
  sessionStart?: string | null,
  sessionEnd?: string | null,
  examDaysOfWeek?: number[] | null,
): string[] {
  const allowed = new Set(normalizeExamDaysOfWeek(examDaysOfWeek))
  const dated = drafts.map((d) => d.date).filter(Boolean)

  const start = toDateInput(sessionStart)
  const end = toDateInput(sessionEnd) || start

  const days: string[] = []

  if (start && end) {
    days.push(...collectDaysInRange(start, end, allowed))
  } else if (dated.length > 0) {
    const anchor = [...dated].sort()[0]
    let added = 0
    let offset = 0
    while (added < 14 && offset < 42) {
      const iso = addDays(anchor, offset)
      offset += 1
      if (allowed.has(isoDateToExamDay(iso))) {
        days.push(iso)
        added += 1
      }
    }
  } else {
    const anchor = start || new Date().toISOString().slice(0, 10)
    let added = 0
    let offset = 0
    while (added < 10 && offset < 21) {
      const iso = addDays(anchor, offset)
      offset += 1
      if (allowed.has(isoDateToExamDay(iso))) {
        days.push(iso)
        added += 1
      }
    }
  }

  // Keep already-scheduled papers visible even if on a now-disabled weekday
  for (const d of dated) {
    if (!days.includes(d)) days.push(d)
  }

  return days.sort()
}

export function buildTimeSlots(
  drafts: ExamTimetableDraft[],
  slotMinutes = EXAM_SLOT_MINUTES,
  dailyStartTime?: string | null,
  dailyEndTime?: string | null,
): string[] {
  let min = dailyStartTime ? timeToMinutes(dailyStartTime) : DEFAULT_DAY_START
  let max = dailyEndTime ? timeToMinutes(dailyEndTime) : DEFAULT_DAY_END

  for (const row of drafts) {
    if (!isCompleteDraft(row)) continue
    const start = timeToMinutes(row.startTime)
    const end = start + Number(row.durationMinutes)
    min = Math.min(min, start)
    max = Math.max(max, end)
  }

  min = Math.floor(min / slotMinutes) * slotMinutes
  max = Math.ceil(max / slotMinutes) * slotMinutes

  const slots: string[] = []
  for (let t = min; t < max; t += slotMinutes) {
    slots.push(minutesToTime(t))
  }

  if (slots.length === 0) {
    for (let t = DEFAULT_DAY_START; t < DEFAULT_DAY_END; t += slotMinutes) {
      slots.push(minutesToTime(t))
    }
  }

  return slots
}

export type PlacedExamBlock = {
  draft: ExamTimetableDraft
  dayIndex: number
  rowStart: number
  rowSpan: number
  column: number
  columnCount: number
}

export function placeExamBlocks(
  drafts: ExamTimetableDraft[],
  examDays: string[],
  timeSlots: string[],
): PlacedExamBlock[] {
  const scheduled = drafts.filter(isCompleteDraft)
  const slotMinutes = EXAM_SLOT_MINUTES
  const placed: PlacedExamBlock[] = []

  for (let dayIndex = 0; dayIndex < examDays.length; dayIndex++) {
    const day = examDays[dayIndex]
    const dayExams = scheduled
      .filter((d) => d.date === day)
      .map((draft) => {
        const start = timeToMinutes(draft.startTime)
        const rowStart = Math.max(
          0,
          Math.floor((start - timeToMinutes(timeSlots[0] ?? '07:00')) / slotMinutes),
        )
        const rowSpan = Math.max(
          1,
          Math.ceil(Number(draft.durationMinutes) / slotMinutes),
        )
        return { draft, rowStart, rowSpan, start }
      })
      .sort((a, b) => a.start - b.start)

    for (let i = 0; i < dayExams.length; i++) {
      const current = dayExams[i]
      const overlapping = dayExams.filter((other, idx) => {
        if (idx === i) return false
        const a0 = current.rowStart
        const a1 = current.rowStart + current.rowSpan
        const b0 = other.rowStart
        const b1 = other.rowStart + other.rowSpan
        return a0 < b1 && b0 < a1
      })
      const columnCount = Math.max(1, overlapping.length + 1)
      const column = overlapping.findIndex(
        (o) => o.start < current.start && o.draft.paperId < current.draft.paperId,
      )
      placed.push({
        draft: current.draft,
        dayIndex,
        rowStart: current.rowStart,
        rowSpan: current.rowSpan,
        column: column >= 0 ? column + 1 : 0,
        columnCount,
      })
    }
  }

  return placed
}

export type ExamGradeColumn = {
  id: string
  name: string
  shortLabel: string
  displayName: string
}

export function buildGradeColumns(
  grades: Array<{ id: string; name: string }>,
): ExamGradeColumn[] {
  return [...grades]
    .sort((a, b) => getGradeSortOrder(a.name) - getGradeSortOrder(b.name))
    .map((grade) => ({
      id: grade.id,
      name: grade.name,
      shortLabel: abbreviateGradeShort(grade.name),
      displayName: formatGradeDisplayName(grade.name),
    }))
}

export type PlacedExamGradeBlock = {
  draft: ExamTimetableDraft
  gradeIndex: number
  rowStart: number
  rowSpan: number
  column: number
  columnCount: number
}

export function placeExamBlocksByGrade(
  drafts: ExamTimetableDraft[],
  gradeColumns: ExamGradeColumn[],
  selectedDay: string,
  timeSlots: string[],
): PlacedExamGradeBlock[] {
  if (!selectedDay || gradeColumns.length === 0) return []

  const scheduled = drafts.filter(
    (draft) => isCompleteDraft(draft) && draft.date === selectedDay,
  )
  const slotMinutes = EXAM_SLOT_MINUTES
  const placed: PlacedExamGradeBlock[] = []
  const baseMinutes = timeToMinutes(timeSlots[0] ?? '07:00')

  for (let gradeIndex = 0; gradeIndex < gradeColumns.length; gradeIndex++) {
    const gradeId = gradeColumns[gradeIndex].id
    const gradeExams = scheduled
      .filter((draft) => draft.gradeId === gradeId)
      .map((draft) => {
        const start = timeToMinutes(draft.startTime)
        const rowStart = Math.max(
          0,
          Math.floor((start - baseMinutes) / slotMinutes),
        )
        const rowSpan = Math.max(
          1,
          Math.ceil(Number(draft.durationMinutes) / slotMinutes),
        )
        return { draft, rowStart, rowSpan, start }
      })
      .sort((a, b) => a.start - b.start)

    for (let i = 0; i < gradeExams.length; i++) {
      const current = gradeExams[i]
      const overlapping = gradeExams.filter((other, idx) => {
        if (idx === i) return false
        const a0 = current.rowStart
        const a1 = current.rowStart + current.rowSpan
        const b0 = other.rowStart
        const b1 = other.rowStart + other.rowSpan
        return a0 < b1 && b0 < a1
      })
      const columnCount = Math.max(1, overlapping.length + 1)
      const column = overlapping.findIndex(
        (other) =>
          other.start < current.start &&
          other.draft.paperId < current.draft.paperId,
      )
      placed.push({
        draft: current.draft,
        gradeIndex,
        rowStart: current.rowStart,
        rowSpan: current.rowSpan,
        column: column >= 0 ? column + 1 : 0,
        columnCount,
      })
    }
  }

  return placed
}

export function toDateInput(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

const SUBJECT_ACCENTS = [
  {
    bg: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-100',
    dot: 'bg-blue-500',
  },
  {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-100',
    dot: 'bg-emerald-500',
  },
  {
    bg: 'bg-violet-50 border-violet-200 text-violet-900 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-100',
    dot: 'bg-violet-500',
  },
  {
    bg: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-100',
    dot: 'bg-amber-500',
  },
  {
    bg: 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-100',
    dot: 'bg-rose-500',
  },
  {
    bg: 'bg-cyan-50 border-cyan-200 text-cyan-900 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-100',
    dot: 'bg-cyan-500',
  },
]

export type TimetableClash = {
  paperIdA: string
  paperIdB: string
  message: string
}

function draftsOverlap(a: ExamTimetableDraft, b: ExamTimetableDraft): boolean {
  if (!isCompleteDraft(a) || !isCompleteDraft(b)) return false
  if (a.date !== b.date) return false
  const aStart = timeToMinutes(a.startTime)
  const aEnd = aStart + Number(a.durationMinutes)
  const bStart = timeToMinutes(b.startTime)
  const bEnd = bStart + Number(b.durationMinutes)
  return aStart < bEnd && bStart < aEnd
}

function clashReason(a: ExamTimetableDraft, b: ExamTimetableDraft): string | null {
  if (!draftsOverlap(a, b)) return null

  if (a.gradeId === b.gradeId) {
    return `${a.grade} cannot sit "${a.subject}" and "${b.subject}" at the same time`
  }

  const roomA = a.roomName.trim().toLowerCase()
  const roomB = b.roomName.trim().toLowerCase()
  if (roomA && roomB && roomA === roomB) {
    return `Room "${a.roomName}" is double-booked: "${a.subject}" and "${b.subject}"`
  }

  return null
}

export function findTimetableClashes(
  drafts: ExamTimetableDraft[],
): TimetableClash[] {
  const scheduled = drafts.filter(isCompleteDraft)
  const clashes: TimetableClash[] = []

  for (let i = 0; i < scheduled.length; i++) {
    for (let j = i + 1; j < scheduled.length; j++) {
      const message = clashReason(scheduled[i], scheduled[j])
      if (message) {
        clashes.push({
          paperIdA: scheduled[i].paperId,
          paperIdB: scheduled[j].paperId,
          message,
        })
      }
    }
  }

  return clashes
}

export function getClashingPaperIds(
  drafts: ExamTimetableDraft[],
): Set<string> {
  const ids = new Set<string>()
  for (const clash of findTimetableClashes(drafts)) {
    ids.add(clash.paperIdA)
    ids.add(clash.paperIdB)
  }
  return ids
}

export function getClashesForPaper(
  draft: ExamTimetableDraft,
  allDrafts: ExamTimetableDraft[],
): string[] {
  if (!isCompleteDraft(draft)) return []
  const messages: string[] = []
  const seen = new Set<string>()
  for (const other of allDrafts) {
    if (other.paperId === draft.paperId || !isCompleteDraft(other)) continue
    const reason = clashReason(draft, other)
    if (reason && !seen.has(reason)) {
      seen.add(reason)
      messages.push(reason)
    }
  }
  return messages
}

export function subjectAccent(subject: string) {
  let hash = 0
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash)
  }
  return SUBJECT_ACCENTS[Math.abs(hash) % SUBJECT_ACCENTS.length]
}
