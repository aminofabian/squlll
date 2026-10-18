"use client";

import { cn } from "@/lib/utils";
import { DAY_SHORT_NAMES } from "@/lib/timetable/constants";
import type { WeekDayDate } from "@/lib/timetable/weekView/getWeekDayDates";

function periodCountLabel(count: number): string {
  if (count === 0) return "No periods";
  return count === 1 ? "1 period" : `${count} periods`;
}

type WeekDayHeaderProps = {
  date: WeekDayDate;
  periodCount: number;
  isBusiest: boolean;
  /** "Today" / "Tomorrow" pill for the highlighted day. */
  focusLabel: string | null;
};

export function WeekDayHeader({ date, periodCount, isBusiest, focusLabel }: WeekDayHeaderProps) {
  return (
    <div className="px-2 pb-2 pt-1.5">
      <div className="flex items-center gap-1.5">
        <span className={cn("text-[11px] font-bold uppercase tracking-[0.08em]", focusLabel ? "text-[#111a16] dark:text-white" : "text-[#5b6862] dark:text-white/60")}>
          {DAY_SHORT_NAMES[date.dayOfWeek]}
        </span>
        {focusLabel ? (
          <span className="rounded-full bg-[#fbe2a6] px-1.5 py-[1px] text-[10px] font-bold text-[#6a4a0c]">{focusLabel}</span>
        ) : null}
      </div>
      <p className="mt-0.5 text-[24px] font-bold leading-none tracking-[-0.02em] text-[#111a16] dark:text-white">{date.dayOfMonth}</p>
      <p className={cn("mt-1 text-[11px]", isBusiest ? "font-semibold text-[#111a16] dark:text-white" : "text-[#5b6862] dark:text-white/60")}>
        {periodCountLabel(periodCount)}
        {isBusiest ? " · busiest" : ""}
      </p>
    </div>
  );
}
