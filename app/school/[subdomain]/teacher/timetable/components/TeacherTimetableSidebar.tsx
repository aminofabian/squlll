"use client";

import type { ReactNode } from "react";
import { CalendarDays, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { NextLessonPreview } from "@/components/timetable/NextLessonPreview";
import { CurrentLessonBanner } from "@/components/timetable/CurrentLessonBanner";
import { DAY_NAMES, type TimetableStats } from "@/lib/timetable";
import type {
  CurrentLessonStatus,
  NextLessonInfo,
} from "@/lib/timetable/types";

type TeacherTimetableSidebarProps = {
  nextLesson: NextLessonInfo | null;
  currentStatus: CurrentLessonStatus;
  formattedTime: string;
  showLiveBanner: boolean;
  stats: TimetableStats | undefined;
  currentDayOfWeek: number | null;
  classesToday: number | null;
  isWeekend: boolean;
};

export function TeacherTimetableSidebar({
  nextLesson,
  currentStatus,
  formattedTime,
  showLiveBanner,
  stats,
  currentDayOfWeek,
  classesToday,
  isWeekend,
}: TeacherTimetableSidebarProps) {
  return (
    <aside className="sticky top-4 z-0 space-y-3.5">
      <NextLessonPreview nextLesson={nextLesson} viewType="teacher" dense />

      {showLiveBanner ? (
        <CurrentLessonBanner
          status={currentStatus}
          formattedTime={formattedTime}
          viewType="teacher"
          showClock={false}
          compact
        />
      ) : null}

      {stats && stats.totalLessons > 0 ? (
        <WeekAtAGlance
          stats={stats}
          currentDay={currentDayOfWeek}
          classesToday={isWeekend ? null : classesToday}
          isWeekend={isWeekend}
        />
      ) : null}
    </aside>
  );
}

function WeekAtAGlance({
  stats,
  currentDay,
  classesToday,
  isWeekend,
}: {
  stats: TimetableStats;
  currentDay: number | null;
  classesToday: number | null;
  isWeekend: boolean;
}) {
  const dayKeys = [1, 2, 3, 4, 5] as const;
  const counts = dayKeys.map((d) => stats.dayDistribution[DAY_NAMES[d]] ?? 0);
  const maxLessons = Math.max(...counts, 1);

  const dayLabels: Record<number, string> = {
    1: "M",
    2: "T",
    3: "W",
    4: "T",
    5: "F",
  };

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#1a4d42]/10 bg-[#fffdf8] px-4 py-4 shadow-[0_16px_40px_-34px_rgba(10,38,32,0.45)] dark:border-white/10 dark:bg-[#0c1a17]">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1a4d42]/40 dark:text-white/35">
            Week rhythm
          </p>
          <p className="mt-0.5 font-display text-[16px] tracking-tight text-[#0a1f1a] dark:text-white">
            This week
          </p>
        </div>
        <p className="text-right text-[10px] leading-relaxed text-[#1a4d42]/45 dark:text-white/35">
          <span className="block font-display text-[18px] leading-none text-[#0a1f1a] dark:text-white">
            {stats.totalLessons}
          </span>
          classes · {stats.totalSubjects}{" "}
          {stats.totalSubjects === 1 ? "subject" : "subjects"}
        </p>
      </div>

      <div className="flex items-end gap-1">
        {dayKeys.map((day, index) => {
          const count = counts[index];
          const fillPct =
            count > 0 ? Math.max((count / maxLessons) * 100, 14) : 0;
          const isToday = currentDay === day;

          return (
            <div key={day} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className="flex h-12 w-full items-end overflow-hidden rounded-lg bg-[#eef0e8] dark:bg-white/[0.06]"
                aria-label={`${DAY_NAMES[day]}: ${count} classes`}
              >
                {count > 0 ? (
                  <div
                    className={cn(
                      "w-full rounded-md transition-[height] duration-300",
                      isToday
                        ? "bg-gradient-to-t from-[#0a2620] to-[#246a59]"
                        : "bg-gradient-to-t from-[#246a59]/65 to-[#7fae9f]/65 dark:from-[#246a59]/50 dark:to-[#9dcec1]/40",
                    )}
                    style={{ height: `${fillPct}%` }}
                  />
                ) : null}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  isToday
                    ? "text-[#0a2620] dark:text-[#d9c49a]"
                    : "text-[#1a4d42]/45 dark:text-white/35",
                )}
              >
                {dayLabels[day]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2 border-t border-[#1a4d42]/8 pt-3 dark:border-white/8">
        <MiniStat
          icon={<Users className="h-3.5 w-3.5" />}
          label="Today"
          value={isWeekend ? "—" : String(classesToday ?? 0)}
        />
        <MiniStat
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          label="Taught"
          value={`${stats.completedLessons}/${stats.totalLessons}`}
        />
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#f4f2ea] px-2.5 py-2 dark:bg-white/[0.04]">
      <span className="shrink-0 text-[#246a59]/60 dark:text-[#9dcec1]/50">{icon}</span>
      <div className="min-w-0">
        <p className="font-display text-[17px] leading-none text-[#0a1f1a] dark:text-white">
          {value}
        </p>
        <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-[#1a4d42]/40 dark:text-white/30">
          {label}
        </p>
      </div>
    </div>
  );
}
