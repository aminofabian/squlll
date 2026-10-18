import { graphqlClient } from '@/lib/graphql-client'
import { graphqlFetch } from '@/app/school/[subdomain]/teacher/utils/graphqlFetch'

export interface TeacherAssignment {
  id: string
  title: string
  subject: {
    id: string
    subject: { name: string }
  }
  gradeLevels: Array<{
    id: string
    gradeLevel: { name: string }
  }>
  date: string
  startTime: string | null
  duration: number
  totalMarks: number
  status: 'draft' | 'published' | 'completed'
  submissionCount: number
  gradedCount: number
  questions: Array<{
    id: string
    text: string
    marks: number
    type: string
    options: Array<{ id: string; text: string; isCorrect: boolean }>
  }>
  referenceMaterials: Array<{
    id: string
    fileUrl: string
    fileType: string
    fileSize: number
  }>
  createdAt: string
  updatedAt: string
}

const GET_MY_ASSIGNMENTS = `
  query MyAssignMents {
    myAssignMents {
      id
      title
      subject { id subject { name } }
      gradeLevels { id gradeLevel { name } }
      date
      startTime
      duration
      totalMarks
      status
      submissionCount
      gradedCount
      questions {
        id
        text
        marks
        type
        options { id text isCorrect }
      }
      referenceMaterials {
        id
        fileUrl
        fileType
        fileSize
      }
      createdAt
      updatedAt
    }
  }
`

/**
 * The assignment list is backed by teacher tests, whose lifecycle is
 * `pending | active | completed`. For this screen "pending" means it has been
 * published to learners and not yet completed, so it is shown as published.
 */
function normalizeStatus(status: string): TeacherAssignment['status'] {
  if (status === 'completed') return 'completed'
  if (status === 'draft') return 'draft'
  return 'published'
}

export async function fetchMyAssignments(): Promise<TeacherAssignment[]> {
  const data = await graphqlClient.request<{ myAssignMents: TeacherAssignment[] }>(
    GET_MY_ASSIGNMENTS,
  )
  return (data.myAssignMents ?? []).map((assignment) => ({
    ...assignment,
    status: normalizeStatus(String(assignment.status)),
  }))
}

export interface CreateAssignmentInput {
  title: string
  tenantSubjectId: string
  tenantGradeLevelIds: string[]
  /** Full ISO timestamp for the due date/time. */
  date: string
  startTime: string
  duration: number
  totalMarks: number
  instructions?: string
}

const CREATE_ASSIGNMENT = `
  mutation CreateAssignment($input: CreateTestInput!) {
    createTest(createTestInput: $input) {
      id
      title
      status
      date
      gradeLevels {
        id
        gradeLevel {
          name
        }
      }
    }
  }
`

export async function createAssignment(
  subdomain: string,
  input: CreateAssignmentInput,
): Promise<{ id: string; title: string; classCount: number }> {
  const result = await graphqlFetch<{
    createTest: {
      id: string
      title: string
      gradeLevels: Array<{ id: string }>
    }
  }>(CREATE_ASSIGNMENT, { input }, subdomain)

  return {
    id: result.createTest.id,
    title: result.createTest.title,
    classCount: result.createTest.gradeLevels?.length ?? 0,
  }
}
