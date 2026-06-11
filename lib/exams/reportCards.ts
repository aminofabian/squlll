import { chatGraphqlFetch } from '@/lib/chat/graphql'

const SUGGEST_COMMENT = `
  query SuggestReportCardComment($studentId: String!, $academicYear: String!, $term: Float) {
    suggestReportCardComment(studentId: $studentId, academicYear: $academicYear, term: $term)
  }
`

const GENERATE_PDF = `
  mutation GenerateReportCardPdf(
    $studentId: String!
    $academicYear: String!
    $term: Float
    $teacherComment: String
  ) {
    generateReportCardPdf(
      studentId: $studentId
      academicYear: $academicYear
      term: $term
      teacherComment: $teacherComment
    )
  }
`

const GENERATE_BULK_PDF = `
  mutation GenerateBulkReportCardsPdf(
    $gradeLevelId: String!
    $academicYear: String!
    $term: Float
  ) {
    generateBulkReportCardsPdf(
      gradeLevelId: $gradeLevelId
      academicYear: $academicYear
      term: $term
    ) {
      totalStudents
      generatedCount
      skippedStudentIds
      pdfDataUrl
    }
  }
`

export interface BulkReportCardResult {
  totalStudents: number
  generatedCount: number
  skippedStudentIds: string[]
  pdfDataUrl: string
}

export async function suggestReportCardComment(
  subdomain: string,
  studentId: string,
  academicYear: string,
  term?: number,
): Promise<string> {
  const data = await chatGraphqlFetch<{
    suggestReportCardComment: string
  }>(SUGGEST_COMMENT, { studentId, academicYear, term: term ?? null }, subdomain)
  return data.suggestReportCardComment
}

export async function generateReportCardPdf(
  subdomain: string,
  params: {
    studentId: string
    academicYear: string
    term?: number
    teacherComment?: string
  },
): Promise<string> {
  const data = await chatGraphqlFetch<{ generateReportCardPdf: string }>(
    GENERATE_PDF,
    {
      studentId: params.studentId,
      academicYear: params.academicYear,
      term: params.term ?? null,
      teacherComment: params.teacherComment ?? null,
    },
    subdomain,
  )
  return data.generateReportCardPdf
}

export async function generateBulkReportCardsPdf(
  subdomain: string,
  params: {
    gradeLevelId: string
    academicYear: string
    term?: number
  },
): Promise<BulkReportCardResult> {
  const data = await chatGraphqlFetch<{
    generateBulkReportCardsPdf: BulkReportCardResult
  }>(
    GENERATE_BULK_PDF,
    {
      gradeLevelId: params.gradeLevelId,
      academicYear: params.academicYear,
      term: params.term ?? null,
    },
    subdomain,
  )
  return data.generateBulkReportCardsPdf
}

const GENERATE_SESSION_PDF = `
  mutation GenerateSessionReportCardsPdf($sessionId: String!, $tenantGradeLevelId: String) {
    generateSessionReportCardsPdf(
      sessionId: $sessionId
      tenantGradeLevelId: $tenantGradeLevelId
    ) {
      totalStudents
      generatedCount
      skippedStudentIds
      pdfDataUrl
    }
  }
`

export async function generateSessionReportCardsPdf(
  subdomain: string,
  params: { sessionId: string; tenantGradeLevelId?: string },
): Promise<BulkReportCardResult> {
  const data = await chatGraphqlFetch<{
    generateSessionReportCardsPdf: BulkReportCardResult
  }>(
    GENERATE_SESSION_PDF,
    {
      sessionId: params.sessionId,
      tenantGradeLevelId: params.tenantGradeLevelId ?? null,
    },
    subdomain,
  )
  return data.generateSessionReportCardsPdf
}

export function downloadPdfDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
