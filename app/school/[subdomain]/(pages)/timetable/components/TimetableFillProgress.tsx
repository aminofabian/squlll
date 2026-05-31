"use client";

import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";

interface TimetableFillProgressProps {
  filled: number;
  total: number;
  className?: string;
}

export function TimetableFillProgress({
  filled,
  total,
  className,
}: TimetableFillProgressProps) {
  if (total <= 0) return null;

  const pct = Math.min(100, Math.round((filled / total) * 100));

  return (
    <div className={cn(tt.panel, "px-4 py-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className={tt.label}>Completion</p>
        <p className="text-[12px] font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
          {filled} / {total} ({pct}%)
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
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
    </div>
  );
}
