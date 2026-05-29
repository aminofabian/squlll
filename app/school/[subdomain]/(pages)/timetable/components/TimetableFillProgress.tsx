"use client";

import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";

interface TimetableFillProgressProps {
  filled: number;
  total: number;
  className?: string;
  onAddSeveralLessons?: () => void;
  onDuplicateDay?: () => void;
}

export function TimetableFillProgress({
  filled,
  total,
  className,
  onAddSeveralLessons,
  onDuplicateDay,
}: TimetableFillProgressProps) {
  if (total <= 0) return null;

  const pct = Math.min(100, Math.round((filled / total) * 100));

  return (
    <div className={cn(tt.panel, "px-4 py-3", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className={tt.label}>Completion</p>
        <p className="text-[12px] font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
          {filled} / {total} slots ({pct}%)
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            pct >= 80
              ? "bg-emerald-500"
              : pct >= 40
                ? "bg-zinc-700 dark:bg-zinc-300"
                : "bg-amber-500/90",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct < 100 && (
        <p className="text-[11px] text-slate-500 mt-2">
          Tap empty boxes on the grid to add lessons, or use shortcuts below.
        </p>
      )}
      {(onAddSeveralLessons || onDuplicateDay) && pct < 100 && (
        <div className="flex flex-wrap gap-2 mt-2.5">
          {onAddSeveralLessons && (
            <button
              type="button"
              onClick={onAddSeveralLessons}
              className="text-[11px] font-medium text-primary hover:underline"
            >
              Add several lessons
            </button>
          )}
          {onAddSeveralLessons && onDuplicateDay && (
            <span className="text-slate-300">·</span>
          )}
          {onDuplicateDay && (
            <button
              type="button"
              onClick={onDuplicateDay}
              className="text-[11px] font-medium text-primary hover:underline"
            >
              Copy one day to others
            </button>
          )}
        </div>
      )}
    </div>
  );
}
