"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  GraduationCap,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useClassDirectoryActions } from "../hooks/useClassDirectoryActions";
import { AddStreamModal } from "../../components/AddStreamModal";
import {
  DeleteClassesDialog,
  EditClassDialog,
  EditStreamDialog,
} from "./ClassDirectoryDialogs";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import {
  formatGradeDisplayName,
  getGradeSortOrder,
} from "@/lib/utils/grade-display";
import { useCampusClassDirectory } from "../hooks/useCampusClassDirectory";
import { useCampusDirectoryStaffing } from "../hooks/useCampusDirectoryStaffing";
import { cn } from "@/lib/utils";
import { classesCard } from "./classes-ui";

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
  gradeName: string;
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
  onGradeSelect: (gradeId: string, levelId: string) => void;
  onStreamSelect: (streamId: string, gradeId: string, levelId: string) => void;
}

function healthMeta(health: ClassHealth) {
  switch (health) {
    case "ready":
      return { label: "Ready", dot: "bg-emerald-500" };
    case "no-teacher":
      return { label: "No class teacher", dot: "bg-amber-500" };
    case "no-subject-teachers":
      return { label: "Subjects unstaffed", dot: "bg-orange-500" };
    case "no-streams":
      return { label: "Add streams", dot: "bg-violet-500" };
    default:
      return { label: "No students", dot: "bg-slate-400" };
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
  onGradeSelect,
  onStreamSelect,
}: ClassesCampusOverviewProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const actions = useClassDirectoryActions();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editClassUnit, setEditClassUnit] = useState<CampusClassUnit | null>(
    null,
  );
  const [editStreamUnit, setEditStreamUnit] = useState<CampusClassUnit | null>(
    null,
  );
  const [addStreamUnit, setAddStreamUnit] = useState<CampusClassUnit | null>(
    null,
  );
  const [deleteUnits, setDeleteUnits] = useState<CampusClassUnit[] | null>(
    null,
  );
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
            const studentCount = countStudents(students, grade.id, stream.id);
            const classTeacher =
              teacherMap.get(`stream:${stream.id}`) ??
              teacherMap.get(`grade:${grade.id}`) ??
              null;
            const staffing = getStaffing(grade.id);
            let health: ClassHealth = "ready";
            if (!classTeacher) health = "no-teacher";
            else if (studentCount === 0) health = "empty";
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
              gradeName: display,
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
          if (!classTeacher) health = "no-teacher";
          else if (studentCount === 0) health = "empty";
          else if (staffing.total > 0 && staffing.assigned < staffing.total) {
            health = "no-subject-teachers";
          }

          units.push({
            id: grade.id,
            gradeId: grade.id,
            levelId: level.id,
            label: display,
            gradeName: display,
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

  const summary = useMemo(() => {
    const total = classUnits.length;
    const needsAttention = classUnits.filter(
      (unit) => unit.health !== "ready",
    ).length;
    return { total, needsAttention };
  }, [classUnits]);

  const filteredUnits = useMemo(() => {
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

  const levelSections = useMemo(() => {
    const order = new Map<string, string>();
    for (const unit of classUnits) {
      if (!order.has(unit.levelId)) order.set(unit.levelId, unit.levelName);
    }
    return Array.from(order, ([id, name]) => ({
      id,
      name,
      units: filteredUnits.filter((unit) => unit.levelId === id),
    })).filter((section) => section.units.length > 0);
  }, [classUnits, filteredUnits]);

  const selectedUnits = useMemo(
    () => classUnits.filter((unit) => selectedIds.has(unit.id)),
    [classUnits, selectedIds],
  );

  const selectableUnits = useMemo(
    () => filteredUnits.filter((unit) => unit.studentCount === 0),
    [filteredUnits],
  );

  const startSelect = () => {
    setSearch("");
    setFilter("all");
    setSelectedIds(new Set());
    setSelectMode(true);
  };

  const exitSelect = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (unit: CampusClassUnit) => {
    if (unit.studentCount > 0) {
      toast.error("This class still has students. Move them first.");
      return;
    }
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(unit.id)) next.delete(unit.id);
      else next.add(unit.id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(selectableUnits.map((unit) => unit.id)));
  };

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
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-lg bg-[#e8f2ef] dark:bg-[#0c1a17]"
          />
        ))}
      </div>
    );
  }

  if (classUnits.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#1a4d42]/15 px-6 py-12 text-center dark:border-white/15">
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
    <section aria-label="Class directory" className="space-y-4">
      {selectMode ? (
        <div
          className={cn(
            classesCard,
            "flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4",
          )}
        >
          <div className="min-w-0">
            <h2 className="font-display text-lg tracking-tight text-[#0a1f1a] dark:text-white">
              Select classes
            </h2>
            <p className="text-[11px] tabular-nums text-[#1a4d42]/50 dark:text-white/45">
              {selectedUnits.length} selected ·{" "}
              {selectableUnits.length} can be deleted
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={selectAllVisible}
              disabled={selectableUnits.length === 0}
            >
              Select all
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setSelectedIds(new Set())}
              disabled={selectedUnits.length === 0}
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={exitSelect}
            >
              Done
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setDeleteUnits(selectedUnits)}
              disabled={selectedUnits.length === 0}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete selected
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            classesCard,
            "flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4",
          )}
        >
          <div className="min-w-0">
            <h2 className="font-display text-lg tracking-tight text-[#0a1f1a] dark:text-white">
              Class directory
            </h2>
            <p className="text-[11px] tabular-nums text-[#1a4d42]/50 dark:text-white/45">
              {summary.total} classes
              {summary.needsAttention > 0 ? (
                <span className="text-amber-700 dark:text-amber-400">
                  {" "}
                  · {summary.needsAttention} need attention
                </span>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400">
                  {" "}
                  · all set up
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1a4d42]/40" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search classes or teachers…"
                className="h-8 rounded-lg border-[#1a4d42]/15 bg-white pl-7 pr-7 text-xs shadow-none dark:bg-[#0c1a17]"
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

            <div className="flex items-center gap-2">
              <div className="inline-flex shrink-0 rounded-lg border border-[#1a4d42]/12 bg-white p-0.5 dark:border-white/15 dark:bg-[#0c1a17]">
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
                      "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
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
                className="h-[30px] text-xs"
                onClick={startSelect}
              >
                Select
              </Button>
            </div>
          </div>
        </div>
      )}

      {levelSections.length === 0 ? (
        <div className={cn(classesCard, "px-4 py-12 text-center")}>
          <GraduationCap className="mx-auto h-8 w-8 text-[#1a4d42]/25" />
          <p className="mt-3 text-sm font-medium text-[#1a4d42]/65 dark:text-white/65">
            {filter === "attention"
              ? "Every class is set up."
              : "No classes match your search."}
          </p>
          <p className="mt-1 text-xs text-[#1a4d42]/45 dark:text-white/40">
            {filter === "attention"
              ? "Switch to All to browse the full directory."
              : "Try a different class or teacher name."}
          </p>
        </div>
      ) : (
        levelSections.map((section) => (
          <section key={section.id} className="space-y-2">
            <div className="flex items-end justify-between px-0.5">
              <h3 className="font-display text-sm tracking-tight text-[#0a1f1a] dark:text-white">
                {section.name}
              </h3>
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#1a4d42]/40 dark:text-white/35">
                {section.units.length} class
                {section.units.length === 1 ? "" : "es"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {section.units.map((unit) => {
                const meta = healthMeta(unit.health);
                const selected = selectedIds.has(unit.id);
                const subjectsReady =
                  unit.subjectCount > 0 &&
                  unit.subjectsStaffed === unit.subjectCount;
                return (
                  <div key={unit.id} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectMode) toggleSelect(unit);
                        else openClass(unit);
                      }}
                      disabled={selectMode && unit.studentCount > 0}
                      aria-pressed={selectMode ? selected : undefined}
                      title={
                        selectMode && unit.studentCount > 0
                          ? "Move students before deleting this class"
                          : undefined
                      }
                      className={cn(
                        classesCard,
                        "group flex w-full flex-col p-3 pr-10 text-left transition-colors hover:border-[#246a59]/35 dark:hover:border-[#3fae8f]/40",
                        selectMode &&
                          selected &&
                          "border-[#246a59] bg-[#f3f9f7] ring-1 ring-[#246a59]/20 dark:border-[#3fae8f] dark:bg-[#0f2a24]",
                        selectMode &&
                          unit.studentCount > 0 &&
                          "cursor-not-allowed opacity-55",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-sm font-semibold text-[#0a1f1a] group-hover:text-[#246a59] dark:text-white dark:group-hover:text-[#8fe3c8]">
                          {unit.label}
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          <span
                            className={cn("h-1.5 w-1.5 rounded-lg", meta.dot)}
                            title={meta.label}
                          />
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 text-[11px] text-[#1a4d42]/60 dark:text-white/45">
                        <p className="flex items-center gap-1.5">
                          <UserCheck className="h-3 w-3 shrink-0" />
                          <span
                            className={cn(
                              "min-w-0 truncate",
                              !unit.classTeacher &&
                                "text-amber-700 dark:text-amber-400",
                            )}
                          >
                            {unit.classTeacher ?? "No class teacher"}
                          </span>
                        </p>
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3 w-3 shrink-0" />
                            {unit.studentCount} student
                            {unit.studentCount === 1 ? "" : "s"}
                          </span>
                          <span className="text-[#1a4d42]/20 dark:text-white/20">
                            ·
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1",
                              subjectsReady &&
                                "text-emerald-700 dark:text-emerald-400",
                            )}
                            title={
                              unit.subjectCount > 0
                                ? `${unit.subjectsStaffed} of ${unit.subjectCount} subjects staffed`
                                : "No subjects added yet"
                            }
                          >
                            <BookOpen className="h-3 w-3 shrink-0" />
                            {unit.subjectCount > 0
                              ? `${unit.subjectsStaffed}/${unit.subjectCount} staffed`
                              : "No subjects"}
                          </span>
                        </p>
                      </div>
                    </button>

                    {selectMode ? (
                      <span
                        className={cn(
                          "pointer-events-none absolute right-2 top-2 flex h-4 w-4 items-center justify-center border",
                          selected
                            ? "border-[#246a59] bg-[#246a59] text-white"
                            : "border-slate-300 bg-white dark:border-white/30 dark:bg-[#0c1a17]",
                        )}
                      >
                        {selected ? <Check className="h-3 w-3" /> : null}
                      </span>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-lg text-[#1a4d42]/45 transition-colors hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
                            aria-label={`Manage ${unit.label}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onSelect={() => setEditClassUnit(unit)}
                          >
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            Edit class name
                          </DropdownMenuItem>
                          {unit.streamId ? (
                            <DropdownMenuItem
                              onSelect={() => setEditStreamUnit(unit)}
                            >
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Edit stream
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            onSelect={() => setAddStreamUnit(unit)}
                          >
                            <Plus className="mr-2 h-3.5 w-3.5" />
                            Add stream
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={unit.studentCount > 0}
                            onSelect={() => setDeleteUnits([unit])}
                            className="text-rose-600 focus:text-rose-600 dark:text-rose-400"
                            title={
                              unit.studentCount > 0
                                ? "Move students before deleting"
                                : undefined
                            }
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete class
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
      <EditClassDialog
        key={editClassUnit?.id ?? "class-closed"}
        open={Boolean(editClassUnit)}
        unit={editClassUnit}
        saving={actions.isSaving}
        onClose={() => setEditClassUnit(null)}
        onSave={async (name) => {
          if (!editClassUnit) return;
          await actions.renameClass(editClassUnit, name);
          toast.success("Class name updated");
        }}
      />

      <EditStreamDialog
        key={editStreamUnit ? `${editStreamUnit.id}-stream` : "stream-closed"}
        open={Boolean(editStreamUnit)}
        unit={editStreamUnit}
        saving={actions.isSaving}
        onClose={() => setEditStreamUnit(null)}
        onSave={async (name) => {
          if (!editStreamUnit) return;
          await actions.renameStream(editStreamUnit, name);
          toast.success("Stream name updated");
        }}
      />

      <DeleteClassesDialog
        key={
          deleteUnits?.map((unit) => unit.id).join(",") ?? "delete-closed"
        }
        open={Boolean(deleteUnits)}
        units={deleteUnits ?? []}
        allUnits={classUnits}
        deleting={actions.isDeleting}
        onClose={() => setDeleteUnits(null)}
        onConfirm={async () => {
          if (!deleteUnits) return;
          const count = deleteUnits.length;
          await actions.deleteClasses(deleteUnits, classUnits);
          toast.success(
            `${count} class${count === 1 ? "" : "es"} deleted`,
          );
          setSelectMode(false);
          setSelectedIds(new Set());
        }}
      />

      {addStreamUnit ? (
        <AddStreamModal
          isOpen
          onClose={() => setAddStreamUnit(null)}
          onSuccess={() => setAddStreamUnit(null)}
          gradeId={addStreamUnit.gradeId}
          gradeName={addStreamUnit.gradeName}
        />
      ) : null}

    </section>
  );
}