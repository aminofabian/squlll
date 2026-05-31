import { chatGraphqlFetch } from '@/lib/chat/graphql'

export interface ParentReportCardSubjectScore {
  type: string
  score: number
  maxScore: number
}

export interface ParentReportCardSubject {
  subject: string
  scores: ParentReportCardSubjectScore[]
  total: number
  average: number
}

export interface ParentReportCardData {
  student: {
    name: string
    admissionNumber: string
    grade: string
    stream?: string | null
  }
  term: number
  academicYear: string
  subjects: ParentReportCardSubject[]
  overallAverage: number
  totalSubjects: number
}

const CHILD_REPORT_CARD = `
  query ChildReportCard($studentId: ID!, $term: Float!, $academicYear: String!) {
    childReportCard(studentId: $studentId, term: $term, academicYear: $academicYear) {
      student { name admissionNumber grade stream }
      term
      academicYear
      overallAverage
      totalSubjects
      subjects {
        subject
        total
        average
        scores { type score maxScore }
      }
    }
  }
`

export async function fetchChildReportCard(
  subdomain: string,
  studentId: string,
  term: number,
  academicYear: string,
): Promise<ParentReportCardData> {
  const data = await chatGraphqlFetch<{ childReportCard: ParentReportCardData }>(
    CHILD_REPORT_CARD,
    { studentId, term, academicYear },
    subdomain,
  )
  return data.childReportCard
}
