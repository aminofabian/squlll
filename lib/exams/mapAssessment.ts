import type { AssessmentRecord } from './assessments'

export interface ExamListItem {
  id: string
  title: string
  description?: string | null
  subjectName: string
  className: string
  gradeLevelId?: string | null
  examType: 'CA' | 'EXAM'
  term: number
  termLabel: string
  academicYear?: string | null
  totalMarks?: number | null
  status: string
  resultsPublished: boolean
  createdAt: string
  displayDate: string
}

export function termNumberToLabel(term: number): string {
  return `Term ${term}`
}

export function mapAssessmentToExamListItem(
  assessment: AssessmentRecord,
): ExamListItem {
  return {
    id: assessment.id,
    title: assessment.title,
    description: assessment.description,
    subjectName: assessment.tenantSubject?.subject?.name ?? 'Unknown subject',
    className: assessment.tenantGradeLevel?.gradeLevel?.name ?? 'Unknown class',
    gradeLevelId: assessment.tenantGradeLevel?.id,
    examType: assessment.type,
    term: assessment.term,
    termLabel: termNumberToLabel(assessment.term),
    academicYear: assessment.academicYear,
    totalMarks: assessment.maxScore,
    status: assessment.status,
    resultsPublished: assessment.resultsPublished,
    createdAt: assessment.createdAt,
    displayDate: assessment.date ?? assessment.createdAt,
  }
}
