import { chatGraphqlFetch } from '@/lib/chat/graphql'

export interface TeacherMarkStudent {
  id: string
  admission_number: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface TeacherMarkAssessment {
  id: string
  title: string
  type: string
  status: string
  term: number
  academicYear: string
  maxScore: number | null
  cutoff: number | null
  date: string | null
  tenantSubjectId: string
  tenantGradeLevelId: string
  resultsPublished: boolean
}

export interface TermAssessmentsWithStudents {
  assessments: TeacherMarkAssessment[]
  students: TeacherMarkStudent[]
}

export interface MarkInput {
  assessmentId: string
  score: number
}

export interface EnterStudentMarksPayload {
  studentId: string
  marks: MarkInput[]
}

export interface AssessmentMark {
  id: string
  score: number
  assessmentId: string
  studentId: string
}

const TERM_ASSESSMENTS_WITH_STUDENTS = `
  query TermAssessmentsWithStudents($term: Int!, $gradeLevelId: String!, $academicYear: String!) {
    termAssessmentsWithStudents(term: $term, gradeLevelId: $gradeLevelId, academicYear: $academicYear) {
      assessments {
        id
        title
        type
        status
        term
        academicYear
        maxScore
        cutoff
        date
        resultsPublished
      }
      students {
        id
        admission_number
        user {
          id
          name
          email
        }
      }
    }
  }
`

const ENTER_STUDENT_MARKS = `
  mutation EnterStudentMarks($inputs: [EnterStudentMarksInput!]!) {
    enterStudentMarks(inputs: $inputs) {
      id
      score
      assessmentId
      studentId
    }
  }
`

const UPDATE_STUDENT_MARKS = `
  mutation UpdateStudentMarks($inputs: [EnterStudentMarksInput!]!) {
    updateStudentMarks(inputs: $inputs) {
      id
      score
      assessmentId
      studentId
    }
  }
`

const MARKS_STATS = `
  query MarksStats($term: Int!, $gradeLevelId: String!, $subjectId: String!, $academicYear: String!) {
    marksStats(term: $term, gradeLevelId: $gradeLevelId, subjectId: $subjectId, academicYear: $academicYear) {
      mean
      highest
      lowest
      entered
      total
    }
  }
`

export async function fetchTermAssessmentsWithStudents(
  subdomain: string,
  term: number,
  gradeLevelId: string,
  academicYear: string,
): Promise<TermAssessmentsWithStudents> {
  const data = await chatGraphqlFetch<{
    termAssessmentsWithStudents: TermAssessmentsWithStudents
  }>(TERM_ASSESSMENTS_WITH_STUDENTS, { term, gradeLevelId, academicYear }, subdomain)
  return data.termAssessmentsWithStudents
}

export async function enterStudentMarks(
  subdomain: string,
  inputs: EnterStudentMarksPayload[],
): Promise<AssessmentMark[]> {
  const data = await chatGraphqlFetch<{
    enterStudentMarks: AssessmentMark[]
  }>(ENTER_STUDENT_MARKS, { inputs }, subdomain)
  return data.enterStudentMarks
}

export async function updateStudentMarks(
  subdomain: string,
  inputs: EnterStudentMarksPayload[],
): Promise<AssessmentMark[]> {
  const data = await chatGraphqlFetch<{
    updateStudentMarks: AssessmentMark[]
  }>(UPDATE_STUDENT_MARKS, { inputs }, subdomain)
  return data.updateStudentMarks
}

export async function fetchMarksStats(
  subdomain: string,
  term: number,
  gradeLevelId: string,
  subjectId: string,
  academicYear: string,
): Promise<{ mean: string; highest: number; lowest: number; entered: number; total: number }> {
  const data = await chatGraphqlFetch<{
    marksStats: { mean: string; highest: number; lowest: number; entered: number; total: number }
  }>(MARKS_STATS, { term, gradeLevelId, subjectId, academicYear }, subdomain)
  return data.marksStats
}
