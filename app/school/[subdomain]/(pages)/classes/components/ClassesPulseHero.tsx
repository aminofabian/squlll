"use client";

import { useMemo } from "react";
import { Radio } from "lucide-react";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import { useGetTeachers } from "@/lib/hooks/useTeachers";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { cn } from "@/lib/utils";
import { classesPanel } from "./classes-ui";

interface ClassesPulseHeroProps {
  config: SchoolConfiguration | null;
  isLoading?: boolean;
  studentCount?: number | null;
  studentsLoading?: boolean;
}

function Stat({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#1a4d42]/45">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-[#0a1f1a] dark:text-white">
        {loading ? "—" : value}
      </p>
    </div>
  );
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
      className={cn(classesPanel, "bg-[#f8fbfa] dark:bg-[#0c1a17]")}
      aria-label="Classes overview"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5 sm:px-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-base tracking-tight text-[#0a1f1a] dark:text-white">
              Grades, streams & subjects
            </h2>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-none px-1.5 py-0.5 text-[10px] font-semibold",
                connected
                  ? "bg-[#246a59] text-white"
                  : "bg-[#e8f2ef] text-[#1a4d42]/70 dark:bg-white/10 dark:text-white/60",
              )}
            >
              {connected ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-none bg-white" />
                  Live
                </>
              ) : (
                <>
                  <Radio className="h-2.5 w-2.5" />
                  Syncing
                </>
              )}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-[#1a4d42]/50">
            {teachers.length} teachers · open a class below
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 sm:gap-4">
          {studentCount != null ? (
            <Stat label="Students" value={studentCount} loading={loading} />
          ) : null}
          <Stat label="Levels" value={stats.levels} loading={loading} />
          <Stat label="Grades" value={stats.grades} loading={loading} />
          <Stat label="Streams" value={stats.streams} loading={loading} />
          <Stat label="Subjects" value={stats.subjects} loading={loading} />
        </div>
      </div>
    </section>
  );
}
