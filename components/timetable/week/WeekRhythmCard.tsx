"use client";

import type { WeekDayDate } from "@/lib/timetable/weekView/getWeekDayDates";

export function WeekRhythmCard({
  dayDates,
  lessonCounts,
  currentDayOfWeek,
}: {
  dayDates: WeekDayDate[];
  lessonCounts: Record<number, number>;
  currentDayOfWeek: number | null;
}) {
  const max = Math.max(...dayDates.map((d) => lessonCounts[d.dayOfWeek] ?? 0), 1);
  return (
    <section className="rounded-xl border border-[#1a4d42]/10 bg-[#fffdf8] px-4 py-3 dark:border-white/10 dark:bg-[#0c1a17]">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1a4d42]/40 dark:text-white/35">
        Week rhythm
      </p>
      <div className="mt-3 flex h-20 items-end gap-1.5">
        {dayDates.map((date) => {
          const count = lessonCounts[date.dayOfWeek] ?? 0;
          return (
            <div key={date.dayOfWeek} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div className="flex w-full flex-1 items-end overflow-hidden rounded-md bg-[#1a4d42]/5 dark:bg-white/5">
                <div
                  className="w-full rounded-md bg-gradient-to-t from-[#0a2620] to-[#246a59]"
                  style={{ height: `${count ? Math.max((count / max) * 100, 14) : 0}%` }}
                />
              </div>
              <span className={`text-[9px] ${date.dayOfWeek === currentDayOfWeek ? "font-bold text-[#0a2620] dark:text-[#d9c49a]" : "text-[#1a4d42]/40 dark:text-white/30"}`}>
                {["M", "T", "W", "T", "F"][date.dayOfWeek - 1] ?? "•"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
