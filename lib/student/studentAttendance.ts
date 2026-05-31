import { chatGraphqlFetch } from '@/lib/chat/graphql'

export interface StudentAttendanceRecord {
  date: string
  status: string
  remark?: string | null
}

export interface StudentAttendanceSummary {
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  suspendedDays: number
  percentage: number
  records: StudentAttendanceRecord[]
}

const MY_ATTENDANCE_SUMMARY = `
  query GetMyAttendanceSummary {
    getMyAttendanceSummary {
      totalDays
      presentDays
      absentDays
      lateDays
      suspendedDays
      percentage
      records {
        date
        status
        remark
      }
    }
  }
`

export async function fetchMyAttendanceSummary(
  subdomain: string,
): Promise<StudentAttendanceSummary> {
  const data = await chatGraphqlFetch<{
    getMyAttendanceSummary: StudentAttendanceSummary
  }>(MY_ATTENDANCE_SUMMARY, {}, subdomain)
  return data.getMyAttendanceSummary
}
