/**
 * Pure helpers behind the class profile: fee health, merit list, readiness and
 * local prefect storage. Kept free of React so they can be unit tested.
 */

export interface FeeSummaryLike {
  totalOwed: number;
  totalPaid: number;
  balance: number;
}

export interface FeeStudentLike {
  admissionNumber: string;
  studentName: string;
  feeSummary: FeeSummaryLike;
}

export interface FeeDebtor {
  name: string;
  admissionNumber: string;
  balance: number;
}

export interface FeeHealth {
  /** Fee rows that matched the class roster. */
  studentCount: number;
  billed: number;
  paid: number;
  balance: number;
  /** 0 – 1 */
  collectionRate: number;
  cleared: number;
  owing: number;
  topDebtors: FeeDebtor[];
  hasData: boolean;
}

export function computeFeeHealth(
  feeStudents: FeeStudentLike[],
  scope?: { admissions?: Iterable<string>; limit?: number },
): FeeHealth {
  const admissions = scope?.admissions
    ? new Set(Array.from(scope.admissions))
    : null;
  const limit = scope?.limit ?? 3;

  const rows = feeStudents.filter(
    (s) => !admissions || admissions.has(s.admissionNumber),
  );

  let billed = 0;
  let paid = 0;
  let cleared = 0;
  let owing = 0;

  for (const row of rows) {
    billed += Math.max(0, row.feeSummary?.totalOwed ?? 0);
    paid += Math.max(0, row.feeSummary?.totalPaid ?? 0);
    if ((row.feeSummary?.balance ?? 0) > 0) owing += 1;
    else cleared += 1;
  }

  const balance = Math.max(0, billed - paid);
  const collectionRate = billed > 0 ? Math.min(1, paid / billed) : 0;

  const topDebtors = rows
    .filter((s) => (s.feeSummary?.balance ?? 0) > 0)
    .sort((a, b) => b.feeSummary.balance - a.feeSummary.balance)
    .slice(0, limit)
    .map((s) => ({
      name: s.studentName,
      admissionNumber: s.admissionNumber,
      balance: s.feeSummary.balance,
    }));

  return {
    studentCount: rows.length,
    billed,
    paid,
    balance,
    collectionRate,
    cleared,
    owing,
    topDebtors,
    hasData: rows.length > 0 && billed > 0,
  };
}

export interface RankingRowLike {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  streamName?: string | null;
  meanPercentage: number;
  overallGrade: string;
  gradePosition?: number | null;
  streamPosition?: number | null;
  subjectsCount?: number;
}

export interface ClassPerformance {
  rows: RankingRowLike[];
  top: RankingRowLike[];
  mean: number | null;
  best: number | null;
  withResults: number;
}

/**
 * Filter a grade's merit list down to one stream (when a stream is selected)
 * and rank it. Position fields win; mean percentage is the tie-breaker.
 */
export function computeClassPerformance(
  rows: RankingRowLike[],
  options?: { streamName?: string | null; limit?: number },
): ClassPerformance {
  const streamName = options?.streamName?.trim();
  const limit = options?.limit ?? 5;

  const scoped = rows.filter((row) => {
    if (!streamName) return true;
    // Rows without a stream label cannot be attributed to a stream; keep them
    // only when the caller is not scoping to a single stream.
    if (!row.streamName) return false;
    return row.streamName.trim().toLowerCase() === streamName.toLowerCase();
  });

  const sorted = [...scoped].sort((a, b) => {
    const pa = streamName ? a.streamPosition : a.gradePosition;
    const pb = streamName ? b.streamPosition : b.gradePosition;
    const aPos = pa ?? Number.MAX_SAFE_INTEGER;
    const bPos = pb ?? Number.MAX_SAFE_INTEGER;
    if (aPos !== bPos) return aPos - bPos;
    return (b.meanPercentage ?? 0) - (a.meanPercentage ?? 0);
  });

  const scores = sorted
    .map((r) => r.meanPercentage)
    .filter((n): n is number => Number.isFinite(n));

  const mean =
    scores.length > 0
      ? scores.reduce((sum, n) => sum + n, 0) / scores.length
      : null;

  return {
    rows: sorted,
    top: sorted.slice(0, limit),
    mean,
    best: scores.length > 0 ? Math.max(...scores) : null,
    withResults: sorted.length,
  };
}

export type ClassHealth =
  | "ready"
  | "partial"
  | "no-teacher"
  | "no-subjects"
  | "empty";

export function classHealth(args: {
  studentCount: number;
  hasTeacher: boolean;
  assignedSubjects: number;
  totalSubjects: number;
}): ClassHealth {
  if (args.studentCount <= 0) return "empty";
  if (!args.hasTeacher) return "no-teacher";
  if (args.totalSubjects <= 0) return "no-subjects";
  if (args.assignedSubjects < args.totalSubjects) return "partial";
  return "ready";
}

/**
 * A quick 0–100 “can this class run?” score: learners (35), a class teacher
 * (30) and subject staffing (35).
 */
export function computeClassReadiness(args: {
  studentCount: number;
  hasTeacher: boolean;
  assignedSubjects: number;
  totalSubjects: number;
}): number {
  let score = 0;
  if (args.studentCount > 0) score += 35;
  if (args.hasTeacher) score += 30;
  if (args.totalSubjects > 0) {
    score +=
      35 * Math.min(1, Math.max(0, args.assignedSubjects / args.totalSubjects));
  }
  return Math.round(score);
}

export interface PrefectRef {
  studentId: string;
  name: string;
  admissionNumber: string;
}

export interface ClassLeadership {
  prefect: PrefectRef | null;
  deputy: PrefectRef | null;
}

export const EMPTY_LEADERSHIP: ClassLeadership = {
  prefect: null,
  deputy: null,
};

export function prefectStorageKey(
  subdomain: string,
  gradeId: string,
  streamId?: string | null,
): string {
  return `squl:class-leadership:${subdomain}:${gradeId}:${streamId || "all"}`;
}

export function parseLeadership(raw: string | null): ClassLeadership {
  if (!raw) return { ...EMPTY_LEADERSHIP };
  try {
    const parsed = JSON.parse(raw) as Partial<ClassLeadership>;
    return {
      prefect: normalizePrefect(parsed?.prefect),
      deputy: normalizePrefect(parsed?.deputy),
    };
  } catch {
    return { ...EMPTY_LEADERSHIP };
  }
}

function normalizePrefect(value: unknown): PrefectRef | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const studentId = typeof record.studentId === "string" ? record.studentId : "";
  const name = typeof record.name === "string" ? record.name : "";
  const admissionNumber =
    typeof record.admissionNumber === "string" ? record.admissionNumber : "";
  if (!studentId || !name) return null;
  return { studentId, name, admissionNumber };
}

export function sameStudent(a: PrefectRef | null, b: PrefectRef | null) {
  if (!a || !b) return a === b;
  return a.studentId === b.studentId;
}

export function formatKes(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function classMonogram(displayName: string): string {
  const words = displayName.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}
