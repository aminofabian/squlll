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

function StatChip({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center px-1 py-3 text-center">
      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span
        className={cn(
          "mt-1 truncate text-[15px] font-semibold tabular-nums leading-none tracking-[-0.02em]",
          accent
            ? "text-[#0073ea] dark:text-[#5ba3ff]"
            : "text-slate-900 dark:text-slate-100",
        )}
      >
        {value}
      </span>
      {hint ? (
        <span className="mt-1.5 truncate text-[10px] leading-none text-slate-400 dark:text-slate-500">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

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
    totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;
  const hasFillStats = totalSlots > 0;
  const scopeHint =
    streamName?.trim() ||
    (hasFillStats ? `${filledSlots} of ${totalSlots} slots` : null);

  const pickerBody = (
    <>
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          "bg-[#0073ea]/10 text-[#0073ea]",
        )}
        aria-hidden
      >
        <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>

      <span className="min-w-0 flex-1 pr-1">
        <span className="block truncate text-[16px] font-semibold leading-tight tracking-[-0.02em] text-slate-900 dark:text-slate-50">
          {classLabel}
        </span>
        {scopeHint ? (
          <span className="mt-1 block truncate text-[12px] leading-snug text-slate-500 dark:text-slate-400">
            {scopeHint}
          </span>
        ) : null}
        {onClassPickerClick ? (
          <span className="mt-1 block text-[12px] font-medium text-[#0073ea]">
            Choose a class
          </span>
        ) : null}
      </span>

      {onClassPickerClick ? (
        <span
          className="flex shrink-0 items-center pt-0.5 text-slate-400 dark:text-slate-500"
          aria-hidden
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
          </span>
        </span>
      ) : null}
    </>
  );

  return (
    <div
      className={cn(
        "shrink-0 bg-[#f4f6f9] px-4 pb-4 pt-3 dark:bg-slate-950",
        className,
      )}
    >
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-slate-200/80 bg-white",
          "dark:border-slate-800 dark:bg-slate-900/60",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
            Viewing
          </span>
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors",
                "hover:bg-slate-100 hover:text-slate-600 active:scale-95",
                "dark:hover:bg-slate-800 dark:hover:text-slate-300",
              )}
              aria-label="Refresh timetable"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          ) : null}
        </div>

        <div className="px-3 py-3">
          {onClassPickerClick ? (
            <button
              type="button"
              onClick={onClassPickerClick}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl px-1 py-1 text-left",
                "transition-colors active:bg-slate-50 dark:active:bg-slate-800/50",
              )}
              aria-label={`Choose a class, currently ${classLabel}`}
            >
              {pickerBody}
            </button>
          ) : (
            <div className="flex items-start gap-3 px-1 py-1">{pickerBody}</div>
          )}
        </div>

        {(termName || hasFillStats) && (
          <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
            <StatChip
              label="Term"
              value={termName?.replace(/^Term\s/i, "T") ?? "—"}
              hint={termName && termName.length > 8 ? termName : undefined}
            />
            <StatChip
              label="Slots filled"
              value={hasFillStats ? String(filledSlots) : "—"}
              hint={hasFillStats ? `of ${totalSlots}` : undefined}
            />
            <StatChip
              label="Fill rate"
              value={hasFillStats ? `${fillPct}%` : "—"}
              accent={hasFillStats && fillPct > 0}
            />
          </div>
        )}

        {hasFillStats ? (
          <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Term progress
              </span>
              <span className="text-[11px] font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                {filledSlots}
                <span className="font-normal text-slate-400 dark:text-slate-500">
                  {" "}
                  / {totalSlots}
                </span>
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out",
                    fillPct >= 75
                      ? "bg-emerald-500 dark:bg-emerald-400"
                      : fillPct >= 40
                        ? "bg-[#0073ea]"
                        : "bg-amber-400 dark:bg-amber-500",
                )}
                style={{ width: `${Math.max(fillPct, fillPct > 0 ? 4 : 0)}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
