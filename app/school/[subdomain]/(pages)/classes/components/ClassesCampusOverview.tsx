"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Filter,
  GraduationCap,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import {
  formatGradeDisplayName,
  getGradeSortOrder,
} from "@/lib/utils/grade-display";
import { useCampusClassDirectory } from "../hooks/useCampusClassDirectory";
import { useCampusDirectoryStaffing } from "../hooks/useCampusDirectoryStaffing";
import { cn } from "@/lib/utils";

export type ClassHealth =
  | "ready"
  | "no-teacher"
  | "no-subject-teachers"
  | "empty"
  | "no-streams";

export interface CampusClassUnit {
  id: string;
  gradeId: string;
  levelId: string;
  label: string;
  levelName: string;
  streamId?: string;
  streamName?: string;
  studentCount: number;
  subjectCount: number;
  subjectsStaffed: number;
  classTeacher: string | null;
  health: ClassHealth;
}

interface StudentLike {
  grade?: {
    gradeLevel?: { id?: string; name?: string };
  } | string;
  streamId?: string | null;
}

type FilterMode = "all" | "attention";

interface ClassesCampusOverviewProps {
  config: SchoolConfiguration | null;
  students: StudentLike[];
  isLoading?: boolean;
  onOpenGradePicker: () => void;
  onGradeSelect: (gradeId: string, levelId: string) => void;
  onStreamSelect: (streamId: string, gradeId: string, levelId: string) => void;
}

function healthMeta(health: ClassHealth) {
  switch (health) {
    case "ready":
      return {
        label: "Ready",
        className:
          "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
        dot: "bg-emerald-500",
      };
    case "no-teacher":
      return {
        label: "No class teacher",
        className:
          "border-amber-200/80 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
        dot: "bg-amber-500",
      };
    case "no-subject-teachers":
      return {
        label: "Subjects unstaffed",
        className:
          "border-orange-200/80 bg-orange-50 text-orange-800 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-300",
        dot: "bg-orange-500",
      };
    case "no-streams":
      return {
        label: "Add streams",
        className:
          "border-violet-200/80 bg-violet-50 text-violet-800 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-300",
        dot: "bg-violet-500",
      };
    default:
      return {
        label: "No students",
        className:
          "border-slate-200/80 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400",
        dot: "bg-slate-400",
      };
  }
}

function countStudents(
  students: StudentLike[],
  gradeId: string,
  streamId?: string,
) {
  let n = 0;
  for (const s of students) {
    const gId =
      typeof s.grade === "object" ? s.grade?.gradeLevel?.id : undefined;
    if (gId !== gradeId) continue;
    if (streamId) {
      if (s.streamId === streamId) n += 1;
    } else {
      n += 1;
    }
  }
  return n;
}

export function ClassesCampusOverview({
  config,
  students,
  isLoading,
  onOpenGradePicker,
  onGradeSelect,
  onStreamSelect,
}: ClassesCampusOverviewProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const { teacherMap, isLoading: teachersLoading } = useCampusClassDirectory();
  const { getStaffing, isLoading: staffingLoading } =
    useCampusDirectoryStaffing(config);

  const classUnits = useMemo((): CampusClassUnit[] => {
    if (!config?.selectedLevels) return [];

    const units: CampusClassUnit[] = [];

    for (const level of config.selectedLevels) {
      const subjectCount = level.subjects?.length ?? 0;
      const grades = [...(level.gradeLevels ?? [])].sort(
        (a, b) => getGradeSortOrder(a.name) - getGradeSortOrder(b.name),
      );

      for (const grade of grades) {
        const display = formatGradeDisplayName(grade.name);
        const streams = grade.streams ?? [];

        if (streams.length > 0) {
          for (const stream of streams) {
            const studentCount = countStudents(
              students,
              grade.id,
              stream.id,
            );
            const classTeacher =
              teacherMap.get(`stream:${stream.id}`) ??
              teacherMap.get(`grade:${grade.id}`) ??
              null;
            const staffing = getStaffing(grade.id);
            let health: ClassHealth = "ready";
            if (studentCount === 0) health = "empty";
            else if (!classTeacher) health = "no-teacher";
            else if (
              staffing.total > 0 &&
              staffing.assigned < staffing.total
            ) {
              health = "no-subject-teachers";
            }

            units.push({
              id: `${grade.id}-${stream.id}`,
              gradeId: grade.id,
              levelId: level.id,
              label: `${display} · ${stream.name}`,
              levelName: level.name,
              streamId: stream.id,
              streamName: stream.name,
              studentCount,
              subjectCount: staffing.total,
              subjectsStaffed: staffing.assigned,
              classTeacher,
              health,
            });
          }
        } else {
          const studentCount = countStudents(students, grade.id);
          const classTeacher = teacherMap.get(`grade:${grade.id}`) ?? null;
          const staffing = getStaffing(grade.id);
          let health: ClassHealth = "ready";
          if (studentCount === 0) health = "empty";
          else if (!classTeacher) health = "no-teacher";
          else if (staffing.total > 0 && staffing.assigned < staffing.total) {
            health = "no-subject-teachers";
          }

          units.push({
            id: grade.id,
            gradeId: grade.id,
            levelId: level.id,
            label: display,
            levelName: level.name,
            studentCount,
            subjectCount: staffing.total,
            subjectsStaffed: staffing.assigned,
            classTeacher,
            health,
          });
        }
      }
    }

    return units;
  }, [config?.selectedLevels, students, teacherMap, getStaffing]);

  const summary = useMemo(() => {
    const total = classUnits.length;
    const withStudents = classUnits.filter((u) => u.studentCount > 0).length;
    const withTeacher = classUnits.filter((u) => u.classTeacher).length;
    const needsAttention = classUnits.filter(
      (u) => u.health !== "ready",
    ).length;
    const totalStudents = classUnits.reduce((s, u) => s + u.studentCount, 0);
    return { total, withStudents, withTeacher, needsAttention, totalStudents };
  }, [classUnits]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return classUnits.filter((unit) => {
      if (filter === "attention" && unit.health === "ready") return false;
      if (!term) return true;
      return (
        unit.label.toLowerCase().includes(term) ||
        unit.levelName.toLowerCase().includes(term) ||
        unit.classTeacher?.toLowerCase().includes(term)
      );
    });
  }, [classUnits, search, filter]);

  const openClass = (unit: CampusClassUnit) => {
    if (unit.streamId) {
      onStreamSelect(unit.streamId, unit.gradeId, unit.levelId);
    } else {
      onGradeSelect(unit.gradeId, unit.levelId);
    }
  };

  const pageLoading = isLoading || teachersLoading || staffingLoading;

  if (pageLoading && classUnits.length === 0) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (classUnits.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center dark:border-slate-700">
        <GraduationCap className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-600">
          No classes set up yet
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Add grade levels and streams in school setup first.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Class directory overview" className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="border-b border-slate-100 bg-gradient-to-r from-[#0073ea]/5 to-transparent px-4 py-4 dark:border-slate-800 sm:px-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Class directory
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Every grade and stream is a class — see who teaches it and how many
            students are enrolled.
          </p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 dark:divide-slate-800 sm:grid-cols-4 sm:divide-y-0">
          {[
            { label: "Classes", value: summary.total },
            { label: "Students placed", value: summary.totalStudents },
            {
              label: "With class teacher",
              value: summary.withTeacher,
            },
            {
              label: "Need attention",
              value: summary.needsAttention,
              warn: summary.needsAttention > 0,
            },
          ].map((cell) => (
            <div key={cell.label} className="px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {cell.label}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-lg font-bold tabular-nums",
                  cell.warn
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-slate-900 dark:text-white",
                )}
              >
                {cell.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class or teacher…"
            className="h-9 border-slate-200/80 bg-white pl-8 pr-8 text-sm dark:bg-slate-900"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200/80 bg-slate-50/80 p-0.5 dark:border-slate-700 dark:bg-slate-900/60">
            {(
              [
                { id: "all" as const, label: "All classes" },
                { id: "attention" as const, label: "Needs attention" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === tab.id
                    ? "bg-white text-[#0073ea] shadow-sm dark:bg-slate-800"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                {tab.label}
                {tab.id === "attention" && summary.needsAttention > 0 ? (
                  <span className="ml-1 tabular-nums text-amber-600">
                    ({summary.needsAttention})
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs lg:hidden"
            onClick={onOpenGradePicker}
          >
            <Filter className="h-3.5 w-3.5" />
            Grades
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          No classes match your search.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((unit) => {
            const meta = healthMeta(unit.health);
            return (
              <button
                key={unit.id}
                type="button"
                onClick={() => openClass(unit)}
                className={cn(
                  "group flex flex-col rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-all",
                  "hover:-translate-y-0.5 hover:border-[#0073ea]/30 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-[#0073ea] dark:text-white">
                      {unit.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {unit.levelName}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      meta.className,
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                    {meta.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div>
                    <p className="text-[10px] font-medium uppercase text-slate-400">
                      Students
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-base font-bold tabular-nums text-slate-800 dark:text-slate-100">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {unit.studentCount}
                    </p>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <p className="text-[10px] font-medium uppercase text-slate-400">
                      Class teacher
                    </p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {unit.classTeacher ?? (
                        <span className="font-medium text-amber-700 dark:text-amber-400">
                          Not assigned
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <p className="mt-3 flex items-center gap-1 text-[11px] text-slate-400">
                  <BookOpen className="h-3 w-3" />
                  {unit.subjectCount === 0
                    ? "No subjects on curriculum"
                    : `${unit.subjectsStaffed}/${unit.subjectCount} subjects staffed`}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {summary.needsAttention > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200/70 bg-amber-50/40 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
          <p className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {summary.needsAttention} class
            {summary.needsAttention !== 1 ? "es" : ""} need students, a class
            teacher, or subject teachers.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-amber-200/80 text-xs"
            onClick={() => setFilter("attention")}
          >
            <Filter className="h-3.5 w-3.5" />
            Show list
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50/40 px-4 py-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          All classes are enrolled, staffed, and subject-ready.
        </div>
      )}
    </section>
  );
}
