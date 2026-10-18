"use client";

import { cn } from "@/lib/utils";
import { DAY_NAMES } from "@/lib/timetable/constants";
import type { WeekDayDate } from "../lib/getWeekDayDates";

const DAY_INITIALS: Record<number, string> = { 1: "M", 2: "T", 3: "W", 4: "T", 5: "F" };
const MIN_VISIBLE_BAR_PERCENT = 12;
const PERCENT = 100;

type TeacherWeekRhythmCardProps = {
  dayDates: WeekDayDate[];
  lessonCounts: Record<number, number>;
  currentDayOfWeek: number | null;
};

export function TeacherWeekRhythmCard({ dayDates, lessonCounts, currentDayOfWeek }: TeacherWeekRhythmCardProps) {
  const counts = dayDates.map((d) => lessonCounts[d.dayOfWeek] ?? 0);
  const busiest = Math.max(...counts, 1);
  const busiestDay = counts.some((count) => count > 0) ? dayDates[counts.indexOf(busiest)] : undefined;

  return (
    <section className="rounded-[24px] bg-[#fffdf8] px-5 py-5 shadow-[0_24px_50px_-42px_rgba(10,38,32,0.55)] ring-1 ring-[#1a4d42]/10 dark:bg-[#0c1a17] dark:ring-white/10">
      <div className="flex items-baseline justify-between">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.24em] text-[#1a4d42]/45 dark:text-white/40">Week rhythm</p>
        {busiestDay ? (
          <p className="text-[10.5px] text-[#1a4d42]/50 dark:text-white/40">
            Busiest: <span className="font-semibold text-[#0a1f1a] dark:text-white">{DAY_NAMES[busiestDay.dayOfWeek]}</span>
          </p>
        ) : null}
      </div>
      <div className="mt-4 flex h-28 items-end gap-2">
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
    <div className="flex h-full min-w-0 flex-1 flex-col items-center gap-1.5">
      <div className="relative flex w-full flex-1 items-end overflow-hidden rounded-xl bg-[#1a4d42]/[0.05] dark:bg-white/[0.05]">
        <div
          className={cn(
            "relative w-full rounded-xl transition-[height] duration-500",
            isToday ? "bg-gradient-to-t from-[#0a2620] to-[#246a59]" : "bg-gradient-to-t from-[#246a59]/45 to-[#9dcec1]/45",
          )}
          style={{ height: `${heightPercent}%` }}
        >
          {isToday ? <span aria-hidden className="absolute inset-x-1.5 top-1 h-[3px] rounded-full bg-[#d9c49a]" /> : null}
        </div>
        <span
          className={cn(
            "absolute inset-x-0 top-1.5 text-center text-[10px] font-semibold tabular-nums",
            isToday && heightPercent > 70 ? "text-white/85" : "text-[#1a4d42]/55 dark:text-white/50",
          )}
        >
          {count}
        </span>
      </div>
      <span className={cn("text-[10px] font-semibold", isToday ? "text-[#8a6427] dark:text-[#d9c49a]" : "text-[#1a4d42]/40 dark:text-white/35")}>
        {initial}
      </span>
    </div>
  );
}
