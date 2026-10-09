/**
 * School attendance GraphQL API.
 *
 * Thin wrappers over the attendance resolvers, following the same pattern as the
 * other school API modules (`gradingConfig`, `communicationsApi`): same-origin
 * `/api/graphql` via `chatGraphqlFetch`, cookies included and the first GraphQL
 * error surfaced as an `Error`.
 */

import { chatGraphqlFetch } from "@/lib/chat/graphql";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "SUSPENDED";

export interface AttendanceUser {
  id: string;
  name: string;
}

export interface AttendanceStudent {
  id: string;
  admission_number: string;
  isActive: boolean;
  user: AttendanceUser;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  gradeId: string;
  status: AttendanceStatus;
  studentId: string;
}

export interface CreateAttendanceInput {
  date: string;
  gradeId: string;
  attendanceRecords: { status: AttendanceStatus; studentId: string }[];
}

const STUDENTS_BY_GRADE = `
  query StudentsByGrade($gradeId: String!) {
    getStudentsByGrade(gradeId: $gradeId) {
      id
      admission_number
      isActive
      user {
        id
        name
      }
    }
  }
`;

const ATTENDANCE_BY_DATE = `
  query AttendanceByDate($date: String!, $gradeId: String!) {
    getAttendanceByDate(date: $date, gradeId: $gradeId) {
      id
      date
      gradeId
      status
      studentId
    }
  }
`;

const MARK_ATTENDANCE = `
  mutation MarkAttendance($input: CreateAttendanceInput!) {
    markAttendance(markAttendanceInput: $input) {
      id
      date
      gradeId
      status
      studentId
    }
  }
`;

/** Students enrolled in a grade, used to build the register. */
export async function fetchStudentsByGrade(
  subdomain: string,
  gradeId: string,
): Promise<AttendanceStudent[]> {
  const data = await chatGraphqlFetch<{
    getStudentsByGrade: AttendanceStudent[];
  }>(STUDENTS_BY_GRADE, { gradeId }, subdomain);
  return data.getStudentsByGrade ?? [];
}

/** Existing attendance records for a grade on a given date (`YYYY-MM-DD`). */
export async function fetchAttendanceByDate(
  subdomain: string,
  date: string,
  gradeId: string,
): Promise<AttendanceRecord[]> {
  const data = await chatGraphqlFetch<{
    getAttendanceByDate: AttendanceRecord[];
  }>(ATTENDANCE_BY_DATE, { date, gradeId }, subdomain);
  return data.getAttendanceByDate ?? [];
}

/** Upsert one attendance record per student for the grade/date. */
export async function markAttendance(
  subdomain: string,
  input: CreateAttendanceInput,
): Promise<AttendanceRecord[]> {
  const data = await chatGraphqlFetch<{ markAttendance: AttendanceRecord[] }>(
    MARK_ATTENDANCE,
    { input },
    subdomain,
  );
  return data.markAttendance ?? [];
}
