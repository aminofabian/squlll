"use client";

import { cn } from "@/lib/utils";
import { DAY_SHORT_NAMES } from "@/lib/timetable/constants";
import type { WeekDayDate } from "../lib/getWeekDayDates";

type TeacherWeekDayHeaderProps = {
  date: WeekDayDate;
  lessonCount: number;
  isToday: boolean;
};

function lessonCountLabel(count: number): string {
  if (count === 0) return "No classes";
  return count === 1 ? "1 class" : `${count} classes`;
}

export function TeacherWeekDayHeader({
  date,
  lessonCount,
  isToday,
}: TeacherWeekDayHeaderProps) {
  return (
    <div
      className={cn(
        "relative mx-1 flex flex-col items-center rounded-2xl px-2 pb-2.5 pt-2 transition-colors",
        isToday
          ? "bg-[#0a2620] text-white shadow-[0_14px_28px_-18px_rgba(10,38,32,0.9)]"
          : "text-[#0a1f1a] dark:text-white",
      )}
    >
      <span
        className={cn(
          "text-[9.5px] font-semibold uppercase tracking-[0.24em]",
          isToday ? "text-[#d9c49a]" : "text-[#1a4d42]/45 dark:text-white/40",
        )}
      >
        {isToday ? "Today" : DAY_SHORT_NAMES[date.dayOfWeek]}
      </span>
      <span className="mt-1 font-display text-[28px] leading-none tracking-[-0.03em]">
        {date.dayOfMonth}
      </span>
      <span
        className={cn(
          "mt-1.5 text-[10px] font-medium",
          isToday ? "text-white/55" : "text-[#1a4d42]/40 dark:text-white/35",
        )}
      >
        {isToday ? DAY_SHORT_NAMES[date.dayOfWeek] : date.monthShort} ·{" "}
        {lessonCountLabel(lessonCount)}
      </span>
    </div>
  );
}
