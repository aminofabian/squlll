"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Copy,
  Layers,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useTenantSubjects,
  type TenantSubject,
  tenantSubjectCode,
  tenantSubjectDisplayName,
} from "@/lib/hooks/useTenantSubjects";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { cn } from "@/lib/utils";
import { EditSubjectDialog } from "../../components/EditSubjectDialog";
import { dedupeSubjectsByMaster } from "../utils/dedupeSubjects";
import { useSubjectTeacherMap } from "../utils/useSubjectTeacherMap";
import { AssignSubjectTeacherSheet } from "./AssignSubjectTeacherSheet";
import {
  classesFilterPill,
  classesPrimaryButton,
} from "./classes-ui";
import { initials } from "../utils/classPulse";
import {
  deleteTenantSubjects,
  invalidateSubjectCaches,
} from "../utils/subjectMutations";

type SubjectFilter = "all" | "core" | "elective" | "unstaffed";

interface RawSubject {
  id: string;
  name: string;
  code: string;
  subjectType: "core" | "elective";
  tenantSubjectIds: string[];
  _tenantSubject: TenantSubject;
  levelId: string;
  levelName: string;
  teacher?: string;
}

interface SubjectGroup {
  key: string;
  title: string;
  subtitle: string;
  accent: "core" | "elective" | "level";
  rows: RawSubject[];
}

interface SubjectsViewProps {
  selectedGradeId?: string | null;
  onAddSubject?: () => void;
  /** Global mode: choose the level to add a subject to. */
  onAddSubjectToLevel?: (levelId: string) => void;
}

const FILTERS: { id: SubjectFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "core", label: "Core" },
  { id: "elective", label: "Elective" },
  { id: "unstaffed", label: "Needs teacher" },
];

const accentDot: Record<SubjectGroup["accent"], string> = {
  core: "bg-emerald-500",
  elective: "bg-amber-400",
  level: "bg-[#246a59]",
};

function dedupeWithinLevels(rows: RawSubject[]): RawSubject[] {
  const byLevel = new Map<string, RawSubject[]>();
  for (const row of rows) {
    const bucket = byLevel.get(row.levelId);
    if (bucket) bucket.push(row);
    else byLevel.set(row.levelId, [row]);
  }

  return Array.from(byLevel.values()).flatMap((bucket) =>
    dedupeSubjectsByMaster(bucket),
  );
}

function groupTitleCounts(rows: RawSubject[]) {
  const core = rows.filter((row) => row.subjectType === "core").length;
  const elective = rows.length - core;
  if (core === 0) return `${elective} elective${elective === 1 ? "" : "s"}`;
  if (elective === 0) return `${core} core`;
  return `${core} core · ${elective} elective`;
}

export function SubjectsView({
  selectedGradeId,
  onAddSubject,
  onAddSubjectToLevel,
}: SubjectsViewProps = {}) {
  const { config } = useSchoolConfigStore();
  const { data: tenantSubjects = [], isLoading } = useTenantSubjects();
  const queryClient = useQueryClient();
  const { getTeacherForSubject, refetch: refetchSubjectTeachers } =
    useSubjectTeacherMap();

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<SubjectFilter>("all");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editingSubject, setEditingSubject] = useState<TenantSubject | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<RawSubject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assignSubject, setAssignSubject] = useState<{
    tenantSubjectIds: string[];
    name: string;
  } | null>(null);

  const scopedLevel = useMemo(() => {
    if (!selectedGradeId || !config?.selectedLevels) return null;
    return (
      config.selectedLevels.find((level) =>
        level.gradeLevels?.some((grade) => grade.id === selectedGradeId),
      ) ?? null
    );
  }, [selectedGradeId, config?.selectedLevels]);

  const scopeRows = useMemo(() => {
    const rows: RawSubject[] = tenantSubjects.map((ts) => {
      const name = tenantSubjectDisplayName(ts);
      const code = tenantSubjectCode(ts);
      return {
        id: ts.id,
        name,
        code,
        subjectType:
          ts.subjectType === "core" ? "core" : ("elective" as const),
        tenantSubjectIds: [ts.id],
        _tenantSubject: ts,
        levelId: ts.curriculum?.id ?? "other",
        levelName: ts.curriculum?.name ?? "Other",
      };
    });

    let scoped = rows;
    if (scopedLevel) {
      const ids = new Set(scopedLevel.subjects.map((subject) => subject.id));
      const names = new Set(
        scopedLevel.subjects.map((subject) => subject.name.toLowerCase().trim()),
      );
      const codes = new Set(
        scopedLevel.subjects
          .map((subject) => subject.code?.toLowerCase().trim())
          .filter(Boolean) as string[],
      );
      scoped = rows.filter(
        (row) =>
          row.levelId === scopedLevel.id ||
          ids.has(row.id) ||
          names.has(row.name.toLowerCase().trim()) ||
          (row.code.length > 0 && codes.has(row.code.toLowerCase().trim())),
      );
    }

    return dedupeWithinLevels(scoped).map((row) => ({
      ...row,
      teacher: getTeacherForSubject(row.tenantSubjectIds, {
        _tenantSubject: row._tenantSubject,
        name: row.name,
        code: row.code,
      }),
    }));
  }, [tenantSubjects, scopedLevel, getTeacherForSubject]);

  const searchRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return scopeRows;
    return scopeRows.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        row.levelName.toLowerCase().includes(q) ||
        (row.teacher?.toLowerCase().includes(q) ?? false),
    );
  }, [scopeRows, searchTerm]);

  const filteredRows = useMemo(() => {
    if (filter === "core") {
      return searchRows.filter((row) => row.subjectType === "core");
    }
    if (filter === "elective") {
      return searchRows.filter((row) => row.subjectType === "elective");
    }
    if (filter === "unstaffed") {
      return searchRows.filter((row) => !row.teacher);
    }
    return searchRows;
  }, [searchRows, filter]);

  const counts = useMemo(
    () => ({
      all: searchRows.length,
      core: searchRows.filter((row) => row.subjectType === "core").length,
      elective: searchRows.filter((row) => row.subjectType === "elective")
        .length,
      unstaffed: searchRows.filter((row) => !row.teacher).length,
    }),
    [searchRows],
  );

  const staffedCount = scopeRows.filter((row) => row.teacher).length;
  const coverage =
    scopeRows.length > 0 ? staffedCount / scopeRows.length : 0;

  const levelOrder = useMemo(() => {
    const map = new Map<string, number>();
    config?.selectedLevels.forEach((level, index) => map.set(level.id, index));
    return map;
  }, [config?.selectedLevels]);

  const groups = useMemo<SubjectGroup[]>(() => {
    if (scopedLevel) {
      const core = filteredRows
        .filter((row) => row.subjectType === "core")
        .sort((a, b) => a.name.localeCompare(b.name));
      const elective = filteredRows
        .filter((row) => row.subjectType === "elective")
        .sort((a, b) => a.name.localeCompare(b.name));
      return [
        {
          key: "type:core",
          title: "Core subjects",
          subtitle: "Required for every learner",
          accent: "core" as const,
          rows: core,
        },
        {
          key: "type:elective",
          title: "Elective subjects",
          subtitle: "Optional pathways",
          accent: "elective" as const,
          rows: elective,
        },
      ].filter((group) => group.rows.length > 0);
    }

    const byLevel = new Map<string, RawSubject[]>();
    for (const row of filteredRows) {
      const bucket = byLevel.get(row.levelId);
      if (bucket) bucket.push(row);
      else byLevel.set(row.levelId, [row]);
    }

    return Array.from(byLevel.entries())
      .map(([levelId, rows]) => ({
        key: `level:${levelId}`,
        title: rows[0]?.levelName ?? "Other",
        subtitle: groupTitleCounts(rows),
        accent: "level" as const,
        rows: [...rows].sort((a, b) => {
          if (a.subjectType === "core" && b.subjectType !== "core") return -1;
          if (a.subjectType !== "core" && b.subjectType === "core") return 1;
          return a.name.localeCompare(b.name);
        }),
      }))
      .sort(
        (a, b) =>
          (levelOrder.get(a.key.replace("level:", "")) ?? 99) -
            (levelOrder.get(b.key.replace("level:", "")) ?? 99) ||
          a.title.localeCompare(b.title),
      );
  }, [filteredRows, scopedLevel, levelOrder]);

  const allCollapsed =
    groups.length > 0 && groups.every((group) => collapsed.has(group.key));

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAllGroups = () => {
    if (allCollapsed) {
      setCollapsed(new Set());
      return;
    }
    setCollapsed(new Set(groups.map((group) => group.key)));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilter("all");
  };

  const addControl = (() => {
    if (onAddSubject) {
      return (
        <Button
          type="button"
          size="sm"
          className={cn(
            classesPrimaryButton,
            "h-8 shrink-0 gap-1.5 whitespace-nowrap px-2.5 text-[11px]",
          )}
          onClick={onAddSubject}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      );
    }

    if (!onAddSubjectToLevel || !config?.selectedLevels?.length) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            className={cn(
              classesPrimaryButton,
              "h-8 shrink-0 gap-1.5 whitespace-nowrap px-2.5 text-[11px]",
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
            <ChevronDown className="h-3 w-3 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-lg">
          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#1a4d42]/45">
            Add subject to a level
          </p>
          {config.selectedLevels.map((level) => (
            <DropdownMenuItem
              key={level.id}
              onClick={() => onAddSubjectToLevel(level.id)}
              className="gap-2 text-xs"
            >
              <Layers className="h-3.5 w-3.5 text-[#246a59]" />
              <span className="truncate">{level.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  })();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTenantSubjects(deleteTarget.tenantSubjectIds);
      await invalidateSubjectCaches(queryClient);
      toast.success(`Removed “${deleteTarget.name}”`);
      setDeleteTarget(null);
      void refetchSubjectTeachers();
    } catch (error) {
      await invalidateSubjectCaches(queryClient);
      toast.error(
        error instanceof Error ? error.message : "Couldn’t remove the subject",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 space-y-2 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-4 py-3 dark:border-white/10 dark:bg-[#071411]">
          <div className="h-8 w-full animate-pulse bg-[#e8f2ef] dark:bg-white/5" />
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-6 w-16 animate-pulse bg-[#e8f2ef] dark:bg-white/5"
              />
            ))}
          </div>
        </div>
        <div className="space-y-2 p-4">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse bg-[#e8f2ef] dark:bg-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-2.5 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-4 py-3 dark:border-white/10 dark:bg-[#071411]">
        <div className="flex items-center justify-between gap-2">
          <p className="inline-flex min-w-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#246a59] dark:text-[#8fe3c8]">
            <Layers className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {scopedLevel ? scopedLevel.name : "All levels"}
            </span>
          </p>
          <span className="shrink-0 text-[10px] tabular-nums text-[#1a4d42]/45 dark:text-white/40">
            {staffedCount}/{scopeRows.length} staffed
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1a4d42]/40 dark:text-white/35" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCollapsed(new Set());
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSearchTerm("");
                  event.currentTarget.blur();
                }
              }}
              placeholder="Search name, code or teacher…"
              aria-label="Search subjects by name, code or teacher"
              className="h-8 border-[#1a4d42]/15 bg-white pl-8 pr-8 text-xs shadow-none placeholder:text-[#1a4d42]/40 focus-visible:border-[#246a59]/50 focus-visible:ring-[#246a59]/20 dark:border-white/15 dark:bg-[#0c1a17] dark:placeholder:text-white/40"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear subject search"
                className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center text-[#1a4d42]/40 transition-colors hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>
          {addControl}
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setFilter(item.id);
                setCollapsed(new Set());
              }}
              aria-pressed={filter === item.id}
              className={cn(
                classesFilterPill(filter === item.id),
                "gap-1 px-2 py-1 text-[10px]",
              )}
            >
              {item.label}
              <span className="tabular-nums opacity-60">{counts[item.id]}</span>
            </button>
          ))}
        </div>

        <div className="h-1 w-full overflow-hidden bg-[#1a4d42]/10 dark:bg-white/10">
          <div
            className={cn(
              "h-full transition-[width] duration-500",
              coverage >= 1
                ? "bg-emerald-500/80"
                : coverage >= 0.5
                  ? "bg-[#246a59]"
                  : "bg-amber-500/80",
            )}
            style={{ width: `${Math.round(coverage * 100)}%` }}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#1a4d42]/10 bg-white px-4 py-1.5 dark:border-white/10 dark:bg-[#0c1a17]">
        <p className="text-[10px] tabular-nums text-[#1a4d42]/50 dark:text-white/40">
          Showing{" "}
          <span className="font-semibold text-[#0a1f1a] dark:text-white">
            {filteredRows.length}
          </span>{" "}
          of {scopeRows.length} subject{scopeRows.length === 1 ? "" : "s"}
        </p>
        {groups.length > 1 ? (
          <button
            type="button"
            onClick={toggleAllGroups}
            className="text-[10px] font-semibold text-[#246a59] underline-offset-2 hover:underline dark:text-[#8fe3c8]"
          >
            {allCollapsed ? "Expand all" : "Collapse all"}
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white dark:bg-[#0c1a17]">
        {scopeRows.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f2ef] text-[#246a59] dark:bg-white/5 dark:text-[#8fe3c8]">
              <BookOpen className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-[#0a1f1a] dark:text-white">
              No subjects yet
            </p>
            <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-[#1a4d42]/55 dark:text-white/45">
              Add subjects from the school catalog or create a custom one. They
              apply to every stream in the level.
            </p>
            {onAddSubject ? (
              <Button
                type="button"
                size="sm"
                className={cn(
                  classesPrimaryButton,
                  "mt-3 h-8 gap-1.5 whitespace-nowrap px-3 text-[11px]",
                )}
                onClick={onAddSubject}
              >
                <Plus className="h-3.5 w-3.5" />
                Add first subject
              </Button>
            ) : null}
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f2ef] text-[#246a59] dark:bg-white/5 dark:text-[#8fe3c8]">
              {filter === "unstaffed" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </span>
            <p className="mt-3 text-sm font-semibold text-[#0a1f1a] dark:text-white">
              {filter === "unstaffed"
                ? "Every subject has a teacher"
                : "No subjects match"}
            </p>
            <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-[#1a4d42]/55 dark:text-white/45">
              {filter === "unstaffed"
                ? "Teacher coverage is complete for this scope."
                : "Try a different name or code, or clear the filters."}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-[11px] font-semibold text-[#246a59] underline-offset-2 hover:underline dark:text-[#8fe3c8]"
            >
              Clear search &amp; filters
            </button>
          </div>
        ) : (
          groups.map((group) => {
            const expanded = !collapsed.has(group.key);
            return (
              <section key={group.key}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  aria-expanded={expanded}
                  className="sticky top-0 z-10 flex w-full items-center gap-2 border-b border-[#1a4d42]/10 bg-[#f8fbfa]/95 px-4 py-2 text-left backdrop-blur-md dark:border-white/10 dark:bg-[#071411]/95"
                >
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 text-[#1a4d42]/45 transition-transform dark:text-white/40",
                      !expanded && "-rotate-90",
                    )}
                  />
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-lg",
                      accentDot[group.accent],
                    )}
                  />
                  <span className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0a1f1a] dark:text-white">
                    {group.title}
                  </span>
                  <span className="hidden truncate text-[10px] text-[#1a4d42]/45 dark:text-white/35 sm:inline">
                    {group.subtitle}
                  </span>
                  <span className="ml-auto shrink-0 text-[10px] font-semibold tabular-nums text-[#1a4d42]/50 dark:text-white/40">
                    {group.rows.length}
                  </span>
                </button>

                {expanded ? (
                  <ul className="divide-y divide-[#1a4d42]/8 dark:divide-white/8">
                    {group.rows.map((row) => (
                      <SubjectRow
                        key={`${group.key}:${row.id}`}
                        row={row}
                        showType={!scopedLevel}
                        onAssign={() =>
                          setAssignSubject({
                            tenantSubjectIds: row.tenantSubjectIds,
                            name: row.name,
                          })
                        }
                        onEdit={() => setEditingSubject(row._tenantSubject)}
                        onDelete={() => setDeleteTarget(row)}
                      />
                    ))}
                  </ul>
                ) : null}
              </section>
            );
          })
        )}
      </div>

      {assignSubject ? (
        <AssignSubjectTeacherSheet
          open={Boolean(assignSubject)}
          onOpenChange={(open) => {
            if (!open) setAssignSubject(null);
          }}
          tenantSubjectIds={assignSubject.tenantSubjectIds}
          subjectName={assignSubject.name}
          onAssigned={() => {
            void refetchSubjectTeachers();
            void queryClient.invalidateQueries({ queryKey: ["getTeachers"] });
          }}
        />
      ) : null}

      {editingSubject ? (
        <EditSubjectDialog
          subject={{
            id: editingSubject.id,
            name: tenantSubjectDisplayName(editingSubject),
            code: tenantSubjectCode(editingSubject),
            subjectType: editingSubject.subjectType,
            category:
              editingSubject.subject?.category ||
              editingSubject.customSubject?.category ||
              null,
            department:
              editingSubject.subject?.department ||
              editingSubject.customSubject?.department ||
              null,
            shortName:
              editingSubject.subject?.shortName ||
              editingSubject.customSubject?.shortName ||
              null,
            isCompulsory: editingSubject.isCompulsory,
            totalMarks: editingSubject.totalMarks,
            passingMarks: editingSubject.passingMarks,
            creditHours: editingSubject.creditHours,
            curriculum: editingSubject.curriculum.name,
          }}
          isOpen={Boolean(editingSubject)}
          onClose={() => setEditingSubject(null)}
          onSave={() => {
            setEditingSubject(null);
            void invalidateSubjectCaches(queryClient);
          }}
          tenantSubjectId={editingSubject.id}
        />
      ) : null}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {deleteTarget?.name ?? "this subject"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the subject from{" "}
              <span className="font-medium">
                {scopedLevel?.name ?? deleteTarget?.levelName ?? "the curriculum"}
              </span>{" "}
              — every class and stream that shares it. Timetable lessons and exam
              papers that reference it may need attention.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting}
              className="gap-1.5 bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Remove subject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SubjectRow({
  row,
  showType,
  onAssign,
  onEdit,
  onDelete,
}: {
  row: RawSubject;
  showType: boolean;
  onAssign: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="group flex items-center gap-2 px-3 py-2 transition-colors hover:bg-[#f8fbfa] dark:hover:bg-white/[0.03] sm:px-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className="truncate text-[13px] font-medium text-[#0a1f1a] dark:text-white"
            title={row.name}
          >
            {row.name}
          </p>
          {row.code ? (
            <span className="shrink-0 border border-[#1a4d42]/10 bg-[#f3f7f5] px-1.5 py-0.5 font-mono text-[9px] text-[#1a4d42]/50 dark:border-white/10 dark:bg-white/5 dark:text-white/40">
              {row.code}
            </span>
          ) : null}
          {showType ? (
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                row.subjectType === "core"
                  ? "bg-[#246a59]/10 text-[#246a59] dark:bg-[#246a59]/25 dark:text-[#8fe3c8]"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
              )}
            >
              {row.subjectType}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-[10px] text-[#1a4d42]/45 dark:text-white/35">
          {row.teacher ? `Taught by ${row.teacher}` : "No teacher assigned yet"}
        </p>
      </div>

      {row.teacher ? (
        <button
          type="button"
          onClick={onAssign}
          title={`Change teacher for ${row.name}`}
          className="hidden max-w-[8.5rem] shrink-0 items-center gap-1.5 border border-[#1a4d42]/10 bg-[#f8fbfa] px-1.5 py-0.5 text-left transition-colors hover:border-[#246a59]/35 dark:border-white/10 dark:bg-white/5 sm:inline-flex"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#246a59]/10 text-[8px] font-bold text-[#246a59] dark:bg-[#246a59]/25 dark:text-[#8fe3c8]">
            {initials(row.teacher)}
          </span>
          <span className="truncate text-[10px] font-medium text-[#0a1f1a] dark:text-white">
            {row.teacher}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onAssign}
          className="inline-flex h-7 shrink-0 items-center gap-1 border border-dashed border-amber-300 bg-amber-50 px-2 text-[10px] font-semibold text-amber-800 transition-colors hover:border-amber-400 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
        >
          <UserPlus className="h-3 w-3" />
          Assign
        </button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Actions for ${row.name}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center text-[#1a4d42]/45 transition-colors hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-lg">
          <DropdownMenuItem onClick={onAssign} className="gap-2 text-xs">
            <UserPlus className="h-3.5 w-3.5" />
            {row.teacher ? "Change teacher" : "Assign teacher"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit} className="gap-2 text-xs">
            <Pencil className="h-3.5 w-3.5" />
            Edit subject
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (!row.code) return;
              void navigator.clipboard?.writeText(row.code);
              toast.success("Code copied");
            }}
            disabled={!row.code}
            className="gap-2 text-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy code
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onDelete}
            className="gap-2 text-xs text-red-600 focus:text-red-700 dark:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove subject
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
