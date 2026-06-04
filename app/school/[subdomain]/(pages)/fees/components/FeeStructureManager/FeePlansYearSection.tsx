"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcademicYearPlanGroup } from "../../lib/feePlanYearLinkage";
import { feesOverviewHref } from "../../lib/feesRoutes";
import { FEES_BRAND } from "../../lib/fees-ui";

interface FeePlansYearSectionProps {
  group: AcademicYearPlanGroup;
  currentTermName: string | null;
  isCurrentSchoolYear: boolean;
  /** When true, conflict details are compact (full warning is at page level). */
  pageLevelConflictAlert?: boolean;
  /** All structures in this year have no billing yet — row badges stay minimal. */
  allPlansUnbilled?: boolean;
  children: ReactNode;
}

export function FeePlansYearSection({
  group,
  currentTermName,
  isCurrentSchoolYear,
  pageLevelConflictAlert = false,
  allPlansUnbilled = false,
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

  const [showUnlinkedDetails, setShowUnlinkedDetails] = useState(false);

  const pct =
    totalSchoolGrades > 0
      ? Math.round((linkedGradeCount / totalSchoolGrades) * 100)
      : 0;
  const allLinked =
    totalSchoolGrades > 0 && linkedGradeCount >= totalSchoolGrades;
  const showUnlinked = unlinkedGrades.length > 0;
  const needsAttention =
    conflicts.length > 0 || showUnlinked || partialGrades.length > 0;
  const maxChips = 8;
  const visibleUnlinked = unlinkedGrades.slice(0, maxChips);
  const moreUnlinked = unlinkedGrades.length - visibleUnlinked.length;

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50/30">
      <div className="border-b border-slate-200/80 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">
                {yearLabel}
              </h3>
              {isCurrentSchoolYear ? (
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                  Current year
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-xs text-slate-600">
              {plans.length} structure{plans.length === 1 ? "" : "s"}
              {termCount > 0 ? ` · ${termCount} terms` : ""}
              {isCurrentSchoolYear && currentTermName ? (
                <span className="text-slate-500">
                  {" "}
                  · {currentTermName}
                </span>
              ) : null}
            </p>
          </div>

          <div className="flex max-w-full shrink-0 flex-col items-start gap-1.5 sm:max-w-[11rem] sm:items-end">
            <div
              className={cn(
                "inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-medium tabular-nums",
                allLinked
                  ? "border-emerald-200/90 bg-emerald-50 text-emerald-900"
                  : "border-amber-200/90 bg-amber-50 text-amber-950",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  allLinked ? "bg-emerald-600" : "bg-amber-500",
                )}
                aria-hidden
              />
              {linkedGradeCount}/{totalSchoolGrades} grades linked
            </div>
            {!allLinked && totalSchoolGrades > 0 ? (
              <div className="h-1 w-full max-w-[8rem] overflow-hidden rounded-full bg-slate-200/80 sm:w-28">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            ) : null}
          </div>
        </div>

        {conflicts.length > 0 && !pageLevelConflictAlert ? (
          <details className="group mt-2 rounded-lg border border-rose-200/90 bg-rose-50/80 open:pb-2">
            <summary className="flex min-w-0 cursor-pointer list-none flex-wrap items-center gap-x-2 gap-y-1 px-3 py-1.5 text-[11px] font-medium text-rose-900 [&::-webkit-details-marker]:hidden">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0">
                {conflicts.length} conflict
                {conflicts.length === 1 ? "" : "s"} in this year
                <span className="text-rose-700/80">
                  {" "}
                  — resolve before billing
                </span>
              </span>
              <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-rose-600 transition-transform group-open:rotate-180" />
            </summary>
            <ul className="space-y-0.5 px-3 text-[11px] leading-relaxed text-rose-800/95">
              {conflicts.map((c) => (
                <li key={`${c.gradeId}-${c.termId}`}>
                  <span className="font-medium text-rose-950">
                    {c.gradeName}
                  </span>{" "}
                  · {c.termName}: {c.planNames.join(" vs ")}
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {allPlansUnbilled && plans.length > 0 ? (
          <p className="mt-2 flex flex-wrap items-center gap-x-1 text-[11px] text-amber-900/95">
            <span>No invoices generated for this year yet.</span>
            <Link
              href={feesOverviewHref()}
              scroll={false}
              className="font-semibold hover:underline"
              style={{ color: FEES_BRAND.primary }}
            >
              Bill on Overview →
            </Link>
          </p>
        ) : null}

        {showUnlinked ? (
          <div className="mt-2">
            <button
              type="button"
              className="text-[11px] font-medium text-amber-800 underline decoration-amber-300/80 underline-offset-2 hover:text-amber-950"
              onClick={() => setShowUnlinkedDetails((v) => !v)}
            >
              {showUnlinkedDetails ? "Hide" : "Show"} {unlinkedGrades.length}{" "}
              grade{unlinkedGrades.length === 1 ? "" : "s"} not linked
            </button>
            {showUnlinkedDetails ? (
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
            ) : null}
          </div>
        ) : partialGrades.length > 0 ? (
          <p className="mt-2 text-[11px] text-slate-600">
            {partialGrades.length} grade
            {partialGrades.length === 1 ? "" : "s"} linked for some terms only —
            open a structure to finish linking.
          </p>
        ) : allLinked && totalSchoolGrades > 0 && !needsAttention ? (
          <p className="mt-2 text-[11px] text-emerald-800">
            All grades linked for this year.
          </p>
        ) : null}
      </div>

      <div className="min-w-0 max-w-full overflow-x-hidden">{children}</div>
    </section>
  );
}
