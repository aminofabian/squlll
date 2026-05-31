import { chatGraphqlFetch } from '@/lib/chat/graphql'
import type { StudentMarkDetail } from './types'

const STUDENT_MARKS = `
  query StudentMarks($studentId: String!, $filter: GetStudentMarksFilterDto) {
    studentMarks(studentId: $studentId, filter: $filter) {
      id
      score
      maxScore
      percentage
      title
      type
      subject
      gradeLevel
      status
      term
      academicYear
      date
      isPassed
      createdAt
    }
  }
`

export async function fetchStudentMarks(
  subdomain: string,
  studentId: string,
  filter?: {
    academicYear?: string
    term?: number
    assessmentType?: string
  },
): Promise<StudentMarkDetail[]> {
  const data = await chatGraphqlFetch<{ studentMarks: StudentMarkDetail[] }>(
    STUDENT_MARKS,
    { studentId, filter: filter ?? null },
    subdomain,
  )
  return data.studentMarks ?? []
}
