"use client";

import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";
import { getTimetableReadiness } from "../utils/getTimetableReadiness";

type TimetableStatusMeterProps = {
  filled: number;
  total: number;
  /** Clashes force the meter red even when the grid is nearly full. */
  clashCount?: number;
  className?: string;
};

export function TimetableStatusMeter({
  filled,
  total,
  clashCount = 0,
  className,
}: TimetableStatusMeterProps) {
  if (total <= 0) return null;
  const { fillPct: pct, verdict } = getTimetableReadiness({
    hasScheduleStructure: true,
    hasAnyLessons: filled > 0,
    filledSlots: filled,
    totalSlots: total,
    clashCount,
  });

  return (
    <div
      className={cn("flex min-w-0 items-center gap-2", className)}
      title={
        clashCount > 0
          ? `${filled} of ${total} lesson periods scheduled · ${clashCount} clash${clashCount === 1 ? "" : "es"}`
          : `${filled} of ${total} lesson periods scheduled`
      }
    >
      <div
        className="h-1 w-16 overflow-hidden bg-[#1a4d42]/10 dark:bg-white/10 sm:w-20"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${filled} of ${total} slots filled`}
      >
        <div
          className={cn(
            "h-full transition-[width]",
            verdict === "clashes"
              ? "bg-red-500"
              : verdict === "ready"
                ? "bg-emerald-500"
                : filled > 0
                  ? "bg-[#246a59]"
                  : "bg-transparent",
          )}
          style={{ width: `${Math.max(pct, filled > 0 ? 4 : 0)}%` }}
        />
      </div>
      <span
        className={cn(
          tt.text.caption,
          tt.numeral,
          tt.ink.base,
          "whitespace-nowrap font-medium",
        )}
      >
        {pct}%
        {clashCount > 0 ? (
          <span className="ml-1 font-normal text-red-500">
            · {clashCount} clash{clashCount === 1 ? "" : "es"}
          </span>
        ) : null}
        <span
          className={cn(
            tt.numeral,
            tt.ink.faint,
            "ml-1 hidden font-normal xl:inline",
          )}
        >
          {filled}/{total}
        </span>
      </span>
    </div>
  );
}
