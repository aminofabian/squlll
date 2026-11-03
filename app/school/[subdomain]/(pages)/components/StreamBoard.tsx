"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, Minus, Plus, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import {
  formatGradeDisplayName,
  getGradeSortOrder,
} from "@/lib/utils/grade-display";
import { useClassDirectoryActions } from "../classes/hooks/useClassDirectoryActions";
import type { CampusClassUnit } from "../classes/components/ClassesCampusOverview";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";
import { cn } from "@/lib/utils";

interface StudentLike {
  grade?: { gradeLevel?: { id?: string } } | string;
  streamId?: string | null;
}

interface StreamBoardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: SchoolConfiguration | null;
  students: StudentLike[];
  defaultGradeIds?: string[];
}

type Cell = {
  streamId: string;
  name: string;
  studentCount: number;
};

type GradeRow = {
  id: string;
  name: string;
  levelId: string;
  levelName: string;
  streams: Map<string, Cell>;
};

type Removal = {
  gradeId: string;
  streamId: string;
  name: string;
};

const PRESETS: { label: string; names: string[] }[] = [
  { label: "A and B", names: ["A", "B"] },
  { label: "A, B and C", names: ["A", "B", "C"] },
];

function streamKey(name: string) {
  return name.trim().toLowerCase();
}

function joinNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function countStudents(
  students: StudentLike[],
  gradeId: string,
  streamId: string,
) {
  let count = 0;
  for (const student of students) {
    const studentGradeId =
      typeof student.grade === "object"
        ? student.grade?.gradeLevel?.id
        : undefined;
    if (studentGradeId === gradeId && student.streamId === streamId) count += 1;
  }
  return count;
}

export function StreamBoard({
  open,
  onOpenChange,
  config,
  students,
  defaultGradeIds,
}: StreamBoardProps) {
  const actions = useClassDirectoryActions();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [draftName, setDraftName] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [selectedGradeIds, setSelectedGradeIds] = useState<Set<string>>(
    () => new Set(defaultGradeIds ?? []),
  );
  const [removals, setRemovals] = useState<Removal[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    const next: GradeRow[] = [];
    for (const level of config?.selectedLevels ?? []) {
      const grades = [...(level.gradeLevels ?? [])].sort(
        (a, b) => getGradeSortOrder(a.name) - getGradeSortOrder(b.name),
      );
      for (const grade of grades) {
        const streams = new Map<string, Cell>();
        for (const stream of grade.streams ?? []) {
          const key = streamKey(stream.name);
          if (!key || streams.has(key)) continue;
          streams.set(key, {
            streamId: stream.id,
            name: stream.name,
            studentCount: countStudents(students, grade.id, stream.id),
          });
        }
        next.push({
          id: grade.id,
          name: formatGradeDisplayName(grade.name),
          levelId: level.id,
          levelName: level.name,
          streams,
        });
      }
    }
    return next;
  }, [config?.selectedLevels, students]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(term) ||
        row.levelName.toLowerCase().includes(term),
    );
  }, [rows, search]);

  const groups = useMemo(() => {
    const grouped = new Map<string, GradeRow[]>();
    for (const row of filteredRows) {
      const list = grouped.get(row.levelName) ?? [];
      list.push(row);
      grouped.set(row.levelName, list);
    }
    return Array.from(grouped, ([levelName, grades]) => ({
      levelName,
      grades,
    }));
  }, [filteredRows]);

  const columns = useMemo(() => {
    const found = new Map<string, string>();
    for (const row of rows) {
      for (const cell of row.streams.values()) {
        const key = streamKey(cell.name);
        if (!found.has(key)) found.set(key, cell.name);
      }
    }
    return Array.from(found, ([key, name]) => ({ key, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [rows]);

  const selectedGrades = rows.filter((row) => selectedGradeIds.has(row.id));

  const creates = selectedGrades.flatMap((grade) =>
    names
      .filter((name) => !grade.streams.has(streamKey(name)))
      .map((name) => ({
        gradeId: grade.id,
        gradeName: grade.name,
        name,
      })),
  );

  const skipped = selectedGrades.flatMap((grade) =>
    names
      .filter((name) => grade.streams.has(streamKey(name)))
      .map((name) => `${grade.name} already has ${name}`),
  );

  const missing = useMemo(() => {
    const withStreams = rows.filter((row) => row.streams.size > 0);
    if (withStreams.length < 2) return [];
    const counts = new Map<string, { name: string; count: number }>();
    for (const row of withStreams) {
      for (const cell of row.streams.values()) {
        const key = streamKey(cell.name);
        const current = counts.get(key) ?? { name: cell.name, count: 0 };
        current.count += 1;
        counts.set(key, current);
      }
    }
    const threshold = Math.ceil(withStreams.length / 2);
    const common = Array.from(counts.values()).filter(
      (item) => item.count >= threshold,
    );
    return rows.flatMap((grade) =>
      common
        .filter((item) => !grade.streams.has(streamKey(item.name)))
        .map((item) => ({
          gradeId: grade.id,
          gradeName: grade.name,
          name: item.name,
        })),
    );
  }, [rows]);

  const addNames = (incoming: string[]) => {
    setNames((current) => {
      const next = [...current];
      const seen = new Set(current.map(streamKey));
      for (const name of incoming) {
        const trimmed = name.trim();
        const key = streamKey(trimmed);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        next.push(trimmed);
      }
      return next;
    });
    setError(null);
  };

  const commitDraft = () => {
    const parts = draftName.split(/[\n,]/);
    if (parts.some((part) => part.trim())) addNames(parts);
    setDraftName("");
  };

  const toggleGrade = (gradeId: string) => {
    setSelectedGradeIds((current) => {
      const next = new Set(current);
      if (next.has(gradeId)) next.delete(gradeId);
      else next.add(gradeId);
      return next;
    });
    setError(null);
  };

  const toggleLevel = (grades: GradeRow[]) => {
    setSelectedGradeIds((current) => {
      const next = new Set(current);
      const allOn = grades.every((grade) => next.has(grade.id));
      for (const grade of grades) {
        if (allOn) next.delete(grade.id);
        else next.add(grade.id);
      }
      return next;
    });
  };

  const createStreams = async (
    pairs: { gradeId: string; name: string }[],
    options?: { clearNames?: boolean },
  ) => {
    setSaving(true);
    setError(null);
    let created = 0;
    const failures: string[] = [];
    try {
      for (const pair of pairs) {
        const response = await fetch("/api/school/create-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: pair.name,
            capacity: "30",
            gradeId: pair.gradeId,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          const detail = Array.isArray(data.details)
            ? data.details[0]?.message
            : undefined;
          failures.push(detail || data.error || `Could not add ${pair.name}`);
          continue;
        }
        created += 1;
      }
      await queryClient.invalidateQueries({ queryKey: ["schoolConfig"] });
      if (created > 0) {
        toast.success(
          created === 1 ? "Stream added" : `${created} streams added`,
        );
      }
      if (failures.length > 0) {
        setError(failures[0]);
      } else if (options?.clearNames) {
        setNames([]);
        setDraftName("");
      }
    } catch (err) {
      setError(getDisplayErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const queueRemoval = (grade: GradeRow, cell: Cell) => {
    if (cell.studentCount > 0) {
      toast.error(
        `${grade.name} ${cell.name} has ${cell.studentCount} student${cell.studentCount === 1 ? "" : "s"}. Move them before removing it.`,
      );
      return;
    }
    setRemovals((current) => {
      const exists = current.some(
        (item) => item.gradeId === grade.id && item.streamId === cell.streamId,
      );
      if (exists) {
        return current.filter(
          (item) =>
            !(item.gradeId === grade.id && item.streamId === cell.streamId),
        );
      }
      return [
        ...current,
        { gradeId: grade.id, streamId: cell.streamId, name: cell.name },
      ];
    });
    setConfirming(false);
  };

  const clearEmptyColumn = (name: string) => {
    const next: Removal[] = [];
    let blocked = 0;
    for (const grade of rows) {
      const cell = grade.streams.get(streamKey(name));
      if (!cell) continue;
      if (cell.studentCount > 0) {
        blocked += 1;
        continue;
      }
      next.push({
        gradeId: grade.id,
        streamId: cell.streamId,
        name: cell.name,
      });
    }
    setRemovals(next);
    setConfirming(next.length > 0);
    if (blocked > 0) {
      toast.error(
        `${blocked} grade${blocked === 1 ? "" : "s"} still have students in ${name}. Those stay.`,
      );
    } else if (next.length === 0) {
      toast.error(`${name} is not on any grade.`);
    }
  };

  const applyRemovals = async () => {
    setError(null);
    try {
      const units: CampusClassUnit[] = removals.map((change) => {
        const grade = rows.find((row) => row.id === change.gradeId);
        return {
          id: `${change.gradeId}:${change.streamId}`,
          gradeId: change.gradeId,
          levelId: grade?.levelId ?? "",
          label: `${grade?.name ?? "Grade"} · ${change.name}`,
          gradeName: grade?.name ?? "Grade",
          levelName: grade?.levelName ?? "",
          streamId: change.streamId,
          streamName: change.name,
          studentCount: 0,
          subjectCount: 0,
          subjectsStaffed: 0,
          classTeacher: null,
          health: "empty",
        };
      });
      await actions.deleteStreams(units);
      toast.success(
        removals.length === 1
          ? "Stream removed"
          : `${removals.length} streams removed`,
      );
      setRemovals([]);
      setConfirming(false);
    } catch (err) {
      setError(getDisplayErrorMessage(err));
    }
  };

  const presetActive = (presetNames: string[]) =>
    names.length === presetNames.length &&
    presetNames.every((name, index) => streamKey(names[index] ?? "") === streamKey(name));

  const addLabel =
    names.length === 0
      ? "Choose stream names"
      : selectedGrades.length === 0
        ? "Choose grades"
        : creates.length === 0
          ? "Already on those grades"
          : `Add ${joinNames(names)} to ${selectedGrades.length} grade${selectedGrades.length === 1 ? "" : "s"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-200 px-5 py-4 text-left dark:border-slate-800">
          <DialogTitle>Add streams</DialogTitle>
          <DialogDescription>
            Name the streams, tick the grades, then add them. A grade that
            already has a name is skipped.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-auto px-5 py-4">
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                1. What are the streams called?
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Pick a common set, or type your own names.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setNames(preset.names)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium",
                    presetActive(preset.names)
                      ? "border-[#246a59] bg-[#e8f2ef] text-[#246a59]"
                      : "border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {names.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {names.map((name) => (
                  <span
                    key={streamKey(name)}
                    className="inline-flex items-center gap-1 rounded-full bg-[#e8f2ef] px-2.5 py-1 text-xs font-medium text-[#246a59]"
                  >
                    {name}
                    <button
                      type="button"
                      aria-label={`Remove ${name}`}
                      onClick={() =>
                        setNames((current) =>
                          current.filter(
                            (item) => streamKey(item) !== streamKey(name),
                          ),
                        )
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <div className="flex gap-2">
              <Input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitDraft();
                  }
                }}
                placeholder="Type a name, then press Enter"
                className="h-9 text-sm"
              />
              <Button
                type="button"
                variant="outline"
                className="h-9 shrink-0"
                onClick={commitDraft}
                disabled={!draftName.trim()}
              >
                Add name
              </Button>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  2. Which grades get them?
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {selectedGrades.length === 0
                    ? "Tick one grade, a whole level, or every grade."
                    : `${selectedGrades.length} grade${selectedGrades.length === 1 ? "" : "s"} selected.`}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  className="font-medium text-[#246a59]"
                  onClick={() =>
                    setSelectedGradeIds(new Set(rows.map((row) => row.id)))
                  }
                >
                  All grades
                </button>
                <button
                  type="button"
                  className="font-medium text-slate-500"
                  onClick={() => setSelectedGradeIds(new Set())}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search grades"
                className="h-9 pl-8 text-sm"
              />
            </div>

            {groups.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                No grades to show yet. Add a grade first.
              </p>
            ) : (
              <div className="space-y-4">
                {groups.map((group) => {
                  const allOn = group.grades.every((grade) =>
                    selectedGradeIds.has(grade.id),
                  );
                  return (
                    <div key={group.levelName} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          {group.levelName}
                        </p>
                        <button
                          type="button"
                          className="text-[11px] font-medium text-[#246a59]"
                          onClick={() => toggleLevel(group.grades)}
                        >
                          {allOn ? "Clear level" : "Whole level"}
                        </button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {group.grades.map((grade) => {
                          const checked = selectedGradeIds.has(grade.id);
                          const existing = Array.from(grade.streams.values()).map(
                            (cell) => cell.name,
                          );
                          const willAdd = names.filter(
                            (name) => !grade.streams.has(streamKey(name)),
                          );
                          return (
                            <label
                              key={grade.id}
                              className={cn(
                                "flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5",
                                checked
                                  ? "border-[#246a59] bg-[#e8f2ef]/60"
                                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
                              )}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleGrade(grade.id)}
                                aria-label={grade.name}
                                className="mt-0.5"
                              />
                              <span className="min-w-0">
                                <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                                  {grade.name}
                                </span>
                                <span className="mt-0.5 block text-[11px] text-slate-500">
                                  {checked && names.length > 0
                                    ? willAdd.length === 0
                                      ? `Already has ${joinNames(names)}`
                                      : `Will add ${joinNames(willAdd)}`
                                    : existing.length > 0
                                      ? `Has ${existing.join(", ")}`
                                      : "No streams yet"}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {skipped.length > 0 && creates.length > 0 ? (
              <p className="text-xs text-slate-500">
                {skipped.length === 1
                  ? `${skipped[0]}. That one is left as it is.`
                  : `${skipped.length} streams already exist and will be left as they are.`}
              </p>
            ) : null}
            {error ? (
              <p className="text-xs font-medium text-rose-600" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="button"
              className="h-10 w-full bg-[#0a1f1a] text-white hover:bg-[#246a59] sm:w-auto"
              disabled={creates.length === 0 || saving}
              onClick={() => void createStreams(creates, { clearNames: true })}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {addLabel}
            </Button>
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Streams already in the school
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  A dash adds that stream to one grade. A tick marks an empty
                  stream for removal.
                </p>
              </div>
              {missing.length > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={saving}
                  onClick={() => void createStreams(missing)}
                >
                  Add {missing.length} missing
                </Button>
              ) : null}
            </div>

            {columns.length === 0 ? (
              <p className="text-xs text-slate-500">
                No streams yet. Use the steps above to add the first ones.
              </p>
            ) : (
              <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full border-separate border-spacing-0 text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="sticky left-0 z-10 min-w-36 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                        Grade
                      </th>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className="min-w-24 border-b border-slate-200 px-2 py-2 text-center font-medium text-slate-700 dark:border-slate-800"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span>{column.name}</span>
                            <button
                              type="button"
                              className="text-[10px] font-medium text-rose-600"
                              onClick={() => clearEmptyColumn(column.name)}
                            >
                              Remove empty
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((grade) => (
                      <tr key={grade.id}>
                        <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
                          <span className="block font-medium text-slate-800 dark:text-slate-100">
                            {grade.name}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {grade.levelName}
                          </span>
                        </td>
                        {columns.map((column) => {
                          const cell = grade.streams.get(column.key);
                          const marked = removals.some(
                            (item) =>
                              item.gradeId === grade.id &&
                              item.streamId === cell?.streamId,
                          );
                          const blocked = (cell?.studentCount ?? 0) > 0;
                          return (
                            <td
                              key={column.key}
                              className="border-b border-slate-100 px-2 py-1.5 text-center dark:border-slate-800/70"
                            >
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => {
                                  if (!cell) {
                                    void createStreams([
                                      { gradeId: grade.id, name: column.name },
                                    ]);
                                    return;
                                  }
                                  queueRemoval(grade, cell);
                                }}
                                className={cn(
                                  "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-1.5 text-[11px] font-medium",
                                  marked &&
                                    "border-rose-300 bg-rose-50 text-rose-700",
                                  !marked &&
                                    cell &&
                                    !blocked &&
                                    "border-slate-200 bg-white text-slate-700",
                                  !marked &&
                                    blocked &&
                                    "border-amber-200 bg-amber-50 text-amber-800",
                                  !cell &&
                                    "border-dashed border-slate-200 text-slate-300",
                                )}
                                title={
                                  !cell
                                    ? `Add ${column.name} to ${grade.name}`
                                    : blocked
                                      ? `${cell.studentCount} students. Move them before removing this stream.`
                                      : marked
                                        ? "Will be removed"
                                        : "Mark for removal"
                                }
                              >
                                {!cell ? (
                                  <Minus className="h-3.5 w-3.5" />
                                ) : marked ? (
                                  <X className="h-3.5 w-3.5" />
                                ) : (
                                  <span className="inline-flex items-center gap-1">
                                    <Check className="h-3.5 w-3.5" />
                                    {blocked ? cell.studentCount : null}
                                  </span>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {confirming && removals.length > 0 ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-slate-700">
                <p className="font-medium text-rose-700">
                  Remove {removals.length} empty stream
                  {removals.length === 1 ? "" : "s"}?
                </p>
                <p className="mt-1 text-slate-600">
                  {removals
                    .slice(0, 8)
                    .map((change) => {
                      const grade = rows.find((row) => row.id === change.gradeId);
                      return `${grade?.name ?? "Grade"} ${change.name}`;
                    })
                    .join(", ")}
                  {removals.length > 8 ? ` and ${removals.length - 8} more` : ""}.
                  Grades stay. Streams with students are not included.
                </p>
              </div>
            ) : null}
            {removals.length > 0 ? (
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={actions.isDeleting}
                  onClick={() => {
                    setRemovals([]);
                    setConfirming(false);
                  }}
                >
                  Keep them
                </Button>
                {confirming ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={actions.isDeleting}
                    onClick={() => void applyRemovals()}
                  >
                    {actions.isDeleting ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    Remove streams
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirming(true)}
                  >
                    Review removal
                  </Button>
                )}
              </div>
            ) : null}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
