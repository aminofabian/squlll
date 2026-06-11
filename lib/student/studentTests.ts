import { chatGraphqlFetch } from '@/lib/chat/graphql'
import type { StudentTestApi, StudentTestCounts, StudentTestDetail, StudentTestSubmissionApi } from './types'

const GET_MY_TESTS = `
  query GetMyTests {
    getMyTests {
      id
      title
      date
      startTime
      endTime
      duration
      effectiveDuration
      totalMarks
      status
      instructions
      resourceUrl
      subject { id name }
      teacher { id name }
      mySubmission {
        id
        submitted_at
        started_at
        file_url
        comments
        submission_text
        grade
        feedback
        graded_at
      }
    }
  }
`

const GET_MY_TEST_COUNTS = `
  query GetMyTestCounts {
    getMyTestCounts {
      total
      pending
      active
      completed
    }
  }
`

const GET_MY_UPCOMING_TESTS = `
  query GetMyUpcomingTests {
    getMyUpcomingTests {
      id
      title
      date
      startTime
      duration
      effectiveDuration
      totalMarks
      status
      subject { id name }
      teacher { id name }
    }
  }
`

export async function fetchMyTests(subdomain: string): Promise<StudentTestApi[]> {
  const data = await chatGraphqlFetch<{ getMyTests: StudentTestApi[] }>(
    GET_MY_TESTS,
    {},
    subdomain,
  )
  return data.getMyTests ?? []
}

export async function fetchMyTestCounts(
  subdomain: string,
): Promise<StudentTestCounts> {
  const data = await chatGraphqlFetch<{ getMyTestCounts: StudentTestCounts }>(
    GET_MY_TEST_COUNTS,
    {},
    subdomain,
  )
  return (
    data.getMyTestCounts ?? {
      total: 0,
      pending: 0,
      active: 0,
      completed: 0,
    }
  )
}

export async function fetchMyUpcomingTests(
  subdomain: string,
): Promise<StudentTestApi[]> {
  const data = await chatGraphqlFetch<{ getMyUpcomingTests: StudentTestApi[] }>(
    GET_MY_UPCOMING_TESTS,
    {},
    subdomain,
  )
  return data.getMyUpcomingTests ?? []
}

const GET_MY_TEST_BY_ID = `
  query GetMyTestById($id: ID!) {
    getMyTestById(id: $id) {
      id
      title
      date
      startTime
      endTime
      duration
      effectiveDuration
      totalMarks
      status
      instructions
      resourceUrl
      subject { id name }
      teacher { id name }
      referenceMaterials { id fileUrl fileType fileSize }
      questions { id text type marks order }
    }
  }
`

export async function fetchMyTestById(
  subdomain: string,
  testId: string,
): Promise<StudentTestDetail> {
  const data = await chatGraphqlFetch<{ getMyTestById: StudentTestDetail }>(
    GET_MY_TEST_BY_ID,
    { id: testId },
    subdomain,
  )
  return data.getMyTestById
}

const START_MY_TEST = `
  mutation StartMyTest($input: StartMyTestInput!) {
    startMyTest(input: $input) {
      id
      started_at
    }
  }
`

const SUBMIT_MY_TEST = `
  mutation SubmitMyTest($input: SubmitMyTestInput!) {
    submitMyTest(input: $input) {
      id
      test_id
      submitted_at
      started_at
      file_url
      comments
      submission_text
    }
  }
`

export async function startMyTest(
  subdomain: string,
  testId: string,
): Promise<{ id: string; started_at?: string | null }> {
  const data = await chatGraphqlFetch<{
    startMyTest: { id: string; started_at?: string | null }
  }>(START_MY_TEST, { input: { testId } }, subdomain)
  return data.startMyTest
}

export async function submitMyTest(
  subdomain: string,
  input: {
    testId: string
    submissionText?: string
    fileUrl?: string
    comments?: string
  },
): Promise<StudentTestSubmissionApi> {
  const data = await chatGraphqlFetch<{ submitMyTest: StudentTestSubmissionApi }>(
    SUBMIT_MY_TEST,
    { input: { testId: input.testId, submissionText: input.submissionText, fileUrl: input.fileUrl, comments: input.comments } },
    subdomain,
  )
  return data.submitMyTest
}

export function filterScheduledTests(tests: StudentTestApi[]): StudentTestApi[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return tests
    .filter(
      (test) =>
        (test.status === 'pending' || test.status === 'active') &&
        new Date(test.date) >= today,
    )
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime() ||
        a.startTime.localeCompare(b.startTime),
    )
}

export function groupTestsByDate(
  tests: StudentTestApi[],
): { date: string; tests: StudentTestApi[] }[] {
  const map = new Map<string, StudentTestApi[]>()
  for (const test of tests) {
    const key = test.date.slice(0, 10)
    const list = map.get(key) ?? []
    list.push(test)
    map.set(key, list)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, grouped]) => ({ date, tests: grouped }))
}
