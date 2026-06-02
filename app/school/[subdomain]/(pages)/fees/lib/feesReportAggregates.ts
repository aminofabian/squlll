import type { StudentSummaryFromAPI } from "../types";
import type { PaymentListItem } from "../hooks/useGraphQLPayments";
import type { FeeAuditEntry } from "../hooks/useFeeAuditLog";

export interface GradeOutstandingRow {
  grade: string;
  studentCount: number;
  totalOwed: number;
  totalPaid: number;
  outstanding: number;
}

export function aggregateOutstandingByGrade(
  students: StudentSummaryFromAPI[],
): GradeOutstandingRow[] {
  const map = new Map<string, GradeOutstandingRow>();

  for (const s of students) {
    const grade = s.gradeLevelName || "Unassigned";
    const row = map.get(grade) || {
      grade,
      studentCount: 0,
      totalOwed: 0,
      totalPaid: 0,
      outstanding: 0,
    };
    row.studentCount += 1;
    row.totalOwed += s.feeSummary.totalOwed;
    row.totalPaid += s.feeSummary.totalPaid;
    row.outstanding += s.feeSummary.balance;
    map.set(grade, row);
  }

  return Array.from(map.values()).sort((a, b) =>
    a.grade.localeCompare(b.grade),
  );
}

export interface MethodBreakdownRow {
  method: string;
  count: number;
  total: number;
}

export function aggregatePaymentMethods(
  payments: PaymentListItem[],
): MethodBreakdownRow[] {
  const map = new Map<string, MethodBreakdownRow>();

  for (const p of payments) {
    const method = (p.paymentMethod || "OTHER").toUpperCase();
    const row = map.get(method) || { method, count: 0, total: 0 };
    row.count += 1;
    row.total += p.amount;
    map.set(method, row);
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export interface DailyCollectionRow {
  date: string;
  count: number;
  total: number;
}

export function aggregateDailyCollections(
  payments: PaymentListItem[],
): DailyCollectionRow[] {
  const map = new Map<string, DailyCollectionRow>();

  for (const p of payments) {
    const date = p.paymentDate?.split("T")[0] || "unknown";
    const row = map.get(date) || { date, count: 0, total: 0 };
    row.count += 1;
    row.total += p.amount;
    map.set(date, row);
  }

  return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
}

export function filterAdjustmentsFromAudit(
  entries: FeeAuditEntry[],
): FeeAuditEntry[] {
  return entries.filter(
    (e) =>
      e.action === "adjustment_logged" ||
      e.summary.toLowerCase().includes("waiver") ||
      e.summary.toLowerCase().includes("discount"),
  );
}

export function studentsWithCredit(students: StudentSummaryFromAPI[]) {
  return students.filter((s) => s.feeSummary.balance < 0);
}

export function studentsWithHighBalance(
  students: StudentSummaryFromAPI[],
  threshold: number,
) {
  return students.filter((s) => s.feeSummary.balance >= threshold);
}
