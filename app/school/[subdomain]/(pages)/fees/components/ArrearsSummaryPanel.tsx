"use client";

import { cn } from "@/lib/utils";
import { FEES_LAYOUT } from "../lib/fees-ui";
import { formatCurrency } from "../utils";
import {
  AGING_BADGE_STYLES,
  AGING_LABELS,
  type ArrearsAgingCategory,
} from "../lib/arrearsAging";
import type {
  GradeArrearsSummary,
  SchoolArrearsSummary,
} from "../hooks/useSchoolArrearsSummary";

interface ArrearsSummaryPanelProps {
  summary: SchoolArrearsSummary | null;
  loading: boolean;
  error: string | null;
  selectedGrade?: string;
  onGradeSelect?: (gradeName: string) => void;
  compact?: boolean;
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

function resolveDisplaySummary(
  summary: SchoolArrearsSummary,
  selectedGrade?: string,
): {
  title: string;
  scope: "school" | "grade";
  totalBilled: number;
  totalPaid: number;
  totalArrears: number;
  totalCredit: number;
  studentsWithArrears: number;
  studentCount: number;
} {
  if (!selectedGrade || selectedGrade === "all") {
    const studentCount = summary.byGrade.reduce(
      (sum, g) => sum + g.studentCount,
      0,
    );
    return {
      title: "School arrears",
      scope: "school",
      totalBilled: summary.totalBilled,
      totalPaid: summary.totalPaid,
      totalArrears: summary.totalArrears,
      totalCredit: summary.totalCredit,
      studentsWithArrears: summary.studentsWithArrears,
      studentCount,
    };
  }

  const grade = summary.byGrade.find((g) => matchGrade(g, selectedGrade));
  if (!grade) {
    return {
      title: selectedGrade,
      scope: "grade",
      totalBilled: 0,
      totalPaid: 0,
      totalArrears: 0,
      totalCredit: 0,
      studentsWithArrears: 0,
      studentCount: 0,
    };
  }

  return {
    title: grade.gradeLevelName,
    scope: "grade",
    totalBilled: 0,
    totalPaid: 0,
    totalArrears: grade.totalArrears,
    totalCredit: grade.totalCredit,
    studentsWithArrears: grade.studentsWithArrears,
    studentCount: grade.studentCount,
  };
}

function SummarySkeleton() {
  return (
    <div className="animate-pulse space-y-3 px-3 py-3 sm:px-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

export function ArrearsSummaryPanel({
  summary,
  loading,
  error,
  selectedGrade = "all",
  onGradeSelect,
  compact = false,
}: ArrearsSummaryPanelProps) {
  if (loading) {
    return <SummarySkeleton />;
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

  const display = resolveDisplaySummary(summary, selectedGrade);
  const showGradeBreakdown =
    !compact && (!selectedGrade || selectedGrade === "all");
  const sortedGrades = [...summary.byGrade].sort(
    (a, b) => b.totalArrears - a.totalArrears,
  );

  const metrics =
    display.scope === "school"
      ? [
          {
            label: "Total billed",
            value: formatKesCompact(summary.totalBilled),
            tone: "text-slate-900",
          },
          {
            label: "Total paid",
            value: formatKesCompact(summary.totalPaid),
            tone: "text-emerald-800",
          },
          {
            label: "Outstanding",
            value: formatKesCompact(display.totalArrears),
            tone: "text-rose-800",
          },
          {
            label: "Credit",
            value: formatKesCompact(display.totalCredit),
            tone: "text-sky-800",
          },
        ]
      : [
          {
            label: "Outstanding",
            value: formatKesCompact(display.totalArrears),
            tone: "text-rose-800",
          },
          {
            label: "Credit",
            value: formatKesCompact(display.totalCredit),
            tone: "text-sky-800",
          },
          {
            label: "Students",
            value: String(display.studentCount),
            tone: "text-slate-900",
          },
          {
            label: "Owing",
            value: String(display.studentsWithArrears),
            tone: "text-amber-800",
          },
        ];

  return (
    <div className="border-b border-slate-100 bg-slate-50/40">
      <div className={cn("px-3 py-3 sm:px-4", compact && "py-2")}>
        <div
          className={cn(
            FEES_LAYOUT.toolbarRow,
            "mb-2 gap-1",
          )}
        >
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {display.title}
            </p>
            <p className="text-xs text-slate-600">
              {display.studentsWithArrears > 0 ? (
                <>
                  <span className="font-semibold text-rose-800">
                    {display.studentsWithArrears}
                  </span>{" "}
                  of {display.studentCount} students with outstanding balances
                </>
              ) : (
                <>No outstanding balances</>
              )}
            </p>
          </div>
          {selectedGrade && selectedGrade !== "all" && onGradeSelect && (
            <button
              type="button"
              onClick={() => onGradeSelect("all")}
              className="shrink-0 text-[11px] font-medium text-emerald-700 hover:underline"
            >
              View all grades
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-slate-200/80 bg-white px-2.5 py-2"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {metric.label}
              </p>
              <p
                className={cn(
                  "text-sm font-bold tabular-nums",
                  metric.tone,
                )}
              >
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        {display.scope === "school" && display.totalArrears > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Arrears aging
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {AGING_ORDER.map((category) => {
                const amount =
                  summary.aging.find((b) => b.category === category)?.amount ??
                  0;
                const active = amount > 0;

                return (
                  <div
                    key={category}
                    className={cn(
                      "rounded-lg border px-2.5 py-2",
                      active
                        ? AGING_BADGE_STYLES[category]
                        : "border-slate-200/80 bg-white",
                    )}
                  >
                    <p
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider",
                        active ? "opacity-80" : "text-slate-400",
                      )}
                    >
                      {AGING_LABELS[category]}
                    </p>
                    <p
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        active ? "" : "text-slate-300",
                      )}
                    >
                      {active ? formatKesCompact(amount) : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showGradeBreakdown && sortedGrades.length > 0 && (
        <div className="border-t border-slate-100 px-3 pb-3 sm:px-4">
          <p className="mb-2 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            By grade / class
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200/80 bg-white">
            <table className="w-full min-w-[28rem] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2">Grade</th>
                  <th className="px-3 py-2 text-right">Students</th>
                  <th className="px-3 py-2 text-right">Owing</th>
                  <th className="px-3 py-2 text-right">Arrears</th>
                  <th className="px-3 py-2 text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {sortedGrades.map((grade) => {
                  const isSelected =
                    selectedGrade !== "all" && matchGrade(grade, selectedGrade);
                  const clickable = !!onGradeSelect;

                  return (
                    <tr
                      key={grade.gradeLevelId}
                      className={cn(
                        "border-b border-slate-50 last:border-0",
                        isSelected && "bg-emerald-50/60",
                        clickable &&
                          "cursor-pointer transition-colors hover:bg-slate-50",
                      )}
                      onClick={() =>
                        clickable && onGradeSelect?.(grade.gradeLevelName)
                      }
                    >
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {grade.gradeLevelName}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                        {grade.studentCount}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                        {grade.studentsWithArrears}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right tabular-nums font-semibold",
                          grade.totalArrears > 0
                            ? "text-rose-700"
                            : "text-slate-400",
                        )}
                      >
                        {grade.totalArrears > 0
                          ? formatCurrency(grade.totalArrears)
                          : "—"}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right tabular-nums",
                          grade.totalCredit > 0
                            ? "text-sky-700"
                            : "text-slate-400",
                        )}
                      >
                        {grade.totalCredit > 0
                          ? formatCurrency(grade.totalCredit)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {onGradeSelect && (
            <p className="mt-1.5 text-[10px] text-slate-400">
              Tap a row to filter the student list below.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
