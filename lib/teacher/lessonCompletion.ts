import { graphqlFetch } from '@/app/school/[subdomain]/teacher/utils/graphqlFetch'

export interface LessonCompletionItem {
  timetableEntryId: string
  completedAt: string
}

const GET_MY_LESSON_COMPLETIONS = `
  query GetMyLessonCompletions($termId: ID!, $weekStartDate: String) {
    getMyLessonCompletions(termId: $termId, weekStartDate: $weekStartDate) {
      weekStartDate
      completions {
        timetableEntryId
        completedAt
      }
    }
  }
`

const SET_LESSON_COMPLETION = `
  mutation SetLessonCompletion($input: SetLessonCompletionInput!) {
    setLessonCompletion(input: $input) {
      timetableEntryId
      weekStartDate
      completed
      completedAt
    }
  }
`

export async function fetchMyLessonCompletions(
  subdomain: string,
  termId: string,
  weekStartDate?: string,
): Promise<string[]> {
  const result = await graphqlFetch<{
    getMyLessonCompletions: {
      completions: LessonCompletionItem[]
    }
  }>(GET_MY_LESSON_COMPLETIONS, { termId, weekStartDate }, subdomain)

  return (
    result?.getMyLessonCompletions?.completions?.map(
      (c) => c.timetableEntryId,
    ) ?? []
  )
}

export async function setLessonCompletion(
  subdomain: string,
  input: {
    timetableEntryId: string
    termId: string
    weekStartDate?: string
    completed: boolean
  },
): Promise<void> {
  await graphqlFetch<{ setLessonCompletion: unknown }>(
    SET_LESSON_COMPLETION,
    { input },
    subdomain,
  )
}
