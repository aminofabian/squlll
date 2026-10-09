import { chatGraphqlFetch } from '@/lib/chat/graphql'

/**
 * Reports overview data.
 *
 * Results, rankings and report cards are generated per exam session, so the
 * Reports page is driven by the exam-session list. It only reads the summary
 * fields needed to render the overview — the interactive results / report-card
 * views live in the Exams module at `/exams/<sessionId>`.
 */
export interface ReportExamSession {
  id: string
  name: string
  academicYear: string
  term: number
  type: string
  status: string
  publicationState: string
  resultsPublished: boolean
  startDate: string | null
  endDate: string | null
  gradesCount: number
  subjectsCount: number
  registeredCandidatesCount: number | null
}

export interface ReportExamSessionFilter {
  academicYear?: string
}

const EXAM_SESSIONS_FOR_REPORTS = `
  query ExamSessions($filter: ExamSessionFilterInput) {
    examSessions(filter: $filter) {
      id
      name
      academicYear
      term
      type
      status
      publicationState
      resultsPublished
      startDate
      endDate
      gradesCount
      subjectsCount
      registeredCandidatesCount
    }
  }
`

export async function fetchReportExamSessions(
  subdomain: string,
  academicYear?: string,
): Promise<ReportExamSession[]> {
  const filter: ReportExamSessionFilter = {}
  if (academicYear) filter.academicYear = academicYear

  const data = await chatGraphqlFetch<{ examSessions: ReportExamSession[] }>(
    EXAM_SESSIONS_FOR_REPORTS,
    { filter: Object.keys(filter).length ? filter : null },
    subdomain,
  )

  return data.examSessions ?? []
}

/** A single subject line on a student's report card. */
export interface ReportSubjectRow {
  subjectId: string
  subjectName: string
  grade: string
  percentage: number
  average: number
  totalScore: number
  maxPossibleScore: number
  assessmentsCount: number
}

/** Per-term performance summary on a student's report card. */
export interface ReportTermRow {
  term: number
  academicYear: string
  grade: string
  percentage: number
  average: number
  totalScore: number
  maxPossibleScore: number
}

/** A student's consolidated report card for an academic year. */
export interface StudentReportCard {
  admissionNumber: string
  studentName: string
  gradeLevel: string
  overallAverage: number
  overallGrade: string
  totalAssessments: number
  allSubjects: ReportSubjectRow[]
  termPerformances: ReportTermRow[]
}

/** Minimal student record for the report-card picker. */
export interface ReportStudent {
  id: string
  admission_number: string
  user: { id: string; name: string } | null
}

const STUDENT_REPORT_CARD_QUERY = `
  query StudentReportCard($academicYear: String!, $studentId: String!) {
    studentReportCard(academicYear: $academicYear, studentId: $studentId) {
      admissionNumber
      studentName
      gradeLevel
      overallAverage
      overallGrade
      totalAssessments
      allSubjects {
        subjectId
        subjectName
        grade
        percentage
        average
        totalScore
        maxPossibleScore
        assessmentsCount
      }
      termPerformances {
        term
        academicYear
        grade
        percentage
        average
        totalScore
        maxPossibleScore
      }
    }
  }
`

const REPORT_STUDENTS_BY_GRADE_QUERY = `
  query ReportStudentsByGrade($gradeId: String!) {
    getStudentsByGrade(gradeId: $gradeId) {
      id
      admission_number
      user {
        id
        name
      }
    }
  }
`

/** Fetch a student's report card for the given academic year. */
export async function fetchStudentReportCard(
  subdomain: string,
  academicYear: string,
  studentId: string,
): Promise<StudentReportCard | null> {
  const data = await chatGraphqlFetch<{
    studentReportCard: StudentReportCard | null
  }>(STUDENT_REPORT_CARD_QUERY, { academicYear, studentId }, subdomain)
  return data.studentReportCard ?? null
}

/** Students in a grade, used to pick whose report card to view. */
export async function fetchReportStudentsByGrade(
  subdomain: string,
  gradeId: string,
): Promise<ReportStudent[]> {
  const data = await chatGraphqlFetch<{ getStudentsByGrade: ReportStudent[] }>(
    REPORT_STUDENTS_BY_GRADE_QUERY,
    { gradeId },
    subdomain,
  )
  return data.getStudentsByGrade ?? []
}
