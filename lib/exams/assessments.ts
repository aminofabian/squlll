import { chatGraphqlFetch } from '@/lib/chat/graphql'
import type { AssessType } from '@/lib/hooks/useTeacherActivity'

export interface AssessmentRecord {
  id: string
  title: string
  type: AssessType
  status: string
  term: number
  academicYear?: string | null
  maxScore?: number | null
  cutoff?: number | null
  description?: string | null
  date?: string | null
  resultsPublished: boolean
  publishDate?: string | null
  createdAt: string
  updatedAt: string
  tenantSubject?: {
    id: string
    subject?: { name: string } | null
  } | null
  tenantGradeLevel?: {
    id: string
    gradeLevel?: { name: string } | null
  } | null
}

export interface CreateAssessmentPayload {
  type: AssessType
  tenantGradeLevelId: string
  tenantSubjectId: string
  term: number
  academicYear: string
  title?: string
  cutoff?: number
  maxScore?: number
  description?: string
  date?: string
}

const ASSESSMENTS_QUERY = `
  query Assessments($filter: AssessmentFilterInput) {
    assessments(filter: $filter) {
      id
      title
      type
      status
      term
      academicYear
      maxScore
      cutoff
      description
      date
      resultsPublished
      publishDate
      createdAt
      updatedAt
      tenantSubject {
        id
        subject {
          name
        }
      }
      tenantGradeLevel {
        id
        gradeLevel {
          name
        }
      }
    }
  }
`

const CREATE_ASSESSMENT = `
  mutation CreateAssessment($input: CreateAssessmentInput!) {
    createAssessment(input: $input) {
      id
      title
      type
      term
      academicYear
      maxScore
      status
    }
  }
`

const CREATE_ASSESSMENTS_BATCH = `
  mutation CreateAssessmentsBatch($inputs: [CreateAssessmentInput!]!) {
    createAssessmentsBatch(inputs: $inputs) {
      id
    }
  }
`

export async function fetchAssessments(
  subdomain: string,
  filter?: {
    type?: AssessType
    tenantGradeLevelId?: string
    tenantSubjectId?: string
    term?: number
    academicYear?: string
  },
): Promise<AssessmentRecord[]> {
  const data = await chatGraphqlFetch<{ assessments: AssessmentRecord[] }>(
    ASSESSMENTS_QUERY,
    { filter: filter ?? null },
    subdomain,
  )
  return data.assessments ?? []
}

function assertAssessType(type: string): asserts type is AssessType {
  if (type !== 'CA' && type !== 'EXAM') {
    throw new Error('Assessment type must be CA or EXAM')
  }
}

export async function createAssessment(
  subdomain: string,
  input: CreateAssessmentPayload,
): Promise<AssessmentRecord> {
  assertAssessType(input.type)
  const data = await chatGraphqlFetch<{ createAssessment: AssessmentRecord }>(
    CREATE_ASSESSMENT,
    { input },
    subdomain,
  )
  return data.createAssessment
}

/** Keep in sync with backend MAX_ASSESSMENTS_BATCH_SIZE (250). */
const MAX_ASSESSMENTS_PER_BATCH = 250

const BATCH_MUTATION_TIMEOUT_MS = 90_000

export async function createAssessmentsBatch(
  subdomain: string,
  inputs: CreateAssessmentPayload[],
  options?: {
    onChunkProgress?: (completed: number, total: number) => void
  },
): Promise<AssessmentRecord[]> {
  if (inputs.length === 0) return []
  for (const input of inputs) {
    assertAssessType(input.type)
  }

  const chunkCount = Math.ceil(inputs.length / MAX_ASSESSMENTS_PER_BATCH)
  const results: AssessmentRecord[] = []
  for (let i = 0; i < inputs.length; i += MAX_ASSESSMENTS_PER_BATCH) {
    const chunkIndex = Math.floor(i / MAX_ASSESSMENTS_PER_BATCH) + 1
    options?.onChunkProgress?.(chunkIndex, chunkCount)

    const chunk = inputs.slice(i, i + MAX_ASSESSMENTS_PER_BATCH)
    const data = await chatGraphqlFetch<{
      createAssessmentsBatch: AssessmentRecord[]
    }>(
      CREATE_ASSESSMENTS_BATCH,
      { inputs: chunk },
      subdomain,
      { timeoutMs: BATCH_MUTATION_TIMEOUT_MS },
    )
    results.push(...(data.createAssessmentsBatch ?? []))
  }
  return results
}
