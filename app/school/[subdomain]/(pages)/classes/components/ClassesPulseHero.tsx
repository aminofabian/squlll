"use client";

import { useMemo } from "react";
import {
  BookOpen,
  GraduationCap,
  Layers,
  Radio,
  UserCheck,
  Users,
} from "lucide-react";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import { useGetTeachers } from "@/lib/hooks/useTeachers";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { cn } from "@/lib/utils";
import { classesDotGrid, classesInkPanel } from "./classes-ui";

interface ClassesPulseHeroProps {
  config: SchoolConfiguration | null;
  isLoading?: boolean;
  studentCount?: number | null;
  studentsLoading?: boolean;
}

function StatTile({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  loading?: boolean;
}) {
  return (
    <div className="rounded-none border border-white/10 bg-white/[0.05] px-2.5 py-2 transition-colors hover:border-white/20 hover:bg-white/[0.08]">
      <div className="flex items-center gap-1.5 text-white/45">
        <Icon className="h-3 w-3" />
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-lg font-semibold leading-none tabular-nums text-white">
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
    levels.forEach((l) => l.subjects?.forEach((s) => subjectIds.add(s.id)));
    return {
      levels: levels.length,
      grades,
      streams,
      subjects: subjectIds.size,
    };
  }, [config?.selectedLevels]);

  const loading = isLoading || teachersLoading || studentsLoading;

  return (
    <section className={classesInkPanel} aria-label="Campus overview">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={classesDotGrid}
      />
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#246a59]/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-[#1a4d42]/40 blur-3xl" />

      <div className="relative p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                Campus pulse
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-none border px-1.5 py-0.5 text-[10px] font-semibold",
                  connected
                    ? "border-[#3fae8f]/40 bg-[#3fae8f]/15 text-[#8fe3c8]"
                    : "border-white/15 bg-white/5 text-white/55",
                )}
              >
                {connected ? (
                  <>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-none bg-[#8fe3c8]" />
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

            <h2 className="mt-2 font-display text-xl font-normal tracking-tight text-white sm:text-2xl">
              Grades, streams &amp; subjects
            </h2>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-white/55">
              {stats.levels} level{stats.levels === 1 ? "" : "s"} ·{" "}
              {stats.grades} grade{stats.grades === 1 ? "" : "s"} ·{" "}
              {stats.streams} stream
              {stats.streams === 1 ? "" : "s"} · open any class below to manage
              its roster, teachers and subjects.
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-3 lg:grid-cols-5">
            {studentCount != null ? (
              <StatTile
                icon={Users}
                label="Students"
                value={studentCount}
                loading={loading}
              />
            ) : null}
            <StatTile
              icon={UserCheck}
              label="Teachers"
              value={teachers.length}
              loading={loading}
            />
            <StatTile
              icon={GraduationCap}
              label="Grades"
              value={stats.grades}
              loading={loading}
            />
            <StatTile
              icon={Layers}
              label="Streams"
              value={stats.streams}
              loading={loading}
            />
            <StatTile
              icon={BookOpen}
              label="Subjects"
              value={stats.subjects}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
