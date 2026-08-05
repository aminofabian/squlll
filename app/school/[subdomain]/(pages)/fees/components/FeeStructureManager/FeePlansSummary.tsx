"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FEES_BTN, FEES_SECTION_HEAD } from "../../lib/fees-ui";
import type { FeePlansDashboardStats } from "../../lib/feePlanStats";
import { feesSectionHref } from "../../lib/feesRoutes";

interface FeePlansSummaryProps {
  stats: FeePlansDashboardStats;
  onCreateNew: () => void;
  canCreate: boolean;
}

export function FeePlansSummary({
  stats,
  onCreateNew,
  canCreate,
}: FeePlansSummaryProps) {
  const allGradesLinked =
    stats.totalGrades > 0 && stats.gradesLinked >= stats.totalGrades;

  return (
    <header className={cn(FEES_SECTION_HEAD, "px-4 py-4 sm:px-5")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-normal tracking-tight text-[#0a1f1a] sm:text-2xl">
            {stats.totalPlans} fee structure
            {stats.totalPlans === 1 ? "" : "s"}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[#1a4d42]/55">
            {stats.schoolYears} school year
            {stats.schoolYears === 1 ? "" : "s"}
            {stats.totalGrades > 0 ? (
              <>
                {" · "}
                <span
                  className={cn(
                    "font-medium",
                    allGradesLinked ? "text-[#246a59]" : "text-amber-800",
                  )}
                >
                  {stats.gradesLinked}/{stats.totalGrades} grades linked
                </span>
              </>
            ) : null}
            {stats.unbilledCount > 0 ? (
              <>
                {" · "}
                <span className="font-medium text-amber-800">
                  {stats.unbilledCount} awaiting billing
                </span>
              </>
            ) : null}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className={cn(FEES_BTN.primary, "shrink-0")}
          disabled={!canCreate}
          onClick={onCreateNew}
        >
          <Plus className="h-4 w-4" />
          New structure
        </Button>
      </div>

      <div
        className="mt-3 grid grid-cols-2 gap-px border border-[#1a4d42]/12 bg-[#1a4d42]/12 sm:grid-cols-4"
        role="list"
        aria-label="Structure overview"
      >
        <StatCell label="Active" value={stats.activePlans} />
        <StatCell
          label="With classes"
          value={stats.linkedPlans}
          hint={
            stats.unlinkedPlans > 0
              ? `${stats.unlinkedPlans} need links`
              : undefined
          }
        />
        <StatCell
          label="Not billed"
          value={stats.unbilledCount}
          tone={stats.unbilledCount > 0 ? "warn" : "neutral"}
        />
        {stats.conflictCount > 0 ? (
          <StatCell
            label="Conflicts"
            value={stats.conflictCount}
            tone="danger"
            href={feesSectionHref("assignments")}
            hint="Fix in Class links"
          />
        ) : (
          <StatCell label="Conflicts" value={0} tone="ready" hint="All clear" />
        )}
      </div>
    </header>
  );
}

function StatCell({
  label,
  value,
  tone = "neutral",
  hint,
  href,
}: {
  label: string;
  value: number;
  tone?: "neutral" | "warn" | "ready" | "danger";
  hint?: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
        {label}
      </span>
      <span
        className={cn(
          "text-lg font-semibold tabular-nums leading-none",
          tone === "ready" && "text-[#246a59]",
          tone === "warn" && "text-amber-900",
          tone === "danger" && "text-rose-900",
          tone === "neutral" && "text-[#0a1f1a]",
        )}
      >
        {value}
      </span>
      {hint ? (
        <span className="text-[10px] leading-tight text-[#1a4d42]/45">
          {hint}
        </span>
      ) : null}
    </>
  );

  const className =
    "flex min-h-[4.25rem] flex-col justify-center gap-1 bg-[#f8fbfa] px-3 py-2.5 text-left transition-colors";

  if (href) {
    return (
      <Link
        href={href}
        scroll={false}
        className={cn(className, "hover:bg-[#e8f2ef]")}
        role="listitem"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className={className} role="listitem">
      {inner}
    </div>
  );
}
