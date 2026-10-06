"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Filter,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
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
import { classesCard, classesMicro, classesTrack } from "./classes-ui";

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

interface GradeGroup {
  gradeId: string;
  levelId: string;
  displayName: string;
  levelName: string;
  units: CampusClassUnit[];
  /** Total units in the grade, independent of the active search/filter. */
  totalUnits: number;
  /** Units with no outstanding setup (health === "ready"). */
  readyCount: number;
}

function healthMeta(health: ClassHealth) {
  switch (health) {
    case "ready":
      return {
        label: "Ready",
        dot: "bg-emerald-500",
      };
    case "no-teacher":
      return {
        label: "No class teacher",
        dot: "bg-amber-500",
      };
    case "no-subject-teachers":
      return {
        label: "Subjects unstaffed",
        dot: "bg-orange-500",
      };
    case "no-streams":
      return {
        label: "Add streams",
        dot: "bg-violet-500",
      };
    default:
      return {
        label: "No students",
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

/** "7 · A" -> "7A" style monogram for the row avatar */
function monogramFromLabel(label: string) {
  const words = label.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const letters = words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
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
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [railCollapsed, setRailCollapsed] = useState(false);
  const { teacherMap, isLoading: teachersLoading } = useCampusClassDirectory();
  const { getStaffing, isLoading: staffingLoading } =
    useCampusDirectoryStaffing(config);

  const selectedLevels = config?.selectedLevels;

  const classUnits = useMemo((): CampusClassUnit[] => {
    if (!selectedLevels) return [];

    const units: CampusClassUnit[] = [];

    for (const level of selectedLevels) {
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
  }, [selectedLevels, students, teacherMap, getStaffing]);

  /** Units in the current browsing scope (honours the level filter). */
  const scopedUnits = useMemo(
    () =>
      selectedLevelId
        ? classUnits.filter((u) => u.levelId === selectedLevelId)
        : classUnits,
    [classUnits, selectedLevelId],
  );

  const summary = useMemo(() => {
    const total = scopedUnits.length;
    const withTeacher = scopedUnits.filter((u) => u.classTeacher).length;
    const needsAttention = scopedUnits.filter(
      (u) => u.health !== "ready",
    ).length;
    const totalStudents = scopedUnits.reduce((s, u) => s + u.studentCount, 0);
    return { total, withTeacher, needsAttention, totalStudents };
  }, [scopedUnits]);

  /** One column per grade, ordered by level then grade. */
  const gradeGroups = useMemo((): GradeGroup[] => {
    const order: string[] = [];
    const byGrade = new Map<string, GradeGroup>();
    for (const unit of classUnits) {
      let group = byGrade.get(unit.gradeId);
      if (!group) {
        const displayName = unit.streamName
          ? unit.label.slice(
              0,
              unit.label.length - ` · ${unit.streamName}`.length,
            )
          : unit.label;
        group = {
          gradeId: unit.gradeId,
          levelId: unit.levelId,
          displayName,
          levelName: unit.levelName,
          units: [],
          totalUnits: 0,
          readyCount: 0,
        };
        byGrade.set(unit.gradeId, group);
        order.push(unit.gradeId);
      }
      group.units.push(unit);
    }
    return order.map((id) => {
      const group = byGrade.get(id)!;
      return {
        ...group,
        totalUnits: group.units.length,
        readyCount: group.units.filter((u) => u.health === "ready").length,
      };
    });
  }, [classUnits]);

  /** Levels that actually have grades, in board order. */
  const levelTabs = useMemo(() => {
    const seen = new Map<string, string>();
    for (const group of gradeGroups) {
      if (!seen.has(group.levelId)) seen.set(group.levelId, group.levelName);
    }
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [gradeGroups]);

  const visibleGradeGroups = useMemo(
    () =>
      selectedLevelId
        ? gradeGroups.filter((group) => group.levelId === selectedLevelId)
        : gradeGroups,
    [gradeGroups, selectedLevelId],
  );

  const boardGroups = useMemo(() => {
    const term = search.trim().toLowerCase();
    return visibleGradeGroups
      .filter((group) => !selectedGradeId || group.gradeId === selectedGradeId)
      .map((group) => ({
        ...group,
        units: group.units.filter((unit) => {
          if (filter === "attention" && unit.health === "ready") return false;
          if (!term) return true;
          return (
            unit.label.toLowerCase().includes(term) ||
            unit.levelName.toLowerCase().includes(term) ||
            unit.classTeacher?.toLowerCase().includes(term)
          );
        }),
      }))
      .filter((group) => group.units.length > 0);
  }, [visibleGradeGroups, selectedGradeId, search, filter]);

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
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-none bg-[#e8f2ef] dark:bg-[#0c1a17]"
          />
        ))}
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
    <section aria-label="Class directory">
      <div
        className={cn(
          classesCard,
          "sm:sticky sm:top-[2.75rem] sm:z-10 sm:bg-white/95 sm:backdrop-blur-md sm:supports-[backdrop-filter]:bg-white/85 dark:sm:bg-[#0c1a17]/90",
        )}
      >
        <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base tracking-tight text-[#0a1f1a] dark:text-white">
              Class directory
            </h2>
            <p className="text-[11px] tabular-nums text-[#1a4d42]/50 dark:text-white/45">
              {summary.total} classes · {summary.totalStudents} students ·{" "}
              {summary.withTeacher} with teacher
              {summary.needsAttention > 0 ? (
                <span className="text-amber-700 dark:text-amber-400">
                  {" "}
                  · {summary.needsAttention} need attention
                </span>
              ) : null}
            </p>
          </div>

          <div className="relative min-w-0 w-full sm:w-52">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1a4d42]/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search classes, teachers…"
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

          <div className="inline-flex shrink-0 rounded-none border border-[#1a4d42]/12 bg-white p-0.5 dark:border-white/15 dark:bg-[#0c1a17]">
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
                  "rounded-none px-2.5 py-1 text-[11px] font-medium transition-colors",
                  filter === tab.id
                    ? "bg-[#0a1f1a] text-white"
                    : "text-[#1a4d42]/55 hover:text-[#0a1f1a] dark:text-white/55 dark:hover:text-white",
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
            className="h-8 shrink-0 gap-1 rounded-none border-[#1a4d42]/15 text-xs lg:hidden"
            onClick={onOpenGradePicker}
          >
            <Filter className="h-3.5 w-3.5" />
            Grades
          </Button>
        </div>
      </div>

      {levelTabs.length > 1 ? (
        <div className="mt-3 flex items-center gap-1 overflow-x-auto border-b border-[#1a4d42]/10 dark:border-white/10">
          {[{ id: "", name: "All levels" }, ...levelTabs].map((tab) => {
            const active = selectedLevelId === tab.id;
            return (
              <button
                key={tab.id || "all"}
                type="button"
                onClick={() => {
                  setSelectedLevelId(tab.id);
                  setSelectedGradeId("");
                }}
                className={cn(
                  "-mb-px shrink-0 whitespace-nowrap border-b-2 px-2.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-[#246a59] text-[#0a1f1a] dark:text-white"
                    : "border-transparent text-[#1a4d42]/55 hover:text-[#0a1f1a] dark:text-white/55 dark:hover:text-white",
                )}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-start">
        {/* Grade rail — self-contained navigation for the board */}
        <aside
          aria-label="Filter by grade"
          className={cn(
            classesCard,
            "p-1.5 lg:sticky lg:top-[5.5rem] lg:shrink-0",
            railCollapsed ? "lg:w-12" : "lg:w-56",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between gap-1 px-1",
              railCollapsed && "lg:flex-col lg:justify-center lg:gap-2",
            )}
          >
            <p
              className={cn(
                classesMicro,
                "px-1 py-1",
                railCollapsed && "lg:hidden",
              )}
            >
              Grades
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRailCollapsed((v) => !v)}
              className="hidden h-6 w-6 shrink-0 rounded-none p-0 text-[#1a4d42]/45 hover:bg-[#e8f2ef] hover:text-[#0a1f1a] lg:inline-flex dark:hover:bg-white/5 dark:hover:text-white"
              aria-label={
                railCollapsed ? "Expand grade list" : "Collapse grade list"
              }
              title={railCollapsed ? "Expand" : "Collapse"}
            >
              {railCollapsed ? (
                <PanelLeftOpen className="h-3.5 w-3.5" />
              ) : (
                <PanelLeftClose className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          {railCollapsed ? (
            <p
              className="hidden select-none pb-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/40 lg:block dark:text-white/40"
              style={{ writingMode: "vertical-rl" }}
            >
              Grades
            </p>
          ) : null}

          <div
            className={cn(
              "flex gap-1 overflow-x-auto pb-0.5 lg:max-h-[min(70vh,40rem)] lg:flex-col lg:overflow-y-auto lg:pb-0",
              railCollapsed && "lg:hidden",
            )}
          >
            <button
              type="button"
              onClick={() => setSelectedGradeId("")}
              className={cn(
                "flex shrink-0 items-center justify-between gap-2 rounded-none px-2.5 py-1.5 text-left text-xs font-medium transition-colors lg:w-full",
                !selectedGradeId
                  ? "bg-[#0a1f1a] text-white"
                  : "text-[#1a4d42]/70 hover:bg-[#f3f7f5] dark:text-white/60 dark:hover:bg-white/5",
              )}
            >
              <span className="whitespace-nowrap">All grades</span>
              <span
                className={cn(
                  "shrink-0 tabular-nums text-[10px]",
                  !selectedGradeId ? "text-white/70" : "text-[#1a4d42]/45",
                )}
              >
                {summary.total}
              </span>
            </button>

            {visibleGradeGroups.map((group) => {
              const active = selectedGradeId === group.gradeId;
              return (
                <button
                  key={group.gradeId}
                  type="button"
                  onClick={() =>
                    setSelectedGradeId(active ? "" : group.gradeId)
                  }
                  className={cn(
                    "flex shrink-0 items-center justify-between gap-2 rounded-none px-2.5 py-1.5 text-left text-xs font-medium transition-colors lg:w-full",
                    active
                      ? "bg-[#0a1f1a] text-white"
                      : "text-[#1a4d42]/70 hover:bg-[#f3f7f5] dark:text-white/60 dark:hover:bg-white/5",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate whitespace-nowrap">
                      {group.displayName}
                    </span>
                    <span
                      className={cn(
                        "block truncate text-[10px] font-normal",
                        active
                          ? "text-white/60"
                          : "text-[#1a4d42]/40 dark:text-white/35",
                      )}
                    >
                      {group.levelName}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 tabular-nums text-[10px]",
                      active ? "text-white/70" : "text-[#1a4d42]/45",
                    )}
                  >
                    {group.units.length}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Columns — one per grade, rows are streams */}
        <div className="min-w-0 flex-1">
          {boardGroups.length === 0 ? (
            <p className="rounded-none border border-dashed border-[#1a4d42]/15 py-10 text-center text-sm text-[#1a4d42]/45 dark:border-white/15">
              {filter === "attention"
                ? "Every class is set up. Nice work."
                : "No classes match your search."}
            </p>
          ) : (
            <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {boardGroups.map((group) => (
                <section
                  key={group.gradeId}
                  aria-label={group.displayName}
                  className={cn(classesCard, "overflow-hidden")}
                >
                  <header className="border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2 dark:border-white/10 dark:bg-[#071411]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-sm tracking-tight text-[#0a1f1a] dark:text-white">
                          {group.displayName}
                        </h3>
                        <p className="truncate text-[10px] uppercase tracking-[0.14em] text-[#1a4d42]/45 dark:text-white/40">
                          {group.levelName}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-none bg-[#1a4d42]/[0.07] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[#1a4d42]/60 dark:bg-white/10 dark:text-white/60">
                        {group.totalUnits}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-2">
                      <div className={cn(classesTrack, "h-1 flex-1")}>
                        <div
                          className={cn(
                            "h-full",
                            group.readyCount === group.totalUnits
                              ? "bg-emerald-500"
                              : "bg-amber-500",
                          )}
                          style={{
                            width: `${Math.round(
                              (group.readyCount / Math.max(group.totalUnits, 1)) *
                                100,
                            )}%`,
                          }}
                        />
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-[10px] font-semibold tabular-nums",
                          group.readyCount === group.totalUnits
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-amber-700 dark:text-amber-400",
                        )}
                      >
                        {group.readyCount}/{group.totalUnits} ready
                      </span>
                    </div>
                  </header>

                  <div className="flex flex-col divide-y divide-[#1a4d42]/8 dark:divide-white/10">
                    {group.units.map((unit) => {
                      const meta = healthMeta(unit.health);
                      const rowLabel = unit.streamName ?? "Whole grade";
                      return (
                        <button
                          key={unit.id}
                          type="button"
                          onClick={() => openClass(unit)}
                          title={meta.label}
                          className="group flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors hover:bg-[#f8fbfa] dark:hover:bg-[#071411]"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-gradient-to-br from-[#246a59] to-[#1a4d42] text-[10px] font-bold tracking-tight text-white">
                            {monogramFromLabel(rowLabel)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="truncate text-[13px] font-medium text-[#0a1f1a] group-hover:text-[#246a59] dark:text-white dark:group-hover:text-[#8fe3c8]">
                                {rowLabel}
                              </span>
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 shrink-0 rounded-none",
                                  meta.dot,
                                )}
                              />
                            </span>
                            <span className="mt-0.5 flex items-center gap-1 text-[11px] text-[#1a4d42]/50 dark:text-white/45">
                              <span className="min-w-0 truncate">
                                {unit.classTeacher ?? (
                                  <span className="text-amber-700 dark:text-amber-400">
                                    No class teacher
                                  </span>
                                )}
                              </span>
                              <span className="shrink-0 text-[#1a4d42]/25 dark:text-white/25">
                                ·
                              </span>
                              <span className="shrink-0 tabular-nums">
                                {unit.studentCount}
                              </span>
                              {unit.subjectCount > 0 ? (
                                <span className="shrink-0 tabular-nums text-[#1a4d42]/35 dark:text-white/35">
                                  · {unit.subjectsStaffed}/{unit.subjectCount}
                                </span>
                              ) : null}
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-[#1a4d42]/25 transition-transform group-hover:translate-x-0.5 group-hover:text-[#246a59] dark:text-white/25 dark:group-hover:text-[#8fe3c8]" />
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {summary.needsAttention > 0 ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-none border border-amber-200/70 bg-amber-50/60 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-950/20">
          <p className="flex items-center gap-1.5 text-[11px] text-amber-900 dark:text-amber-200">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {summary.needsAttention} class
            {summary.needsAttention === 1 ? "" : "es"} need setup
          </p>
          <button
            type="button"
            className="text-[11px] font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-300"
            onClick={() => {
              setSelectedGradeId("");
              setFilter("attention");
            }}
          >
            Show them
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-1.5 rounded-none border border-[#246a59]/15 bg-[#e8f2ef]/60 px-3 py-2 text-[11px] text-[#1a4d42] dark:border-[#246a59]/30 dark:bg-[#246a59]/10 dark:text-[#8fe3c8]">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          All {summary.total} classes are ready
        </div>
      )}
    </section>
  );
}
