"use client";

import { cn } from "@/lib/utils";
import { DAY_NAMES, DAY_SHORT_NAMES } from "@/lib/timetable/constants";
import type { WeekDayDate } from "@/lib/timetable/weekView/getWeekDayDates";
import { WEEK_CARD_CLASS } from "./weekCardClass";

const BAR_MAX_PX = 52;
const BAR_MIN_PX = 6;

type WeekPeriodsPerDayCardProps = {
  dayDates: WeekDayDate[];
  periodCounts: Record<number, number>;
  busiestDay: number | null;
};

export function WeekPeriodsPerDayCard({ dayDates, periodCounts, busiestDay }: WeekPeriodsPerDayCardProps) {
  const maxCount = Math.max(1, ...dayDates.map((d) => periodCounts[d.dayOfWeek] ?? 0));

  return (
    <section className={`${WEEK_CARD_CLASS} p-4`}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[14px] font-bold text-[#111a16] dark:text-white">Periods per day</h3>
        {busiestDay ? (
          <p className="text-[11.5px] text-[#5b6862] dark:text-white/60">{DAY_NAMES[busiestDay]} is busiest</p>
        ) : null}
      </div>
      <ul className="mt-3 flex items-end gap-2">
        {dayDates.map(({ dayOfWeek }) => {
          const count = periodCounts[dayOfWeek] ?? 0;
          const isBusiest = dayOfWeek === busiestDay;
          const height = Math.max(BAR_MIN_PX, Math.round((count / maxCount) * BAR_MAX_PX));
          return (
            <li key={dayOfWeek} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[11.5px] font-bold tabular-nums text-[#111a16] dark:text-white">{count}</span>
              <span
                aria-hidden
                className={cn("w-full rounded-md", isBusiest ? "bg-[#111a17] dark:bg-white" : "bg-[#cfdcd5] dark:bg-white/15")}
                style={{ height }}
              />
              <span className={cn("text-[11.5px]", isBusiest ? "font-bold text-[#111a16] dark:text-white" : "text-[#5b6862] dark:text-white/60")}>
                {DAY_SHORT_NAMES[dayOfWeek]}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
