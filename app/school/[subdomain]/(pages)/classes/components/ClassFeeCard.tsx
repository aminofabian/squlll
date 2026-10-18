"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatKes, type FeeHealth } from "../utils/classPulse";

interface ClassFeeCardProps {
  health: FeeHealth;
  feesHref: string;
  isLoading?: boolean;
  className?: string;
}

export function ClassFeeCard({
  health,
  feesHref,
  isLoading = false,
  className,
}: ClassFeeCardProps) {
  const percent = Math.round(health.collectionRate * 100);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-[#1a4d42]/12 bg-white shadow-[0_1px_2px_rgba(10,31,26,0.04)] dark:border-white/10 dark:bg-[#0c1a17]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#1a4d42]/10 px-3.5 py-3 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
            <CircleDollarSign className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-sm tracking-tight text-[#0a1f1a] dark:text-white">
              Fee health
            </h3>
            <p className="text-[10px] text-[#1a4d42]/50 dark:text-white/40">
              {health.studentCount} learner{health.studentCount === 1 ? "" : "s"} billed
            </p>
          </div>
        </div>
        <Link
          href={feesHref}
          className="inline-flex items-center gap-0.5 rounded-md border border-[#1a4d42]/12 px-2 py-1 text-[10px] font-semibold text-[#1a4d42]/60 transition-colors hover:border-[#246a59]/35 hover:text-[#246a59] dark:border-white/10 dark:text-white/50"
        >
          Fees
          <ArrowUpRight className="h-2.5 w-2.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-[11px] text-[#1a4d42]/45 dark:text-white/40">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading fee snapshot…
        </div>
      ) : !health.hasData ? (
        <div className="px-3.5 py-8 text-center">
          <p className="text-[12px] font-semibold text-[#0a1f1a] dark:text-white">
            No fee structure yet
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-[#1a4d42]/50 dark:text-white/40">
            Assign a fee structure to this level to see collection health.
          </p>
          <Link
            href={feesHref}
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#0a1f1a] px-2.5 py-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#246a59]"
          >
            Set up fees
            <ArrowUpRight className="h-2.5 w-2.5" />
          </Link>
        </div>
      ) : (
        <div className="px-3.5 py-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45 dark:text-white/35">
                Collected
              </p>
              <p className="mt-0.5 text-2xl font-semibold leading-none tracking-tight tabular-nums text-[#0a1f1a] dark:text-white">
                {percent}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] tabular-nums text-[#246a59] dark:text-[#8fe3c8]">
                {formatKes(health.paid)} paid
              </p>
              <p className="text-[10px] tabular-nums text-amber-700 dark:text-amber-300">
                {formatKes(health.balance)} outstanding
              </p>
            </div>
          </div>

          <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-[#e8f2ef] dark:bg-white/10">
            <span
              className="h-full bg-emerald-500 transition-[width] duration-500"
              style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
            />
            <span className="h-full flex-1 bg-amber-400/90 dark:bg-amber-500/80" />
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-[#1a4d42]/50 dark:text-white/40">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span className="tabular-nums">{health.cleared}</span> cleared
            </span>
            <span className="inline-flex items-center gap-1">
              <TriangleAlert className="h-3 w-3 text-amber-500" />
              <span className="tabular-nums">{health.owing}</span> with balance
            </span>
            <span className="tabular-nums">{formatKes(health.billed)} billed</span>
          </div>

          {health.topDebtors.length > 0 ? (
            <div className="mt-3 border-t border-[#1a4d42]/8 pt-2 dark:border-white/8">
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/40 dark:text-white/30">
                Largest balances
              </p>
              <ul className="space-y-1">
                {health.topDebtors.map((debtor) => (
                  <li
                    key={debtor.admissionNumber}
                    className="flex items-center justify-between gap-2 text-[10px]"
                  >
                    <span className="min-w-0 truncate text-[#1a4d42]/65 dark:text-white/55">
                      {debtor.name}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-amber-700 dark:text-amber-300">
                      {formatKes(debtor.balance)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
