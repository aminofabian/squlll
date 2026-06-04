"use client";

import Link from "next/link";
import { AlertCircle, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEES_BRAND } from "../lib/fees-ui";
import { feesPlansHref } from "../lib/feesRoutes";
import type { ClassLinksStats } from "../lib/feeAssignmentDisplay";

interface FeeAssignmentsSummaryProps {
  stats: ClassLinksStats;
}

export function FeeAssignmentsSummary({ stats }: FeeAssignmentsSummaryProps) {
  return (
    <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-3 py-3 sm:px-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Class links
          </p>
          <p className="text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">
            {stats.links} term link{stats.links === 1 ? "" : "s"}
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            Across{" "}
            <span className="font-medium text-slate-800">
              {stats.plans} fee structure{stats.plans === 1 ? "" : "s"}
            </span>
            {" · "}
            <span className="font-medium text-slate-800">
              {stats.gradesLinked}
            </span>{" "}
            class{stats.gradesLinked === 1 ? "" : "es"} linked
            {" · "}
            <span className="font-medium text-slate-800">
              {stats.students}
            </span>{" "}
            student{stats.students === 1 ? "" : "s"} on fee lines
          </p>
        </div>
        <Link
          href={feesPlansHref()}
          scroll={false}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm transition-colors hover:border-[#d4e8e2] hover:bg-[#e8f2ef]/60"
          style={{ color: FEES_BRAND.primary }}
        >
          <Link2 className="h-3.5 w-3.5" />
          Fee structures
        </Link>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:max-w-2xl">
        <MiniStat
          label="Ready to bill"
          value={String(stats.readyToBill)}
          tone="ready"
        />
        <MiniStat
          label="Needs students"
          value={String(stats.needsStudents)}
          tone={stats.needsStudents > 0 ? "warn" : "neutral"}
        />
        <MiniStat label="Line items" value={String(stats.feeItems)} />
        <MiniStat
          label="Active links"
          value={String(stats.activeLinks)}
          hint={
            stats.showInactive
              ? `${stats.inactiveLinks} inactive`
              : undefined
          }
        />
      </div>

      {stats.needsStudents > 0 ? (
        <div
          className={cn(
            "mt-2.5 flex items-start gap-2 rounded-lg border px-2.5 py-2 text-xs",
            "border-amber-200/90 bg-amber-50/90 text-amber-950",
          )}
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <p>
            <span className="font-semibold tabular-nums">
              {stats.needsStudents}
            </span>{" "}
            link{stats.needsStudents === 1 ? " has" : "s have"} classes assigned
            but no students yet. Link students or generate term invoices from{" "}
            <Link
              href={feesPlansHref()}
              scroll={false}
              className="font-semibold underline-offset-2 hover:underline"
              style={{ color: FEES_BRAND.primaryDark }}
            >
              Fee structures
            </Link>{" "}
            before billing.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "ready" | "warn";
  hint?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-2 py-1.5 text-center",
        tone === "ready" && "border-emerald-200/80 bg-emerald-50/50",
        tone === "warn" && "border-amber-200/80 bg-amber-50/50",
        tone === "neutral" && "border-slate-200/80 bg-white",
      )}
    >
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "text-xs font-bold tabular-nums",
          tone === "ready" && "text-emerald-900",
          tone === "warn" && "text-amber-900",
          tone === "neutral" && "text-slate-900",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[9px] text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
