"use client";

import { useMemo } from "react";
import { LayoutGrid, Radio } from "lucide-react";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import { useGetTeachers } from "@/lib/hooks/useTeachers";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { DashboardAnimatedMetric } from "../../dashboard/components/DashboardAnimatedMetric";
import { cn } from "@/lib/utils";

interface ClassesPulseHeroProps {
  config: SchoolConfiguration | null;
  isLoading?: boolean;
  studentCount?: number | null;
  studentsLoading?: boolean;
}

export function ClassesPulseHero({
  config,
  isLoading,
  studentCount,
  studentsLoading,
}: ClassesPulseHeroProps) {
  const { connected } = useRealtime();
  const { teachers, isLoading: teachersLoading } = useGetTeachers();

  const stats = useMemo(() => {
    if (!config?.selectedLevels) {
      return { levels: 0, grades: 0, streams: 0, subjects: 0 };
    }
    const levels = config.selectedLevels;
    const grades = levels.reduce(
      (sum, l) => sum + (l.gradeLevels?.length ?? 0),
      0,
    );
    const streams = levels.reduce(
      (sum, l) =>
        sum +
        (l.gradeLevels?.reduce(
          (g, grade) => g + (grade.streams?.length ?? 0),
          0,
        ) ?? 0),
      0,
    );
    const subjectIds = new Set<string>();
    levels.forEach((l) =>
      l.subjects?.forEach((s) => subjectIds.add(s.id)),
    );
    return {
      levels: levels.length,
      grades,
      streams,
      subjects: subjectIds.size,
    };
  }, [config?.selectedLevels]);

  const loading = isLoading || teachersLoading || studentsLoading;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/70 shadow-sm",
        "bg-gradient-to-br from-[#0073ea]/[0.06] via-white to-violet-50/30",
        "dark:border-slate-800 dark:from-[#0073ea]/12 dark:via-slate-900 dark:to-violet-950/20",
      )}
      aria-label="Classes overview"
    >
      <div className="relative border-b border-slate-100/80 px-4 py-4 dark:border-slate-800 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0073ea]/80 dark:text-[#5ba3ff]">
              Class structure
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Grades, streams & subjects
            </h2>
            <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
              The directory below lists every class — students, class teacher,
              and status at a glance.
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              connected
                ? "bg-emerald-500 text-white"
                : "bg-slate-200 text-slate-600 dark:bg-slate-700",
            )}
          >
            {connected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Live
              </>
            ) : (
              <>
                <Radio className="h-3 w-3" />
                Syncing
              </>
            )}
          </span>
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-2 p-3 sm:grid-cols-5 sm:gap-2.5 sm:p-4">
        {studentCount != null ? (
          <DashboardAnimatedMetric
            label="Students"
            value={studentCount}
            accent="success"
            loading={loading}
          />
        ) : null}
        <DashboardAnimatedMetric
          label="Levels"
          value={stats.levels}
          loading={loading}
        />
        <DashboardAnimatedMetric
          label="Grades"
          value={stats.grades}
          loading={loading}
        />
        <DashboardAnimatedMetric
          label="Streams"
          value={stats.streams}
          accent="warm"
          loading={loading}
        />
        <DashboardAnimatedMetric
          label="Subjects"
          value={stats.subjects}
          loading={loading}
        />
      </div>

      <p className="border-t border-slate-100/80 px-4 py-2.5 text-center text-[11px] text-slate-400 dark:border-slate-800">
        <LayoutGrid className="mr-1 inline h-3 w-3" />
        {teachers.length} teacher{teachers.length !== 1 ? "s" : ""} on staff ·
        tap a grade below to open it
      </p>
    </section>
  );
}
