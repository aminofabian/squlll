"use client";

import { cn } from "@/lib/utils";
import { formatTimeRange } from "@/lib/timetable/weekView/formatTimeRange";

type WeekTimeRailProps = {
  /** Period number, or null for break rows. */
  periodNumber: number | null;
  startTime?: string;
  endTime?: string;
  isCurrent?: boolean;
  /** Period has no lessons all week. */
  isEmpty?: boolean;
};

export function WeekTimeRail({ periodNumber, startTime, endTime, isCurrent = false, isEmpty = false }: WeekTimeRailProps) {
  const range = startTime && endTime ? formatTimeRange(startTime, endTime) : "";

  if (periodNumber == null) {
    return (
      <div className="flex h-full items-center whitespace-nowrap pl-2 text-[11px] tabular-nums text-[#5b6862] dark:text-white/60">
        {range}
      </div>
    );
  }

  return (
    <div className={cn("relative flex h-full flex-col justify-center pl-2", isEmpty && "opacity-50")}>
      <span className="flex items-center gap-1.5 text-[15px] font-bold leading-none text-[#111a16] dark:text-white">
        {periodNumber}
        {isCurrent ? <span aria-label="current period" className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> : null}
      </span>
      {range ? <span className="mt-0.5 whitespace-nowrap text-[11px] tabular-nums text-[#5b6862] dark:text-white/60">{range}</span> : null}
    </div>
  );
}
