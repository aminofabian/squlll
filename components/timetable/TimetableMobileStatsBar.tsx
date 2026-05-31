"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { TimetableStats } from "@/lib/timetable/types";

type StatItem = {
  key: string;
  value: string | number;
  label: string;
};

function StatCell({
  value,
  label,
  highlight,
}: {
  value: string | number;
  label: string;
  highlight?: "danger" | "primary";
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-2 py-3.5">
      <span
        className={cn(
          "text-[14px] font-semibold tabular-nums leading-none",
          highlight === "danger"
            ? "text-red-600 dark:text-red-400"
            : highlight === "primary"
              ? "text-primary"
              : "text-slate-800 dark:text-slate-200",
        )}
      >
        {value}
      </span>
      <span className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </span>
    </div>
  );
}

function buildStudentStatItems(stats: TimetableStats): StatItem[] {
  return [
    { key: "total", value: stats.totalLessons, label: "Lessons" },
    {
      key: "done",
      value: `${stats.completedLessons}/${stats.totalLessons}`,
      label: "Done",
    },
    { key: "upcoming", value: stats.upcomingLessons, label: "Upcoming" },
    { key: "subjects", value: stats.totalSubjects, label: "Subjects" },
  ];
}

function buildTeacherStatItems(
  stats: TimetableStats,
  classesToday: number | null | undefined,
  isWeekend: boolean,
): StatItem[] {
  const todayValue =
    isWeekend || classesToday == null ? "—" : classesToday;

  return [
    { key: "total", value: stats.totalLessons, label: "Classes" },
    {
      key: "done",
      value: `${stats.completedLessons}/${stats.totalLessons}`,
      label: "Done",
    },
    { key: "subjects", value: stats.totalSubjects, label: "Subjects" },
    { key: "today", value: todayValue, label: "Today" },
  ];
}

export type TimetableMobileStatsBarProps = {
  viewType?: "student" | "teacher" | "admin";
  stats?: TimetableStats | null;
  loading?: boolean;
  classesToday?: number | null;
  isWeekend?: boolean;
  /** Admin grade view */
  filledSlots?: number;
  totalSlots?: number;
  totalLessons?: number;
  subjectCount?: number;
  conflictCount?: number;
  fillPercent?: number;
  className?: string;
};

function buildAdminStatItems(
  filledSlots: number,
  totalSlots: number,
  totalLessons: number,
  subjectCount: number,
  conflictCount: number,
  fillPercent?: number,
): StatItem[] {
  const fillValue =
    totalSlots > 0
      ? fillPercent != null
        ? `${Math.round(fillPercent)}%`
        : `${Math.round((filledSlots / totalSlots) * 100)}%`
      : filledSlots > 0
        ? String(filledSlots)
        : "—";

  return [
    { key: "fill", value: fillValue, label: "Fill" },
    {
      key: "filled",
      value: totalSlots > 0 ? `${filledSlots}/${totalSlots}` : filledSlots,
      label: "Slots",
    },
    { key: "lessons", value: totalLessons, label: "Lessons" },
    {
      key: "issues",
      value: conflictCount > 0 ? conflictCount : "—",
      label: "Issues",
    },
  ];
}

export function TimetableMobileStatsBar({
  viewType = "student",
  stats,
  loading = false,
  classesToday,
  isWeekend = false,
  filledSlots = 0,
  totalSlots = 0,
  totalLessons = 0,
  subjectCount = 0,
  conflictCount = 0,
  fillPercent,
  className,
}: TimetableMobileStatsBarProps) {
  const isAdmin = viewType === "admin";

  if (!loading && !isAdmin && (!stats || stats.totalLessons === 0)) {
    return null;
  }

  const items = isAdmin
    ? buildAdminStatItems(
        filledSlots,
        totalSlots,
        totalLessons,
        subjectCount,
        conflictCount,
        fillPercent,
      )
    : stats
      ? viewType === "teacher"
        ? buildTeacherStatItems(stats, classesToday, isWeekend)
        : buildStudentStatItems(stats)
      : [];

  return (
    <footer
      className={cn(
        "flex w-full shrink-0 border-t border-slate-100/90 bg-white/95 shadow-[0_-4px_16px_rgba(15,23,42,0.06)] backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] dark:border-slate-800/90 dark:bg-slate-950/95 dark:shadow-[0_-4px_16px_rgba(0,0,0,0.25)]",
        className,
      )}
      aria-label="Timetable summary"
    >
      {loading
        ? Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2.5",
                index < 3 && "border-r border-slate-100 dark:border-slate-800",
              )}
            >
              <Skeleton className="h-3.5 w-7 rounded-none" />
              <Skeleton className="h-2 w-11 rounded-none" />
            </div>
          ))
        : items.map((item, index) => (
            <div
              key={item.key}
              className={cn(
                "min-w-0 flex-1",
                index < items.length - 1 &&
                  "border-r border-slate-100/80 dark:border-slate-800/60",
              )}
            >
              <StatCell
                value={item.value}
                label={item.label}
                highlight={
                  item.key === "issues" && conflictCount > 0
                    ? "danger"
                    : item.key === "fill" &&
                        totalSlots > 0 &&
                        filledSlots >= totalSlots
                      ? "primary"
                      : undefined
                }
              />
            </div>
          ))}
    </footer>
  );
}

export function TimetableMobileStatsBarSkeleton({
  viewType = "student",
}: {
  viewType?: "student" | "teacher";
}) {
  return (
    <TimetableMobileStatsBar viewType={viewType} stats={null} loading />
  );
}
