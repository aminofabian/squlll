"use client";

import { cn } from "@/lib/utils";
import { DAY_NAMES } from "@/lib/timetable/constants";
import type { WeekDayDate } from "@/lib/timetable/weekView/getWeekDayDates";

const DAY_INITIALS: Record<number, string> = { 1: "M", 2: "T", 3: "W", 4: "T", 5: "F" };
const MIN_VISIBLE_BAR_PERCENT = 12;
const PERCENT = 100;

type WeekRhythmCardProps = {
  dayDates: WeekDayDate[];
  lessonCounts: Record<number, number>;
  currentDayOfWeek: number | null;
};

export function WeekRhythmCard({ dayDates, lessonCounts, currentDayOfWeek }: WeekRhythmCardProps) {
  const counts = dayDates.map((d) => lessonCounts[d.dayOfWeek] ?? 0);
  const busiest = Math.max(...counts, 1);
  const hasSingleBusiestDay = counts.filter((count) => count === busiest).length === 1;
  const busiestDay = hasSingleBusiestDay ? dayDates[counts.indexOf(busiest)] : undefined;

  return (
    <section className="rounded-xl border border-[#1a4d42]/10 bg-[#fffdf8] px-4 py-3 dark:border-white/10 dark:bg-[#0c1a17]">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1a4d42]/85 dark:text-white/70">Week rhythm</p>
        {busiestDay ? (
          <p className="text-[11px] text-[#1a4d42]/80 dark:text-white/65">
            Busiest: <span className="font-semibold text-[#0a1f1a] dark:text-white">{DAY_NAMES[busiestDay.dayOfWeek]}</span>
          </p>
        ) : null}
      </div>
      <div className="mt-2.5 flex h-16 items-end gap-1.5">
        {dayDates.map((date, index) => (
          <RhythmBar
            key={date.dayOfWeek}
            initial={DAY_INITIALS[date.dayOfWeek]}
            count={counts[index]}
            heightPercent={counts[index] > 0 ? Math.max((counts[index] / busiest) * PERCENT, MIN_VISIBLE_BAR_PERCENT) : 0}
            isToday={date.dayOfWeek === currentDayOfWeek}
          />
        ))}
      </div>
    </section>
  );
}

function RhythmBar({ initial, count, heightPercent, isToday }: { initial: string; count: number; heightPercent: number; isToday: boolean }) {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col items-center gap-1">
      <div className="relative flex w-full flex-1 items-end overflow-hidden rounded-md bg-[#1a4d42]/[0.05] dark:bg-white/[0.05]">
        <div
          className={cn(
            "relative w-full rounded-md transition-[height] duration-500",
            isToday ? "bg-gradient-to-t from-[#0a2620] to-[#246a59]" : "bg-gradient-to-t from-[#246a59]/45 to-[#9dcec1]/45",
          )}
          style={{ height: `${heightPercent}%` }}
        >
          {isToday ? <span aria-hidden className="absolute inset-x-1 top-0.5 h-[2px] rounded-full bg-[#d9c49a]" /> : null}
        </div>
        <span
          className={cn(
            "absolute inset-x-0 top-1 text-center text-[11px] font-semibold tabular-nums",
            isToday && heightPercent > 60 ? "text-white/85" : "text-[#1a4d42]/85 dark:text-white/70",
          )}
        >
          {count}
        </span>
      </div>
      <span className={cn("text-[11px] font-semibold", isToday ? "text-[#7d5a22] dark:text-[#e5cf9f]" : "text-[#1a4d42]/80 dark:text-white/65")}>
        {initial}
      </span>
    </div>
  );
}
