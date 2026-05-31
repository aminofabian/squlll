import { chatGraphqlFetch } from '@/lib/chat/graphql'
import type { StudentNoteApi } from './types'

const GET_STUDENT_ACCESSIBLE_NOTES = `
  query GetStudentAccessibleNotes {
    getStudentAccessibleNotes {
      id
      title
      content
      links
      visibility
      is_ai_generated
      created_at
      updated_at
      subject { id name }
      gradeLevel { id name }
      teacher { id name }
    }
  }
`

export async function fetchStudentAccessibleNotes(
  subdomain: string,
): Promise<StudentNoteApi[]> {
  const data = await chatGraphqlFetch<{
    getStudentAccessibleNotes: StudentNoteApi[]
  }>(GET_STUDENT_ACCESSIBLE_NOTES, {}, subdomain)
  return data.getStudentAccessibleNotes ?? []
}
