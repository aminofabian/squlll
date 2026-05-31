import { graphqlClient } from '@/lib/graphql-client'

export interface TeacherTestSubmission {
  id: string
  test_id: string
  submitted_at: string
  submission_text?: string | null
  file_url?: string | null
  comments?: string | null
  grade?: number | null
  feedback?: string | null
  graded_at?: string | null
  student: {
    id: string
    admission_number: string
    user: { id: string; name: string; email: string }
  }
}

const GET_TEST_SUBMISSIONS = `
  query GetTestSubmissions($testId: ID!) {
    getTestSubmissions(testId: $testId) {
      id
      test_id
      submitted_at
      submission_text
      file_url
      comments
      grade
      feedback
      graded_at
      student {
        id
        admission_number
        user { id name email }
      }
    }
  }
`

const GRADE_TEST_SUBMISSION = `
  mutation GradeTestSubmission($input: GradeTestSubmissionInput!) {
    gradeTestSubmission(input: $input) {
      id
      grade
      feedback
      graded_at
    }
  }
`

export async function fetchTestSubmissions(
  testId: string,
): Promise<TeacherTestSubmission[]> {
  const data = await graphqlClient.request<{
    getTestSubmissions: TeacherTestSubmission[]
  }>(GET_TEST_SUBMISSIONS, { testId })
  return data.getTestSubmissions ?? []
}

export async function gradeTestSubmission(input: {
  submissionId: string
  grade: number
  feedback?: string
}): Promise<void> {
  await graphqlClient.request(GRADE_TEST_SUBMISSION, { input })
}
