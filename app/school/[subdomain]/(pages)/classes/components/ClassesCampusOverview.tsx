"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Filter,
  GraduationCap,
  Search,
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
          "border-[#1a4d42]/12 bg-[#f8fbfa] text-[#1a4d42]/65 dark:border-white/15 dark:bg-[#071411] dark:text-[#1a4d42]/45",
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
              className="h-16 animate-pulse rounded-none bg-[#e8f2ef] dark:bg-[#0c1a17]"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-none bg-[#e8f2ef] dark:bg-[#0c1a17]" />
      </div>
    );
  }

  if (classUnits.length === 0) {
    return (
      <div className="rounded-none border border-dashed border-[#1a4d42]/15 px-6 py-12 text-center dark:border-white/15">
        <GraduationCap className="mx-auto h-8 w-8 text-[#1a4d42]/30" />
        <p className="mt-3 text-sm font-medium text-[#1a4d42]/65">
          No classes set up yet
        </p>
        <p className="mt-1 text-xs text-[#1a4d42]/45">
          Add grade levels and streams in school setup first.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Class directory overview"
      className="overflow-hidden rounded-none border border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#0c1a17]"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2 dark:border-white/10 dark:bg-[#071411]">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base tracking-tight text-[#0a1f1a] dark:text-white">
            Class directory
          </h2>
          <p className="text-[11px] tabular-nums text-[#1a4d42]/50">
            {summary.total} classes · {summary.totalStudents} students ·{" "}
            {summary.withTeacher} with teacher
            {summary.needsAttention > 0 ? (
              <span className="text-amber-700">
                {" "}
                · {summary.needsAttention} need attention
              </span>
            ) : null}
          </p>
        </div>

        <div className="relative min-w-0 w-full sm:w-44">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1a4d42]/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="h-8 rounded-none border-[#1a4d42]/15 bg-white pl-7 pr-7 text-xs shadow-none dark:bg-[#0c1a17]"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#1a4d42]/40"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <div className="inline-flex rounded-none border border-[#1a4d42]/12 bg-white p-0.5 dark:border-white/15 dark:bg-[#0c1a17]">
          {(
            [
              { id: "all" as const, label: "All" },
              { id: "attention" as const, label: "Attention" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                "rounded-none px-2 py-1 text-[11px] font-medium transition-colors",
                filter === tab.id
                  ? "bg-[#0a1f1a] text-white"
                  : "text-[#1a4d42]/55 hover:text-[#0a1f1a]",
              )}
            >
              {tab.label}
              {tab.id === "attention" && summary.needsAttention > 0 ? (
                <span className="ml-0.5 tabular-nums">
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
          className="h-8 gap-1 rounded-none border-[#1a4d42]/15 text-xs lg:hidden"
          onClick={onOpenGradePicker}
        >
          <Filter className="h-3.5 w-3.5" />
          Grades
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#1a4d42]/45">
          No classes match your search.
        </p>
      ) : (
        <ul className="max-h-[min(52vh,28rem)] divide-y divide-[#1a4d42]/8 overflow-y-auto dark:divide-white/10">
          {filtered.map((unit) => {
            const meta = healthMeta(unit.health);
            return (
              <li key={unit.id}>
                <button
                  type="button"
                  onClick={() => openClass(unit)}
                  className="group flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[#f8fbfa] dark:hover:bg-[#071411]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-[#0a1f1a] group-hover:text-[#246a59] dark:text-white">
                        {unit.label}
                      </p>
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1 rounded-none border px-1.5 py-px text-[10px] font-medium",
                          meta.className,
                        )}
                      >
                        <span
                          className={cn("h-1 w-1 rounded-none", meta.dot)}
                        />
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-[#1a4d42]/45">
                      {unit.levelName}
                      {" · "}
                      {unit.classTeacher ?? (
                        <span className="text-amber-700">No teacher</span>
                      )}
                      {" · "}
                      {unit.subjectCount === 0
                        ? "No subjects"
                        : `${unit.subjectsStaffed}/${unit.subjectCount} staffed`}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums text-[#0a1f1a] dark:text-white">
                    <Users className="h-3.5 w-3.5 text-[#1a4d42]/40" />
                    {unit.studentCount}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {summary.needsAttention > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/70 bg-amber-50/50 px-3 py-1.5 dark:border-amber-900/40 dark:bg-amber-950/20">
          <p className="flex items-center gap-1.5 text-[11px] text-amber-900 dark:text-amber-200">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {summary.needsAttention} need setup
          </p>
          <button
            type="button"
            className="text-[11px] font-medium text-amber-800 underline-offset-2 hover:underline"
            onClick={() => setFilter("attention")}
          >
            Show them
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 border-t border-[#246a59]/15 bg-[#e8f2ef]/60 px-3 py-1.5 text-[11px] text-[#1a4d42] dark:border-[#246a59]/30 dark:bg-[#246a59]/10">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          All classes ready
        </div>
      )}
    </section>
  );
}
