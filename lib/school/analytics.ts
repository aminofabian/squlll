/**
 * School analytics queries. Uses the same same-origin `/api/graphql` transport as
 * the rest of the school dashboard, via `chatGraphqlFetch`.
 *
 * Three read-only queries power the Analytics page: the financial summary for the
 * headline totals, the live presence stats, and the per-grade breakdown used by
 * the grade table.
 */

import { chatGraphqlFetch } from "@/lib/chat/graphql";

export interface GradeLevelSummary {
  gradeLevelId: string;
  gradeLevelName: string;
  curriculumName: string;
  totalStudents: number;
  totalBalance: number;
  totalFeesPaid: number;
  totalFeesOwed: number;
}

export interface SchoolFinancialSummary {
  tenantId: string;
  totalStudents: number;
  totalBalance: number;
  totalFeesOwed: number;
  totalFeesPaid: number;
  gradeLevelSummaries: GradeLevelSummary[];
}

export interface TenantLiveStats {
  onlineTotal: number;
  onlineStudents: number;
  onlineTeachers: number;
  onlineParents: number;
  onlineStaff: number;
  onlineAdmins: number;
  lessonsCompletedToday: number;
}

const STUDENTS_SUMMARY_BY_GRADE_LEVEL = `
  query StudentsSummaryByGradeLevel {
    studentsSummaryByGradeLevel {
      gradeLevelId
      gradeLevelName
      curriculumName
      totalStudents
      totalBalance
      totalFeesPaid
      totalFeesOwed
    }
  }
`;

const SCHOOL_FINANCIAL_SUMMARY = `
  query SchoolFinancialSummary {
    schoolFinancialSummary {
      tenantId
      totalStudents
      totalBalance
      totalFeesOwed
      totalFeesPaid
      gradeLevelSummaries {
        gradeLevelId
        gradeLevelName
        curriculumName
        totalStudents
        totalBalance
        totalFeesPaid
        totalFeesOwed
      }
    }
  }
`;

const TENANT_LIVE_STATS = `
  query TenantLiveStats {
    tenantLiveStats {
      onlineTotal
      onlineStudents
      onlineTeachers
      onlineParents
      onlineStaff
      onlineAdmins
      lessonsCompletedToday
    }
  }
`;

export async function fetchStudentsSummaryByGradeLevel(
  subdomain: string,
): Promise<GradeLevelSummary[]> {
  const data = await chatGraphqlFetch<{
    studentsSummaryByGradeLevel: GradeLevelSummary[];
  }>(STUDENTS_SUMMARY_BY_GRADE_LEVEL, {}, subdomain);
  return data.studentsSummaryByGradeLevel ?? [];
}

export async function fetchSchoolFinancialSummary(
  subdomain: string,
): Promise<SchoolFinancialSummary> {
  const data = await chatGraphqlFetch<{
    schoolFinancialSummary: SchoolFinancialSummary;
  }>(SCHOOL_FINANCIAL_SUMMARY, {}, subdomain);
  return data.schoolFinancialSummary;
}

export async function fetchTenantLiveStats(
  subdomain: string,
): Promise<TenantLiveStats> {
  const data = await chatGraphqlFetch<{ tenantLiveStats: TenantLiveStats }>(
    TENANT_LIVE_STATS,
    {},
    subdomain,
  );
  return data.tenantLiveStats;
}
