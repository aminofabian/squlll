import { chatGraphqlFetch } from '@/lib/chat/graphql'
import type { StudentNoteApi } from '@/lib/student/types'

const CHILD_ACCESSIBLE_NOTES = `
  query ChildAccessibleNotes($studentId: ID!) {
    childAccessibleNotes(studentId: $studentId) {
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

export async function fetchChildAccessibleNotes(
  subdomain: string,
  studentId: string,
): Promise<StudentNoteApi[]> {
  const data = await chatGraphqlFetch<{
    childAccessibleNotes: StudentNoteApi[]
  }>(CHILD_ACCESSIBLE_NOTES, { studentId }, subdomain)
  return data.childAccessibleNotes ?? []
}
