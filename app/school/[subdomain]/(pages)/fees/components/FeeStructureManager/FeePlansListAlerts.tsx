"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { GradeTermConflict } from "../../lib/feePlanYearLinkage";
import { feesSectionHref, feesOverviewHref } from "../../lib/feesRoutes";

interface FeePlansListAlertsProps {
  conflictCount: number;
  conflicts?: GradeTermConflict[];
  unlinkedPlanCount: number;
  unbilledPlanCount: number;
  className?: string;
}

/** Actionable warnings only — stats live in FeePlansSummary. */
export function FeePlansListAlerts({
  conflictCount,
  conflicts = [],
  unlinkedPlanCount,
  unbilledPlanCount,
  className,
}: FeePlansListAlertsProps) {
  const [expanded, setExpanded] = useState(false);
  const showConflicts = conflictCount > 0;
  const showUnlinked = unlinkedPlanCount > 0;
  const showUnbilled =
    unbilledPlanCount > 0 && !showConflicts && !showUnlinked;

  if (!showConflicts && !showUnlinked && !showUnbilled) {
    return null;
  }

  return (
    <div
      className={cn(
        "border-b border-slate-100 px-4 py-2 sm:px-5",
        className,
      )}
    >
      {showConflicts ? (
        <div
          className="rounded-lg border border-rose-200/90 bg-rose-50/80"
          role="alert"
        >
          <div className="flex flex-wrap items-center gap-2 px-3 py-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-700" />
            <p className="min-w-0 flex-1 text-xs leading-snug text-rose-950">
              <span className="font-semibold">
                {conflictCount} duplicate class link
                {conflictCount === 1 ? "" : "s"}
              </span>
              <span className="text-rose-800/90">
                {" "}
                — same class on two structures for one term. Fix before billing.
              </span>
            </p>
            <Link
              href={feesSectionHref("assignments")}
              scroll={false}
              className="shrink-0 rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-900 shadow-sm ring-1 ring-rose-200/90 hover:bg-rose-50"
            >
              Class links
            </Link>
            {conflicts.length > 0 ? (
              <button
                type="button"
                className="flex shrink-0 items-center gap-0.5 rounded-md px-2 py-1 text-[11px] font-medium text-rose-800 hover:bg-rose-100/60"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
              >
                Details
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    expanded && "rotate-180",
                  )}
                />
              </button>
            ) : null}
          </div>
          {expanded && conflicts.length > 0 ? (
            <ul className="max-h-32 space-y-0.5 overflow-y-auto border-t border-rose-200/70 px-3 py-2 text-[11px] leading-relaxed text-rose-800/95">
              {conflicts.slice(0, 20).map((c) => (
                <li key={`${c.gradeId}-${c.termId}`}>
                  <span className="font-medium text-rose-950">{c.gradeName}</span>{" "}
                  · {c.termName}: {c.planNames.join(" vs ")}
                </li>
              ))}
              {conflicts.length > 20 ? (
                <li className="text-rose-700/80">
                  +{conflicts.length - 20} more in Class links
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      ) : null}

      {showUnlinked ? (
        <div
          className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200/90 bg-amber-50/70 px-3 py-2 text-xs text-amber-950"
          role="status"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          <p>
            <span className="font-semibold">
              {unlinkedPlanCount} structure
              {unlinkedPlanCount === 1 ? "" : "s"} without classes.
            </span>{" "}
            Open a structure and link grades before billing.
          </p>
        </div>
      ) : null}

      {showUnbilled ? (
        <p className="mt-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
          {unbilledPlanCount} structure
          {unbilledPlanCount === 1 ? " has" : "s have"} no invoices yet.{" "}
          <Link
            href={feesOverviewHref()}
            scroll={false}
            className="font-semibold text-[#246a59] hover:underline"
          >
            Bill on Overview
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
