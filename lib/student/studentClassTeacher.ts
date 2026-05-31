import { chatGraphqlFetch } from '@/lib/chat/graphql'
import type { ClassTeacherInfo } from './types'

const GET_GRADE_LEVEL_CLASS_TEACHER = `
  query GetGradeLevelClassTeacher($gradeLevelId: String!) {
    getGradeLevelClassTeacher(gradeLevelId: $gradeLevelId) {
      id
      teacher {
        id
        fullName
        email
        user { id }
      }
      gradeLevel {
        id
        gradeLevel { name }
      }
    }
  }
`

export async function fetchClassTeacherForGrade(
  subdomain: string,
  gradeLevelId: string,
): Promise<ClassTeacherInfo | null> {
  const data = await chatGraphqlFetch<{
    getGradeLevelClassTeacher: {
      teacher: {
        id: string
        fullName: string
        email: string
        user?: { id: string } | null
      }
      gradeLevel?: {
        gradeLevel?: { name: string } | null
      } | null
    } | null
  }>(GET_GRADE_LEVEL_CLASS_TEACHER, { gradeLevelId }, subdomain)

  const assignment = data.getGradeLevelClassTeacher
  if (!assignment?.teacher?.user?.id) return null

  return {
    teacherId: assignment.teacher.id,
    teacherUserId: assignment.teacher.user.id,
    fullName: assignment.teacher.fullName,
    email: assignment.teacher.email,
    gradeName: assignment.gradeLevel?.gradeLevel?.name ?? 'Your class',
  }
}
