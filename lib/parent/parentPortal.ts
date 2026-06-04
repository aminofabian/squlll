import { chatGraphqlFetch } from '@/lib/chat/graphql'
import type { MyChildApi, ParentFeeBalance } from './types'

const MY_CHILDREN = `
  query MyChildren {
    myChildren {
      id
      name
      admissionNumber
      gender
      relationship
      isPrimary
      phone
      isActive
      grade {
        id
        name
        shortName
        gradeLevel {
          name
        }
      }
    }
  }
`

const CHILD_FEE_BALANCE = `
  query ChildFeeBalance($studentId: ID!) {
    childFeeBalance(studentId: $studentId) {
      studentId
      totalDue
      totalPaid
      feesOwed
      items {
        id
        itemName
        bucketName
        amount
        amountPaid
        balance
      }
    }
  }
`

const CHILD_ATTENDANCE_DETAILS = `
  query ChildAttendanceDetails($studentId: ID!, $startDate: String!, $endDate: String!) {
    childAttendanceDetails(studentId: $studentId, startDate: $startDate, endDate: $endDate) {
      id
      date
      status
    }
  }
`

const CHILD_ATTENDANCE_SUMMARY = `
  query ChildAttendanceSummary($studentId: ID!, $startDate: String!, $endDate: String!) {
    childAttendanceSummary(studentId: $studentId, startDate: $startDate, endDate: $endDate) {
      attendanceRate
      present
      totalDays
    }
  }
`

export async function fetchMyChildren(
  subdomain: string,
): Promise<MyChildApi[]> {
  const data = await chatGraphqlFetch<{ myChildren: MyChildApi[] }>(
    MY_CHILDREN,
    {},
    subdomain,
  )
  return data.myChildren ?? []
}

export async function fetchChildFeeBalance(
  subdomain: string,
  studentId: string,
): Promise<ParentFeeBalance> {
  const data = await chatGraphqlFetch<{ childFeeBalance: ParentFeeBalance }>(
    CHILD_FEE_BALANCE,
    { studentId },
    subdomain,
  )
  return data.childFeeBalance
}

export async function fetchChildAttendanceDetails(
  subdomain: string,
  studentId: string,
  startDate: string,
  endDate: string,
): Promise<Array<{ id: string; date: string; status: string }>> {
  const data = await chatGraphqlFetch<{
    childAttendanceDetails: Array<{ id: string; date: string; status: string }>
  }>(
    CHILD_ATTENDANCE_DETAILS,
    { studentId, startDate, endDate },
    subdomain,
  )
  return data.childAttendanceDetails ?? []
}

export async function fetchChildAttendanceRate(
  subdomain: string,
  studentId: string,
  startDate: string,
  endDate: string,
): Promise<number> {
  const data = await chatGraphqlFetch<{
    childAttendanceSummary: { attendanceRate: string; present: number; totalDays: number }
  }>(
    CHILD_ATTENDANCE_SUMMARY,
    { studentId, startDate, endDate },
    subdomain,
  )
  const rate = parseFloat(data.childAttendanceSummary?.attendanceRate ?? '0')
  if (!Number.isNaN(rate) && rate > 0) return Math.round(rate)
  const { present, totalDays } = data.childAttendanceSummary ?? { present: 0, totalDays: 0 }
  if (totalDays === 0) return 0
  return Math.round((present / totalDays) * 100)
}

export function getLast30DaysRange(): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 30)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}
