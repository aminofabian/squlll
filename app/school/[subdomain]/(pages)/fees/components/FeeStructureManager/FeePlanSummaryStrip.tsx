"use client";

import { useMemo } from "react";
import {
  CalendarRange,
  CheckCircle2,
  CircleDollarSign,
  Link2,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcessedFeeStructure } from "./types";
import type { FeePlanCollectionStats } from "../../lib/feePlanCollection";
import { feePlanTermProgress } from "../../lib/feePlanSlug";
import { formatKes } from "../../lib/feePlanStats";

interface FeePlanSummaryStripProps {
  structure: ProcessedFeeStructure;
  linkedClassCount: number;
  collection?: FeePlanCollectionStats;
  className?: string;
}

function termTotal(
  structure: ProcessedFeeStructure,
  termId: string,
): number {
  const buckets = structure.termFeesMap?.[termId] ?? [];
  return buckets.reduce((sum, bucket) => sum + (bucket.totalAmount || 0), 0);
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = "slate",
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint: string;
  tone?: "slate" | "emerald" | "amber" | "rose";
}) {
  return (
    <div className="flex min-w-0 items-start gap-2 px-3 py-3">
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          tone === "emerald" && "bg-[#e8f2ef] text-[#246a59]",
          tone === "amber" && "bg-amber-50 text-amber-700",
          tone === "rose" && "bg-rose-50 text-rose-700",
          tone === "slate" && "bg-slate-50 text-slate-600",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-slate-900">
          {value}
        </p>
        <p className="mt-0.5 truncate text-[9px] text-slate-500">{hint}</p>
      </div>
    </div>
  );
}

export function FeePlanSummaryStrip({
  structure,
  linkedClassCount,
  collection,
  className,
}: FeePlanSummaryStripProps) {
  const summary = useMemo(() => {
    const terms = structure.terms ?? [];
    const totals = terms.map((term) => termTotal(structure, term.id));
    const fallbackBuckets = structure.buckets ?? [];
    const fallbackTotal = fallbackBuckets.reduce(
      (sum, bucket) => sum + (bucket.totalAmount || 0),
      0,
    );
    const yearTotal =
      totals.some((total) => total > 0)
        ? totals.reduce((sum, total) => sum + total, 0)
        : fallbackTotal * Math.max(terms.length, 1);
    const configured = totals.filter((total) => total > 0).length;
    const uniform =
      totals.length > 0 &&
      totals.every((total) => total > 0 && total === totals[0]);
    const progress = feePlanTermProgress(structure);
    return {
      yearTotal,
      termTotal: uniform ? totals[0] : null,
      termCount: terms.length,
      configured,
      totalTerms: progress.total,
      uniform,
    };
  }, [structure]);

  const hasBilling = collection?.hasBilling ?? false;
  const collectionPct = Math.round(collection?.collectionRate ?? 0);
  const classesLinked = linkedClassCount > 0;
  const termsReady =
    summary.totalTerms === 0 || summary.configured >= summary.totalTerms;

  const status = !classesLinked
    ? { label: "Link grades", value: "Not linked", tone: "amber" as const }
    : !termsReady
      ? {
          label: "Term coverage",
          value: `${summary.configured}/${summary.totalTerms} terms`,
          tone: "amber" as const,
        }
      : hasBilling
        ? {
            label: "Collected",
            value: `${collectionPct}%`,
            tone: "emerald" as const,
          }
        : { label: "Status", value: "Ready", tone: "emerald" as const };

  const statusHint = !classesLinked
    ? "Assign at least one class"
    : !termsReady
      ? "Finish the remaining terms"
      : hasBilling
        ? `${formatKes(collection?.totalCollected ?? 0)} collected`
        : "Terms and classes are set";

  return (
    <section
      aria-label="Fee plan summary"
      className={cn(
        "grid grid-cols-2 overflow-hidden rounded-xl border border-[#1a4d42]/12 bg-white sm:grid-cols-4 sm:divide-x sm:divide-[#1a4d42]/8",
        className,
      )}
    >
      <SummaryTile
        icon={Wallet}
        label="Annual total"
        value={formatKes(summary.yearTotal)}
        hint={`${summary.termCount} term${summary.termCount === 1 ? "" : "s"}`}
      />
      <SummaryTile
        icon={CalendarRange}
        label="Per term"
        value={summary.termTotal != null ? formatKes(summary.termTotal) : "Varies"}
        hint={summary.uniform ? "Same every term" : "Different by term"}
      />
      <SummaryTile
        icon={Link2}
        label="Classes linked"
        value={String(linkedClassCount)}
        hint={classesLinked ? "On this fee plan" : "No classes yet"}
        tone={classesLinked ? "emerald" : "amber"}
      />
      <SummaryTile
        icon={hasBilling ? CircleDollarSign : CheckCircle2}
        label={status.label}
        value={status.value}
        hint={statusHint}
        tone={status.tone}
      />
    </section>
  );
}
