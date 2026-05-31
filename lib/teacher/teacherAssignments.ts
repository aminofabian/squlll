import { graphqlClient } from '@/lib/graphql-client'

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

export async function fetchMyAssignments(): Promise<TeacherAssignment[]> {
  const data = await graphqlClient.request<{ myAssignMents: TeacherAssignment[] }>(
    GET_MY_ASSIGNMENTS,
  )
  return data.myAssignMents ?? []
}
