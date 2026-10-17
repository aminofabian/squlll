"use client";

import { ChevronRight, LayoutGrid, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminMobileClassBarProps = {
  classLabel: string;
  streamName?: string | null;
  termName?: string | null;
  filledSlots?: number;
  totalSlots?: number;
  onRefresh?: () => void;
  onClassPickerClick?: () => void;
  className?: string;
};

export function AdminMobileClassBar({
  classLabel,
  streamName,
  termName,
  filledSlots = 0,
  totalSlots = 0,
  onRefresh,
  onClassPickerClick,
  className,
}: AdminMobileClassBarProps) {
  const fillPct =
    totalSlots > 0 ? Math.min(100, Math.round((filledSlots / totalSlots) * 100)) : 0;

  return (
    <div
      className={cn(
        "shrink-0 bg-[#f2f7f4] px-3 pb-2 pt-2 dark:bg-[#071411]",
        className,
      )}
    >
      <div className="overflow-hidden rounded-2xl border border-[#1a4d42]/10 bg-white shadow-[0_1px_2px_rgba(10,31,26,0.04),0_10px_28px_-22px_rgba(10,31,26,0.22)] dark:border-white/10 dark:bg-[#0c1a17]">
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={onClassPickerClick}
            disabled={!onClassPickerClick}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 text-left transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#246a59]/35",
              onClassPickerClick && "active:bg-[#f3f7f5] dark:active:bg-white/[0.03]",
            )}
            aria-label={
              onClassPickerClick
                ? `Change class, currently ${classLabel}`
                : classLabel
            }
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0a1f1a] text-white shadow-[0_2px_8px_rgba(10,31,26,0.15)] dark:bg-[#246a59]"
              aria-hidden
            >
              <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45 dark:text-white/40">
                Class timetable
                <span className="h-1 w-1 rounded-full bg-emerald-500" aria-hidden />
                <span className="text-emerald-600 dark:text-emerald-400">Live</span>
              </span>
              <span className="mt-1 block truncate text-[17px] font-semibold leading-tight tracking-[-0.025em] text-[#0a1f1a] dark:text-white">
                {classLabel}
                {streamName ? (
                  <span className="font-medium text-[#1a4d42]/55 dark:text-white/45">
                    {" "}· {streamName}
                  </span>
                ) : null}
              </span>
              <span className="mt-1 block truncate text-[11px] text-[#1a4d42]/55 dark:text-white/45">
                {termName ?? "Current term"}
                {totalSlots > 0
                  ? ` · ${filledSlots} of ${totalSlots} periods filled`
                  : ""}
              </span>
            </span>

            {onClassPickerClick ? (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f3f7f5] text-[#1a4d42]/55 dark:bg-white/5 dark:text-white/45">
                <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
              </span>
            ) : null}
          </button>

          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className="flex w-11 shrink-0 items-center justify-center border-l border-[#1a4d42]/8 text-[#1a4d42]/40 transition-colors active:bg-[#f3f7f5] dark:border-white/8 dark:text-white/35 dark:active:bg-white/5"
              aria-label="Refresh timetable"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={2} />
            </button>
          ) : null}
        </div>

        {totalSlots > 0 && filledSlots > 0 ? (
          <div className="border-t border-[#1a4d42]/8 px-4 py-2.5 dark:border-white/8">
            <div className="mb-1.5 flex items-center justify-between text-[10.5px]">
              <span className="font-medium text-[#1a4d42]/50 dark:text-white/40">
                Term progress
              </span>
              <span className="font-semibold tabular-nums text-[#0a1f1a] dark:text-white/80">
                {fillPct}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#1a4d42]/8 dark:bg-white/10">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-700 ease-out",
                  fillPct >= 75
                    ? "bg-emerald-500"
                    : fillPct >= 40
                      ? "bg-[#246a59]"
                      : "bg-amber-400",
                )}
                style={{ width: `${Math.max(fillPct, fillPct > 0 ? 5 : 0)}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
