"use client";

import { useMemo } from "react";
import { LayoutGrid, Radio } from "lucide-react";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import { useGetTeachers } from "@/lib/hooks/useTeachers";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { DashboardAnimatedMetric } from "../../dashboard/components/DashboardAnimatedMetric";
import { cn } from "@/lib/utils";
import { classesPanel } from "./classes-ui";

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
        classesPanel,
        "bg-gradient-to-br from-[#246a59]/[0.06] via-[#f8fbfa] to-[#f3f7f5]",
        "dark:from-[#246a59]/12 dark:via-[#0c1a17] dark:to-[#071411]",
      )}
      aria-label="Classes overview"
    >
      <div className="relative border-b border-[#1a4d42]/10 px-4 py-4 dark:border-white/10 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#246a59]">
              Class structure
            </p>
            <h2 className="mt-1 font-display text-lg tracking-tight text-[#0a1f1a] dark:text-white">
              Grades, streams & subjects
            </h2>
            <p className="mt-1 max-w-md text-xs text-[#1a4d42]/55 dark:text-white/45">
              The directory below lists every class — students, class teacher,
              and status at a glance.
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-none px-2.5 py-1 text-[11px] font-semibold",
              connected
                ? "bg-[#246a59] text-white"
                : "bg-[#e8f2ef] text-[#1a4d42]/70 dark:bg-white/10 dark:text-white/60",
            )}
          >
            {connected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-none bg-white/70 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-none bg-white" />
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

      <div className="relative grid grid-cols-2 gap-px border-b border-[#1a4d42]/10 bg-[#1a4d42]/12 sm:grid-cols-5">
        {studentCount != null ? (
          <div className="bg-[#f8fbfa] p-3 dark:bg-[#071411]">
            <DashboardAnimatedMetric
              label="Students"
              value={studentCount}
              accent="success"
              loading={loading}
            />
          </div>
        ) : null}
        <div className="bg-[#f8fbfa] p-3 dark:bg-[#071411]">
          <DashboardAnimatedMetric
            label="Levels"
            value={stats.levels}
            loading={loading}
          />
        </div>
        <div className="bg-[#f8fbfa] p-3 dark:bg-[#071411]">
          <DashboardAnimatedMetric
            label="Grades"
            value={stats.grades}
            loading={loading}
          />
        </div>
        <div className="bg-[#f8fbfa] p-3 dark:bg-[#071411]">
          <DashboardAnimatedMetric
            label="Streams"
            value={stats.streams}
            accent="warm"
            loading={loading}
          />
        </div>
        <div className="bg-[#f8fbfa] p-3 dark:bg-[#071411]">
          <DashboardAnimatedMetric
            label="Subjects"
            value={stats.subjects}
            loading={loading}
          />
        </div>
      </div>

      <p className="px-4 py-2.5 text-center text-[11px] text-[#1a4d42]/45">
        <LayoutGrid className="mr-1 inline h-3 w-3" />
        {teachers.length} teacher{teachers.length !== 1 ? "s" : ""} on staff ·
        tap a grade below to open it
      </p>
    </section>
  );
}
