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
          "text-[9.5px] font-semibold uppercase tracking-[0.2em]",
          isToday ? "text-[#d9c49a]" : "text-[#1a4d42]/45 dark:text-white/40",
        )}
      >
        {DAY_SHORT_NAMES[date.dayOfWeek]}
      </span>
      <span className="font-display text-[19px] leading-none tracking-[-0.03em]">
        {date.dayOfMonth}
      </span>
      <span
        className={cn(
          "truncate text-[9.5px] font-medium",
          isToday ? "text-white/55" : "text-[#1a4d42]/40 dark:text-white/35",
        )}
      >
        · {lessonCountLabel(lessonCount)}
      </span>
    </div>
  );
}
