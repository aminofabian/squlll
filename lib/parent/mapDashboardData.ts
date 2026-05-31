import type { StudentExamSession } from '@/lib/student/types'
import type { TimetableLesson, TimetableSlot } from '@/lib/timetable'
import { percentToGrade } from '@/lib/student/mapExamSessions'

export interface DashboardScheduleItem {
  time: string
  subject: string
  teacher: string
  room: string
  status: string
}

export interface DashboardGradeItem {
  subject: string
  assignment: string
  grade: string
  points: string
  date: string
}

function slotTimeForPeriod(
  timeSlots: TimetableSlot[],
  periodNumber: number,
): string {
  const slot = timeSlots.find((s) => s.periodNumber === periodNumber)
  return slot?.displayTime ?? `Period ${periodNumber}`
}

export function mapLessonsToDashboardSchedule(
  lessons: TimetableLesson[],
  timeSlots: TimetableSlot[],
): DashboardScheduleItem[] {
  return lessons.map((lesson) => ({
    time: slotTimeForPeriod(timeSlots, lesson.periodNumber),
    subject: lesson.subject.name,
    teacher: lesson.teacher.name,
    room: lesson.room || 'TBA',
    status: 'scheduled',
  }))
}

export function mapMarksToDashboardGrades(
  sessions: StudentExamSession[],
): DashboardGradeItem[] {
  const rows = sessions.flatMap((session) =>
    session.results.map((result) => ({
      subject: result.subject,
      assignment: result.title,
      grade: result.grade,
      points: `${result.marksScored}/${result.totalMarks}`,
      date: result.gradedAt
        ? new Date(result.gradedAt).toLocaleDateString()
        : session.academicYear,
      sortKey: result.gradedAt ?? session.sessionKey,
    })),
  )

  return rows
    .sort((a, b) => String(b.sortKey).localeCompare(String(a.sortKey)))
    .slice(0, 6)
    .map(({ subject, assignment, grade, points, date }) => ({
      subject,
      assignment,
      grade,
      points,
      date,
    }))
}

export function averageGpaFromSessions(
  sessions: StudentExamSession[],
): number | null {
  const marks = sessions.flatMap((s) => s.results)
  if (marks.length === 0) return null
  const avg =
    marks.reduce((sum, m) => sum + m.percentage, 0) / marks.length
  return Math.round((avg / 100) * 4 * 10) / 10
}

export function averageScoreFromSessions(
  sessions: StudentExamSession[],
): number | null {
  const marks = sessions.flatMap((s) => s.results)
  if (marks.length === 0) return null
  return Math.round(
    marks.reduce((sum, m) => sum + m.percentage, 0) / marks.length,
  )
}

/** Re-export for dashboard grade letter fallback */
export { percentToGrade }
