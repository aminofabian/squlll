"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FEES_BRAND } from "../../lib/fees-ui";
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
    <header className="border-b border-slate-100 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            {stats.totalPlans} fee structure
            {stats.totalPlans === 1 ? "" : "s"}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            {stats.schoolYears} school year
            {stats.schoolYears === 1 ? "" : "s"}
            {stats.totalGrades > 0 ? (
              <>
                {" · "}
                <span
                  className={cn(
                    "font-medium",
                    allGradesLinked ? "text-emerald-800" : "text-amber-800",
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
          className="h-9 shrink-0 gap-1.5 text-white shadow-sm"
          style={{ backgroundColor: FEES_BRAND.primary }}
          disabled={!canCreate}
          onClick={onCreateNew}
        >
          <Plus className="h-4 w-4" />
          New structure
        </Button>
      </div>

      <div
        className="mt-3 flex min-w-0 gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
        aria-label="Structure overview"
      >
        <StatPill label="Active" value={stats.activePlans} />
        <StatPill
          label="With classes"
          value={stats.linkedPlans}
          hint={
            stats.unlinkedPlans > 0
              ? `${stats.unlinkedPlans} need links`
              : undefined
          }
        />
        <StatPill
          label="Not billed"
          value={stats.unbilledCount}
          tone={stats.unbilledCount > 0 ? "warn" : "neutral"}
        />
        {stats.conflictCount > 0 ? (
          <StatPill
            label="Conflicts"
            value={stats.conflictCount}
            tone="danger"
            href={feesSectionHref("assignments")}
            hint="Fix in Class links"
          />
        ) : (
          <StatPill label="Conflicts" value={0} tone="ready" hint="All clear" />
        )}
      </div>
    </header>
  );
}

function StatPill({
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
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-bold tabular-nums leading-none",
          tone === "ready" && "text-emerald-800",
          tone === "warn" && "text-amber-900",
          tone === "danger" && "text-rose-900",
          tone === "neutral" && "text-slate-900",
        )}
      >
        {value}
      </span>
      {hint ? (
        <span className="text-[10px] leading-tight text-slate-500">{hint}</span>
      ) : null}
    </>
  );

  const className = cn(
    "flex min-w-[5.25rem] shrink-0 flex-col gap-0.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
    tone === "ready" && "border-emerald-200/80 bg-emerald-50/60",
    tone === "warn" && "border-amber-200/80 bg-amber-50/50",
    tone === "danger" &&
      "border-rose-200/90 bg-rose-50/70 hover:bg-rose-50 hover:ring-1 hover:ring-rose-200/80",
    tone === "neutral" && "border-slate-200/80 bg-slate-50/50",
  );

  if (href) {
    return (
      <Link href={href} scroll={false} className={className} role="listitem">
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
