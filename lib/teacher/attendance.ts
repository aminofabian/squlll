import { graphqlFetch } from '@/app/school/[subdomain]/teacher/utils/graphqlFetch'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'suspended'

export interface AttendanceStudent {
  id: string
  admission_number: string
  gender?: string | null
  isActive?: boolean
  stream?: { id: string; name: string } | null
  user?: { id: string; name: string } | null
}

export interface AttendanceRecord {
  id: string
  studentId: string
  status: AttendanceStatus
}

const GET_STUDENTS_BY_GRADE = `
  query GetStudentsByGrade($gradeId: String!) {
    getStudentsByGrade(gradeId: $gradeId) {
      id
      admission_number
      gender
      isActive
      stream { id name }
      user { id name }
    }
  }
`

const GET_ATTENDANCE_BY_DATE = `
  query GetAttendanceByDate($date: String!, $gradeId: String!) {
    getAttendanceByDate(date: $date, gradeId: $gradeId) {
      id
      studentId
      status
    }
  }
`

const MARK_ATTENDANCE = `
  mutation MarkAttendance($markAttendanceInput: CreateAttendanceInput!) {
    markAttendance(markAttendanceInput: $markAttendanceInput) {
      id
      studentId
      status
      createdAt
    }
  }
`

export async function fetchStudentsByGrade(
  subdomain: string,
  gradeId: string,
): Promise<AttendanceStudent[]> {
  const result = await graphqlFetch<{
    getStudentsByGrade: AttendanceStudent[]
  }>(GET_STUDENTS_BY_GRADE, { gradeId }, subdomain)
  return result.getStudentsByGrade ?? []
}

export async function fetchAttendanceByDate(
  subdomain: string,
  date: string,
  gradeId: string,
): Promise<AttendanceRecord[]> {
  const result = await graphqlFetch<{
    getAttendanceByDate: AttendanceRecord[]
  }>(GET_ATTENDANCE_BY_DATE, { date, gradeId }, subdomain)
  return result.getAttendanceByDate ?? []
}

export async function markAttendance(
  subdomain: string,
  input: {
    date: string
    gradeId: string
    attendanceRecords: Array<{ studentId: string; status: AttendanceStatus }>
  },
): Promise<AttendanceRecord[]> {
  const result = await graphqlFetch<{
    markAttendance: Array<AttendanceRecord & { createdAt?: string }>
  }>(MARK_ATTENDANCE, { markAttendanceInput: input }, subdomain)
  return result.markAttendance ?? []
}
