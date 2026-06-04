"use client";

import { cn } from "@/lib/utils";
import { FEES_LAYOUT } from "../lib/fees-ui";
import { formatCurrency } from "../utils";
import {
  AGING_BADGE_STYLES,
  AGING_SHORT_LABELS,
  type ArrearsAgingCategory,
} from "../lib/arrearsAging";
import type {
  GradeArrearsSummary,
  SchoolArrearsSummary,
} from "../hooks/useSchoolArrearsSummary";
import { ArrearsSummarySkeleton } from "./BalancesSkeletons";

interface ArrearsSummaryPanelProps {
  summary: SchoolArrearsSummary | null;
  loading: boolean;
  error: string | null;
  selectedGrade?: string;
  onGradeSelect?: (gradeName: string) => void;
}

const AGING_ORDER: ArrearsAgingCategory[] = [
  "CURRENT",
  "DAYS_30",
  "DAYS_60",
  "DAYS_90",
];

function formatKesCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `KES ${(amount / 1_000_000).toFixed(1)}M`;
  }
  return formatCurrency(amount);
}

function matchGrade(
  grade: GradeArrearsSummary,
  selectedGrade: string,
): boolean {
  return (
    grade.gradeLevelName === selectedGrade ||
    grade.gradeLevelName.includes(selectedGrade) ||
    selectedGrade.includes(grade.gradeLevelName)
  );
}

export function ArrearsSummaryPanel({
  summary,
  loading,
  error,
  selectedGrade = "all",
  onGradeSelect,
}: ArrearsSummaryPanelProps) {
  if (loading) {
    return <ArrearsSummarySkeleton />;
  }

  if (error) {
    return (
      <div className="border-b border-rose-100 bg-rose-50/60 px-3 py-2 text-xs text-rose-700 sm:px-4">
        Could not load arrears summary: {error}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const isAllGrades = !selectedGrade || selectedGrade === "all";
  const sortedGrades = [...summary.byGrade].sort(
    (a, b) => b.totalArrears - a.totalArrears,
  );
  const showGradeChips =
    isAllGrades && sortedGrades.length > 1 && !!onGradeSelect;
  const gradeRow =
    !isAllGrades
      ? sortedGrades.find((g) => matchGrade(g, selectedGrade))
      : null;

  const totalArrears = isAllGrades
    ? summary.totalArrears
    : (gradeRow?.totalArrears ?? 0);
  const totalCredit = isAllGrades
    ? summary.totalCredit
    : (gradeRow?.totalCredit ?? 0);
  const studentsWithArrears = isAllGrades
    ? summary.studentsWithArrears
    : (gradeRow?.studentsWithArrears ?? 0);
  const studentCount = isAllGrades
    ? sortedGrades.reduce((sum, g) => sum + g.studentCount, 0)
    : (gradeRow?.studentCount ?? 0);

  const agingBuckets = AGING_ORDER.map((category) => ({
    category,
    amount:
      summary.aging.find((b) => b.category === category)?.amount ?? 0,
  })).filter((b) => b.amount > 0);

  const showAgingRow =
    isAllGrades &&
    totalArrears > 0 &&
    (agingBuckets.length > 1 ||
      (agingBuckets.length === 1 && agingBuckets[0].category !== "CURRENT"));

  return (
    <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
      <div className="px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {isAllGrades ? "Outstanding" : selectedGrade}
            </p>
            <p
              className={cn(
                "text-2xl font-bold tabular-nums tracking-tight sm:text-[1.65rem]",
                totalArrears > 0 ? "text-rose-800" : "text-emerald-800",
              )}
            >
              {totalArrears > 0
                ? formatKesCompact(totalArrears)
                : "All clear"}
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              {studentsWithArrears > 0 ? (
                <>
                  <span className="font-medium text-slate-800">
                    {studentsWithArrears}
                  </span>{" "}
                  of {studentCount} owing
                </>
              ) : (
                <>No balances due{isAllGrades ? " school-wide" : ""}</>
              )}
            </p>
          </div>

          {!isAllGrades && onGradeSelect ? (
            <button
              type="button"
              onClick={() => onGradeSelect("all")}
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-50/80"
            >
              All grades
            </button>
          ) : null}
        </div>

        {isAllGrades ? (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center sm:max-w-md">
            <div className="rounded-lg border border-slate-200/80 bg-white px-2 py-1.5">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Billed
              </p>
              <p className="text-xs font-bold tabular-nums text-slate-800">
                {formatKesCompact(summary.totalBilled)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200/80 bg-white px-2 py-1.5">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Paid
              </p>
              <p className="text-xs font-bold tabular-nums text-emerald-800">
                {formatKesCompact(summary.totalPaid)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200/80 bg-white px-2 py-1.5">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Credit
              </p>
              <p className="text-xs font-bold tabular-nums text-sky-800">
                {formatKesCompact(totalCredit)}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
            {totalCredit > 0 ? (
              <span>
                Credit{" "}
                <span className="font-semibold tabular-nums text-sky-800">
                  {formatKesCompact(totalCredit)}
                </span>
              </span>
            ) : null}
            <span>
              {studentCount} student{studentCount === 1 ? "" : "s"}
            </span>
          </div>
        )}

        {showAgingRow ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Aging
            </span>
            {agingBuckets.map(({ category, amount }) => (
              <span
                key={category}
                className={cn(
                  "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold tabular-nums",
                  AGING_BADGE_STYLES[category],
                )}
              >
                {AGING_SHORT_LABELS[category]}{" "}
                {formatKesCompact(amount)}
              </span>
            ))}
          </div>
        ) : totalArrears > 0 && agingBuckets.length === 1 ? (
          <p className="mt-2 text-[11px] text-amber-800/90">
            All outstanding balances are current (not yet overdue).
          </p>
        ) : null}
      </div>

      {showGradeChips ? (
        <div className="border-t border-slate-100 px-3 pb-3 sm:px-4">
          <p className="mb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Filter by grade
          </p>
          <div className={cn("flex flex-wrap gap-1.5", FEES_LAYOUT.chipStrip)}>
            {sortedGrades.map((grade) => {
              const hasDue = grade.totalArrears > 0;
              return (
                <button
                  key={grade.gradeLevelId}
                  type="button"
                  onClick={() => onGradeSelect?.(grade.gradeLevelName)}
                  className={cn(
                    "inline-flex max-w-full flex-col rounded-lg border px-2.5 py-1.5 text-left transition-colors",
                    "hover:border-emerald-200 hover:bg-emerald-50/60",
                    hasDue
                      ? "border-slate-200/90 bg-white"
                      : "border-slate-200/60 bg-slate-50/80",
                  )}
                >
                  <span className="text-[11px] font-semibold text-slate-900">
                    {grade.gradeLevelName}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] tabular-nums",
                      hasDue ? "font-medium text-rose-700" : "text-slate-400",
                    )}
                  >
                    {hasDue
                      ? formatKesCompact(grade.totalArrears)
                      : "Paid up"}
                    <span className="text-slate-400">
                      {" "}
                      · {grade.studentCount}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
