import { chatGraphqlFetch } from '@/lib/chat/graphql'

export interface ChildAssignmentGrade {
  submissionId: string
  testId: string
  title: string
  subject: string
  grade: number
  maxScore: number
  feedback?: string | null
  gradedAt: string
  teacherName?: string | null
}

const CHILD_ASSIGNMENT_GRADES = `
  query ChildAssignmentGrades($studentId: ID!) {
    childAssignmentGrades(studentId: $studentId) {
      submissionId
      testId
      title
      subject
      grade
      maxScore
      feedback
      gradedAt
      teacherName
    }
  }
`

export async function fetchChildAssignmentGrades(
  subdomain: string,
  studentId: string,
): Promise<ChildAssignmentGrade[]> {
  const data = await chatGraphqlFetch<{
    childAssignmentGrades: ChildAssignmentGrade[]
  }>(CHILD_ASSIGNMENT_GRADES, { studentId }, subdomain)
  return data.childAssignmentGrades ?? []
}
