"use client";

import { cn } from "@/lib/utils";

type TimetableStatusMeterProps = {
  filled: number;
  total: number;
  className?: string;
};

export function TimetableStatusMeter({
  filled,
  total,
  className,
}: TimetableStatusMeterProps) {
  if (total <= 0) return null;
  const pct = Math.min(100, Math.round((filled / total) * 100));

  return (
    <div
      className={cn("flex min-w-0 items-center gap-2", className)}
      title={`${filled} of ${total} lesson periods scheduled`}
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
            pct >= 85
              ? "bg-emerald-500"
              : pct > 0
                ? "bg-[#246a59]"
                : "bg-transparent",
          )}
          style={{ width: `${Math.max(pct, filled > 0 ? 4 : 0)}%` }}
        />
      </div>
      <span className="whitespace-nowrap text-[11px] font-medium tabular-nums text-[#1a4d42]/65 dark:text-white/55">
        {pct}%
        <span className="ml-1 hidden font-normal text-[#1a4d42]/40 xl:inline dark:text-white/35">
          {filled}/{total}
        </span>
      </span>
    </div>
  );
}
