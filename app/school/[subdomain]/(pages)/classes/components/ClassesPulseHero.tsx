"use client";

import { useMemo } from "react";
import { ArrowRight, GraduationCap, Radio, UserCheck, Users } from "lucide-react";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import { useGetTeachers } from "@/lib/hooks/useTeachers";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { classesDotGrid, classesInkPanel } from "./classes-ui";

interface ClassesPulseHeroProps {
  config: SchoolConfiguration | null;
  isLoading?: boolean;
  studentCount?: number | null;
  studentsLoading?: boolean;
  onEnrolStudents?: () => void;
  onAddTeachers?: () => void;
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
    <div className="rounded-none border border-white/10 bg-white/[0.05] px-3 py-2.5 transition-colors hover:border-white/20 hover:bg-white/[0.08]">
      <div className="flex items-center gap-1.5 text-white/45">
        <Icon className="h-3 w-3" />
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-xl font-semibold leading-none tabular-nums text-white">
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
  onEnrolStudents,
  onAddTeachers,
}: ClassesPulseHeroProps) {
  const { connected } = useRealtime();
  const { teachers, isLoading: teachersLoading } = useGetTeachers();

  const stats = useMemo(() => {
    if (!config?.selectedLevels) {
      return { levels: 0, grades: 0, subjects: 0, classes: 0 };
    }
    const levels = config.selectedLevels;
    const grades = levels.reduce(
      (sum, level) => sum + (level.gradeLevels?.length ?? 0),
      0,
    );
    const streams = levels.reduce(
      (sum, level) =>
        sum +
        (level.gradeLevels?.reduce(
          (gradeSum, grade) => gradeSum + (grade.streams?.length ?? 0),
          0,
        ) ?? 0),
      0,
    );
    const subjectIds = new Set<string>();
    levels.forEach((level) =>
      level.subjects?.forEach((subject) => subjectIds.add(subject.id)),
    );
    return {
      levels: levels.length,
      grades,
      subjects: subjectIds.size,
      classes: streams || grades,
    };
  }, [config?.selectedLevels]);

  const needsStudents = !studentsLoading && (studentCount ?? 0) === 0;
  const needsTeachers = !teachersLoading && teachers.length === 0;

  const action = needsStudents
    ? {
        label: "Enrol students",
        helper: "Start by adding learners to your classes.",
        onClick: onEnrolStudents,
      }
    : needsTeachers
      ? {
          label: "Add teachers",
          helper: "Add staff, then assign a class teacher.",
          onClick: onAddTeachers,
        }
      : null;

  return (
    <section className={classesInkPanel} aria-label="Campus overview">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={classesDotGrid}
      />
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#246a59]/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-[#1a4d42]/40 blur-3xl" />

      <div className="relative p-4 sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-xl">
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
              Classes at a glance
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-white/55">
              {stats.levels} level{stats.levels === 1 ? "" : "s"} ·{" "}
              {stats.grades} grade{stats.grades === 1 ? "" : "s"} ·{" "}
              {stats.subjects} subject{stats.subjects === 1 ? "" : "s"}. Open a
              class to manage its roster, teacher and subjects.
            </p>

            {action && action.onClick ? (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  size="sm"
                  className="h-9 rounded-none bg-white px-3 text-xs font-semibold text-[#0a1f1a] shadow-none hover:bg-[#e8f2ef]"
                  onClick={action.onClick}
                >
                  {action.label}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
                <span className="text-[11px] text-white/45">
                  {action.helper}
                </span>
              </div>
            ) : null}
          </div>

          <div className="grid w-full grid-cols-3 gap-2 lg:w-auto lg:min-w-[19rem]">
            <StatTile
              icon={GraduationCap}
              label="Classes"
              value={stats.classes}
              loading={isLoading}
            />
            <StatTile
              icon={Users}
              label="Students"
              value={studentCount ?? 0}
              loading={studentsLoading}
            />
            <StatTile
              icon={UserCheck}
              label="Teachers"
              value={teachers.length}
              loading={teachersLoading}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
