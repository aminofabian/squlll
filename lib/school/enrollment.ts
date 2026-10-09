import { chatGraphqlFetch } from "@/lib/chat/graphql";

/** GraphQL enum for an admission application's lifecycle status. */
export type AdmissionApplicationStatus =
  | "NEW"
  | "REVIEWING"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

/** A single admission application, trimmed to the fields the overview needs. */
export interface AdmissionApplicationSummary {
  id: string;
  reference: string;
  studentFirstName: string;
  studentLastName: string;
  programme: string;
  status: AdmissionApplicationStatus;
  startTerm: string;
  admissionNumber: string | null;
  enrolledStudentId: string | null;
  createdAt: string;
}

/** Enrolled-student totals for one grade level (from the students aggregate). */
export interface GradeLevelEnrollment {
  gradeLevelId: string;
  gradeLevelName: string;
  curriculumName: string;
  totalStudents: number;
}

const ADMISSION_APPLICATIONS_QUERY = `
  query AdmissionApplications {
    admissionApplications {
      id
      reference
      studentFirstName
      studentLastName
      programme
      status
      startTerm
      admissionNumber
      enrolledStudentId
      createdAt
    }
  }
`;

const STUDENTS_SUMMARY_BY_GRADE_LEVEL_QUERY = `
  query StudentsSummaryByGradeLevel {
    studentsSummaryByGradeLevel {
      gradeLevelId
      gradeLevelName
      curriculumName
      totalStudents
    }
  }
`;

/** All admission applications for the current school. */
export async function fetchAdmissionApplications(
  subdomain: string,
): Promise<AdmissionApplicationSummary[]> {
  const data = await chatGraphqlFetch<{
    admissionApplications: AdmissionApplicationSummary[];
  }>(ADMISSION_APPLICATIONS_QUERY, {}, subdomain);
  return data.admissionApplications ?? [];
}

/** Enrolled-student counts grouped by grade level for the current school. */
export async function fetchEnrollmentByGradeLevel(
  subdomain: string,
): Promise<GradeLevelEnrollment[]> {
  const data = await chatGraphqlFetch<{
    studentsSummaryByGradeLevel: GradeLevelEnrollment[];
  }>(STUDENTS_SUMMARY_BY_GRADE_LEVEL_QUERY, {}, subdomain);
  return data.studentsSummaryByGradeLevel ?? [];
}
