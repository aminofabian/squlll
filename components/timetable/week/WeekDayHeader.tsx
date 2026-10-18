"use client";

import { cn } from "@/lib/utils";
import { DAY_SHORT_NAMES } from "@/lib/timetable/constants";
import type { WeekDayDate } from "@/lib/timetable/weekView/getWeekDayDates";

type WeekDayHeaderProps = {
  date: WeekDayDate;
  lessonCount: number;
  isToday: boolean;
};

function lessonCountLabel(count: number): string {
  return count === 1 ? "1 class" : `${count} classes`;
}

export function WeekDayHeader({
  date,
  lessonCount,
  isToday,
}: WeekDayHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-center gap-1.5 rounded-md px-2 py-1.5",
        isToday ? "bg-[#0a2620] text-white" : "text-[#0a1f1a] dark:text-white",
      )}
    >
      <span
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.16em]",
          isToday ? "text-[#f0dfb8]" : "text-[#1a4d42]/80 dark:text-white/65",
        )}
      >
        {DAY_SHORT_NAMES[date.dayOfWeek]}
      </span>
      <span className="font-display text-[20px] leading-none tracking-[-0.03em]">
        {date.dayOfMonth}
      </span>
      <span
        className={cn(
          "truncate text-[11px] font-medium",
          isToday ? "text-white/75" : "text-[#1a4d42]/75 dark:text-white/60",
        )}
      >
        · {lessonCountLabel(lessonCount)}
      </span>
    </div>
  );
}
