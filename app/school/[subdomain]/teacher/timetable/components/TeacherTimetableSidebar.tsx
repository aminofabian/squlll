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
    <aside className="sticky top-4 z-0 space-y-3">
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
    <div className="rounded-lg border border-slate-200/70 bg-white px-3 py-3 dark:border-slate-700/70 dark:bg-slate-800/90">
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
          This week
        </p>
        <p className="text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {stats.totalLessons}
          </span>{" "}
          classes ·{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {stats.totalSubjects}
          </span>{" "}
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
                className="flex h-10 w-full items-end overflow-hidden rounded-sm bg-slate-100 dark:bg-slate-700/80"
                aria-label={`${DAY_NAMES[day]}: ${count} classes`}
              >
                {count > 0 ? (
                  <div
                    className={cn(
                      "w-full rounded-sm transition-[height] duration-300",
                      isToday ? "bg-primary" : "bg-primary/40 dark:bg-primary/35",
                    )}
                    style={{ height: `${fillPct}%` }}
                  />
                ) : null}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isToday
                    ? "text-primary"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                {dayLabels[day]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-700/80">
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
    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-slate-50/80 px-2 py-1.5 dark:bg-slate-900/40">
      <span className="shrink-0 text-slate-400 dark:text-slate-500">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-none text-slate-900 dark:text-slate-100">
          {value}
        </p>
        <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}
