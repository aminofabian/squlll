import type {
  StudentExamResultRow,
  StudentExamSession,
  StudentMarkDetail,
} from './types'

const EXAM_TYPES = new Set(['EXAM', 'TEST', 'CAT', 'QUIZ'])

export function percentToGrade(percentage: number): string {
  if (percentage >= 80) return 'A'
  if (percentage >= 75) return 'A-'
  if (percentage >= 70) return 'B+'
  if (percentage >= 65) return 'B'
  if (percentage >= 60) return 'B-'
  if (percentage >= 55) return 'C+'
  if (percentage >= 50) return 'C'
  if (percentage >= 45) return 'C-'
  if (percentage >= 40) return 'D+'
  return 'D'
}

function toResultRow(mark: StudentMarkDetail): StudentExamResultRow {
  const pct = Math.round(mark.percentage)
  return {
    id: mark.id,
    subject: mark.subject,
    title: mark.title,
    marksScored: mark.score,
    totalMarks: mark.maxScore,
    percentage: pct,
    grade: percentToGrade(pct),
    status: mark.status,
    gradedAt: mark.date ?? mark.createdAt,
    type: mark.type,
  }
}

export function groupMarksIntoSessions(
  marks: StudentMarkDetail[],
): StudentExamSession[] {
  const examMarks = marks.filter((m) => EXAM_TYPES.has(m.type.toUpperCase()))
  const sessionsMap = new Map<string, StudentExamSession>()

  for (const mark of examMarks) {
    const academicYear = mark.academicYear ?? 'Unknown year'
    const sessionKey = `${mark.term}-${academicYear}-${mark.type}`
    const examDate = new Date(mark.date ?? mark.createdAt)

    if (!sessionsMap.has(sessionKey)) {
      sessionsMap.set(sessionKey, {
        sessionKey,
        sessionName: `Term ${mark.term} ${mark.type} — ${academicYear}`,
        examType: mark.type,
        term: mark.term,
        academicYear,
        dateRange: { start: examDate, end: examDate },
        results: [],
      })
    }

    const session = sessionsMap.get(sessionKey)!
    session.results.push(toResultRow(mark))
    if (examDate < session.dateRange.start) session.dateRange.start = examDate
    if (examDate > session.dateRange.end) session.dateRange.end = examDate
  }

  return Array.from(sessionsMap.values()).sort(
    (a, b) => b.dateRange.start.getTime() - a.dateRange.start.getTime(),
  )
}
