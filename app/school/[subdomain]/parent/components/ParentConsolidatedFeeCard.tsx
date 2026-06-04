"use client";

import { DollarSign, RefreshCw, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatParentPaymentStatus,
  parentPaymentStatusBadgeClass,
  type ParentConsolidatedFees,
} from "@/lib/parent/parentFees";
import { cn } from "@/lib/utils";
import { portalPanel, portalSectionLabel } from "./parent-portal-ui";

interface ParentConsolidatedFeeCardProps {
  summary: ParentConsolidatedFees | null;
  loading?: boolean;
  onRefresh?: () => void;
  onSelectChild?: (studentId: string) => void;
  onPayFees?: () => void;
}

export function ParentConsolidatedFeeCard({
  summary,
  loading,
  onRefresh,
  onSelectChild,
  onPayFees,
}: ParentConsolidatedFeeCardProps) {
  if (!summary && !loading) return null;

  const multipleChildren = (summary?.children.length ?? 0) > 1;
  const progress =
    summary && summary.totalBilled > 0
      ? Math.min(
          100,
          Math.round((summary.totalPaid / summary.totalBilled) * 100),
        )
      : 0;

  return (
    <div
      className={cn(
        portalPanel,
        "border-emerald-200/60 bg-gradient-to-br from-emerald-50/50 to-white dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-slate-900/30",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100/80 px-5 py-3.5 dark:border-emerald-900/30">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {multipleChildren ? "Household fees" : "Fee summary"}
            </h3>
            <p className="text-xs text-slate-500">
              {multipleChildren
                ? "Combined balance across your children"
                : "Billed, paid, and outstanding amounts"}
            </p>
          </div>
          {multipleChildren ? (
            <Users className="h-4 w-4 text-slate-400" aria-hidden />
          ) : null}
        </div>
        {onRefresh ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh fees"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        ) : null}
      </div>

      <div className="space-y-4 px-5 py-4">
        {loading && !summary ? (
          <p className="text-sm text-slate-500">Loading fees…</p>
        ) : summary ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FeeMetric label="Total billed" value={formatCurrency(summary.totalBilled)} />
              <FeeMetric
                label="Paid"
                value={formatCurrency(summary.totalPaid)}
                valueClassName="text-emerald-700 dark:text-emerald-400"
              />
              <FeeMetric
                label="Outstanding"
                value={formatCurrency(summary.totalOutstanding)}
                valueClassName="text-amber-700 dark:text-amber-400"
              />
            </div>

            {summary.totalBilled > 0 ? (
              <div>
                <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                  <span>Payment progress</span>
                  <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">
                    {progress}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-emerald-100/80 dark:bg-emerald-950/40">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : null}

            {summary.totalCredit > 0 ? (
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Credit balance: {formatCurrency(summary.totalCredit)}
              </p>
            ) : null}

            {summary.totalOutstanding > 0 && onPayFees ? (
              <Button
                type="button"
                size="sm"
                className="h-9 w-full gap-2 text-xs shadow-sm"
                onClick={onPayFees}
              >
                <Wallet className="h-3.5 w-3.5" />
                Record payment · {formatCurrency(summary.totalOutstanding)}
              </Button>
            ) : summary.totalOutstanding <= 0 && summary.totalBilled > 0 ? (
              <p className="rounded-lg border border-emerald-200/60 bg-emerald-50/50 px-3 py-2 text-center text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                All household fees are up to date.
              </p>
            ) : null}

            {multipleChildren ? (
              <div className="space-y-2 border-t border-emerald-100/80 pt-3 dark:border-emerald-900/30">
                <p className={portalSectionLabel}>Per child</p>
                {summary.children.map((child) => (
                  <button
                    key={child.studentId}
                    type="button"
                    onClick={() => {
                      onSelectChild?.(child.studentId)
                      if (child.outstanding > 0) onPayFees?.()
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200/60 bg-white/90 px-3 py-2.5 text-left text-sm transition hover:border-primary/30 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {child.studentName ?? "Child"}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        className={cn(
                          "text-[10px] font-normal",
                          parentPaymentStatusBadgeClass(child.paymentStatus),
                        )}
                      >
                        {formatParentPaymentStatus(child.paymentStatus)}
                      </Badge>
                      <span className="text-sm font-semibold tabular-nums text-amber-700 dark:text-amber-400">
                        {formatCurrency(child.outstanding)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

function FeeMetric({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white/80 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/40">
      <p className={portalSectionLabel}>{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}
