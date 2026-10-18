"use client";

import { cn } from "@/lib/utils";
import { DAY_SHORT_NAMES } from "@/lib/timetable/constants";
import type { WeekDayDate } from "@/lib/timetable/weekView/getWeekDayDates";

type WeekDayStripProps = {
  dayDates: WeekDayDate[];
  periodCounts: Record<number, number>;
  selectedDay: number;
  focusDayOfWeek: number;
  focusLabel: string;
  onSelect: (dayOfWeek: number) => void;
};

function dayButtonClass(isSelected: boolean, isFocusDay: boolean): string {
  if (isSelected) return "border-[#111a17] bg-[#111a17] text-white dark:border-white dark:bg-white dark:text-[#111a17]";
  if (isFocusDay) return "border-[#f1dba0] bg-[#fdf4dc] text-[#111a16] dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-white";
  return "border-[#e3e7e1] bg-white text-[#111a16] dark:border-white/10 dark:bg-white/[0.04] dark:text-white";
}

export function WeekDayStrip({ dayDates, periodCounts, selectedDay, focusDayOfWeek, focusLabel, onSelect }: WeekDayStripProps) {
  return (
    <div role="tablist" aria-label="Day of the week" className="grid grid-cols-5 gap-1.5">
      {dayDates.map(({ dayOfWeek, dayOfMonth }) => {
        const isSelected = dayOfWeek === selectedDay;
        const isFocusDay = dayOfWeek === focusDayOfWeek;
        const count = periodCounts[dayOfWeek] ?? 0;
        return (
          <button
            key={dayOfWeek}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-label={`${DAY_SHORT_NAMES[dayOfWeek]} ${dayOfMonth}, ${count} periods${isFocusDay ? `, ${focusLabel}` : ""}`}
            onClick={() => onSelect(dayOfWeek)}
            className={cn(
              "flex flex-col items-center rounded-xl border py-2 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111a17] focus-visible:ring-offset-1",
              dayButtonClass(isSelected, isFocusDay),
            )}
          >
            <span className={cn("text-[10.5px] font-bold uppercase tracking-[0.08em]", !isSelected && "text-[#5b6862] dark:text-white/60")}>
              {DAY_SHORT_NAMES[dayOfWeek]}
            </span>
            <span className="text-[19px] font-bold leading-tight">{dayOfMonth}</span>
            <span className={cn("text-[10.5px]", isSelected ? "text-white/75 dark:text-[#111a17]/70" : "text-[#5b6862] dark:text-white/60")}>
              {count} {count === 1 ? "period" : "periods"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
