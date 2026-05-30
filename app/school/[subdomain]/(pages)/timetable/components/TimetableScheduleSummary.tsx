"use client";

import { Clock, Coffee, Calendar } from "lucide-react";
import { tt } from "../utils/timetableTheme";
import { cn } from "@/lib/utils";

interface TimetableScheduleSummaryProps {
  periodCount: number;
  dayCount: number;
  breakCount: number;
}

export function TimetableScheduleSummary({
  periodCount,
  dayCount,
  breakCount,
}: TimetableScheduleSummaryProps) {
  return (
    <div className={cn(tt.panelMuted, "px-4 py-3")}>
      <p className={cn(tt.body, "mb-3 text-[13px]")}>
        School day is configured. Pick a class below to add lessons.
      </p>
      <dl className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-zinc-200/80 bg-white px-2 py-2.5 dark:border-zinc-700 dark:bg-zinc-900/60">
          <Clock className="mx-auto mb-1 h-3.5 w-3.5 text-zinc-400" />
          <dt className={tt.label}>Periods</dt>
          <dd className="mt-0.5 text-[15px] font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {periodCount}
          </dd>
        </div>
        <div className="rounded-lg border border-zinc-200/80 bg-white px-2 py-2.5 dark:border-zinc-700 dark:bg-zinc-900/60">
          <Calendar className="mx-auto mb-1 h-3.5 w-3.5 text-zinc-400" />
          <dt className={tt.label}>Days</dt>
          <dd className="mt-0.5 text-[15px] font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {dayCount}
          </dd>
        </div>
        <div className="rounded-lg border border-zinc-200/80 bg-white px-2 py-2.5 dark:border-zinc-700 dark:bg-zinc-900/60">
          <Coffee className="mx-auto mb-1 h-3.5 w-3.5 text-zinc-400" />
          <dt className={tt.label}>Breaks</dt>
          <dd className="mt-0.5 text-[15px] font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {breakCount}
          </dd>
        </div>
      </dl>
    </div>
  );
}
