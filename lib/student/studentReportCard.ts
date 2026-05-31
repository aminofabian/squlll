import { chatGraphqlFetch } from '@/lib/chat/graphql'
import type { StudentReportCardData, StudentRankingData } from './types'

const STUDENT_REPORT_CARD = `
  query StudentReportCard($studentId: String!, $academicYear: String!) {
    studentReportCard(studentId: $studentId, academicYear: $academicYear) {
      studentId
      studentName
      admissionNumber
      gradeLevel
      overallAverage
      overallGrade
      totalAssessments
      termPerformances {
        term
        academicYear
        totalScore
        maxPossibleScore
        percentage
        average
        grade
        totalAssessments
        passedAssessments
        failedAssessments
      }
      allSubjects {
        subjectId
        subjectName
        totalScore
        maxPossibleScore
        percentage
        average
        assessmentsCount
        grade
      }
    }
  }
`

const STUDENT_RANKING = `
  query StudentRanking($studentId: String!, $academicYear: String!, $term: Float!) {
    studentRanking(studentId: $studentId, academicYear: $academicYear, term: $term) {
      rank
      totalStudents
      studentAverage
      classAverage
      topScore
      percentile
    }
  }
`

export async function fetchStudentReportCard(
  subdomain: string,
  studentId: string,
  academicYear: string,
): Promise<StudentReportCardData> {
  const data = await chatGraphqlFetch<{ studentReportCard: StudentReportCardData }>(
    STUDENT_REPORT_CARD,
    { studentId, academicYear },
    subdomain,
  )
  return data.studentReportCard
}

export async function fetchStudentRanking(
  subdomain: string,
  studentId: string,
  academicYear: string,
  term: number,
): Promise<StudentRankingData> {
  const data = await chatGraphqlFetch<{ studentRanking: StudentRankingData }>(
    STUDENT_RANKING,
    { studentId, academicYear, term },
    subdomain,
  )
  return data.studentRanking
}
