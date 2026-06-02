"use client";

import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEES_BRAND } from "../../lib/fees-ui";
import type { AcademicYearPlanGroup } from "../../lib/feePlanYearLinkage";

interface FeePlansYearSectionProps {
  group: AcademicYearPlanGroup;
  currentTermName: string | null;
  isCurrentSchoolYear: boolean;
  children: ReactNode;
}

export function FeePlansYearSection({
  group,
  currentTermName,
  isCurrentSchoolYear,
  children,
}: FeePlansYearSectionProps) {
  const {
    yearLabel,
    linkedGradeCount,
    totalSchoolGrades,
    unlinkedGrades,
    partialGrades,
    conflicts,
    plans,
    termCount,
  } = group;

  const pct =
    totalSchoolGrades > 0
      ? Math.round((linkedGradeCount / totalSchoolGrades) * 100)
      : 0;
  const allLinked =
    totalSchoolGrades > 0 && linkedGradeCount >= totalSchoolGrades;
  const showUnlinked = unlinkedGrades.length > 0;
  const maxChips = 6;
  const visibleUnlinked = unlinkedGrades.slice(0, maxChips);
  const moreUnlinked = unlinkedGrades.length - visibleUnlinked.length;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div
        className="border-b border-slate-200/80 px-4 py-3 sm:px-5"
        style={{ backgroundColor: FEES_BRAND.primaryLight }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900">
              {yearLabel}
            </h3>
            <p className="mt-0.5 text-xs text-slate-600">
              {plans.length} fee plan{plans.length === 1 ? "" : "s"}
              {termCount > 0 ? ` · ${termCount} terms` : ""}
              {isCurrentSchoolYear && currentTermName ? (
                <span className="font-medium text-amber-800">
                  {" "}
                  · {currentTermName} (current)
                </span>
              ) : null}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p
              className={cn(
                "text-sm font-semibold tabular-nums",
                allLinked ? "text-emerald-800" : "text-amber-900",
              )}
            >
              {linkedGradeCount}/{totalSchoolGrades} grades linked
            </p>
            <p className="text-[10px] text-slate-500">
              One fee plan per grade, per term
            </p>
          </div>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              backgroundColor: allLinked
                ? FEES_BRAND.primary
                : "rgb(217 119 6)",
            }}
          />
        </div>

        {conflicts.length > 0 ? (
          <div className="mt-3 flex gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Duplicate links for the same term</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-rose-800/90">
                {conflicts.slice(0, 3).map((c) => (
                  <li key={`${c.gradeId}-${c.termId}`}>
                    {c.gradeName} · {c.termName}:{" "}
                    {c.planNames.join(" vs ")}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {showUnlinked || partialGrades.length > 0 ? (
          <div className="mt-3 space-y-2">
            {showUnlinked ? (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-amber-800">
                  Not linked yet ({unlinkedGrades.length})
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {visibleUnlinked.map((g) => (
                    <span
                      key={g.id}
                      className="rounded-md border border-amber-200/80 bg-white px-2 py-0.5 text-[11px] font-medium text-amber-950"
                    >
                      {g.name}
                    </span>
                  ))}
                  {moreUnlinked > 0 ? (
                    <span className="rounded-md border border-dashed border-amber-200 px-2 py-0.5 text-[11px] text-amber-800">
                      +{moreUnlinked} more
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
            {partialGrades.length > 0 ? (
              <p className="text-[11px] text-slate-600">
                {partialGrades.length} grade
                {partialGrades.length === 1 ? "" : "s"} linked for some terms
                only — open the plan and link remaining terms.
              </p>
            ) : null}
          </div>
        ) : allLinked && totalSchoolGrades > 0 ? (
          <p className="mt-2 text-xs font-medium text-emerald-800">
            All grades are linked to a fee plan for this year.
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}
