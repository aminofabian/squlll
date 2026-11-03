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

type Pending =
  | { type: "add"; gradeId: string; name: string }
  | {
      type: "remove";
      gradeId: string;
      streamId: string;
      name: string;
    };

const PRESETS = [
  { label: "A & B", names: ["A", "B"] },
  { label: "A, B & C", names: ["A", "B", "C"] },
];

function streamKey(name: string) {
  return name.trim().toLowerCase();
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

function parseNames(value: string) {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const part of value.split(/[\n,]/)) {
    const name = part.trim();
    const key = streamKey(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
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
  const [customNames, setCustomNames] = useState("");
  const [selectedGradeIds, setSelectedGradeIds] = useState<Set<string>>(
    () => new Set(defaultGradeIds ?? []),
  );
  const [pending, setPending] = useState<Pending[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
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

  const visibleRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(term) ||
        row.levelName.toLowerCase().includes(term),
    );
  }, [rows, search]);

  const columns = useMemo(() => {
    const names = new Map<string, string>();
    for (const row of rows) {
      for (const cell of row.streams.values()) {
        const key = streamKey(cell.name);
        if (!names.has(key)) names.set(key, cell.name);
      }
    }
    for (const change of pending) {
      if (change.type !== "add") continue;
      const key = streamKey(change.name);
      if (!names.has(key)) names.set(key, change.name);
    }
    return Array.from(names, ([key, name]) => ({ key, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [rows, pending]);

  const commonKeys = useMemo(() => {
    const withStreams = rows.filter((row) => row.streams.size > 0);
    if (withStreams.length < 2) return [];
    const counts = new Map<string, number>();
    for (const row of withStreams) {
      for (const key of row.streams.keys()) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    const threshold = Math.ceil(withStreams.length / 2);
    return Array.from(counts.entries())
      .filter(([, count]) => count >= threshold)
      .map(([key]) => key);
  }, [rows]);

  const gapCount = rows.filter((row) =>
    commonKeys.some((key) => !row.streams.has(key)),
  ).length;

  const targets = rows.filter((row) =>
    selectedGradeIds.size === 0 ? true : selectedGradeIds.has(row.id),
  );

  const pendingFor = (gradeId: string, name: string) =>
    pending.find(
      (change) =>
        change.gradeId === gradeId && streamKey(change.name) === streamKey(name),
    );

  const queueAdds = (names: string[], gradeRows: GradeRow[]) => {
    const additions: Pending[] = [];
    let skipped = 0;
    for (const grade of gradeRows) {
      for (const name of names) {
        if (grade.streams.has(streamKey(name))) {
          skipped += 1;
          continue;
        }
        additions.push({ type: "add", gradeId: grade.id, name });
      }
    }
    setPending((current) => {
      const next = current.filter(
        (change) =>
          !additions.some(
            (addition) =>
              addition.gradeId === change.gradeId &&
              streamKey(addition.name) === streamKey(change.name),
          ),
      );
      return [...next, ...additions];
    });
    setNotice(
      additions.length === 0
        ? "Those streams are already on the selected grades."
        : skipped > 0
          ? `Queued ${additions.length} new stream${additions.length === 1 ? "" : "s"}. ${skipped} already existed and were left alone.`
          : null,
    );
    setConfirming(false);
  };

  const queueClearColumn = (name: string) => {
    const removals: Pending[] = [];
    let blocked = 0;
    for (const grade of targets) {
      const cell = grade.streams.get(streamKey(name));
      if (!cell) continue;
      if (cell.studentCount > 0) {
        blocked += 1;
        continue;
      }
      removals.push({
        type: "remove",
        gradeId: grade.id,
        streamId: cell.streamId,
        name: cell.name,
      });
    }
    setPending((current) => {
      const next = current.filter(
        (change) =>
          !(
            streamKey(change.name) === streamKey(name) &&
            targets.some((grade) => grade.id === change.gradeId)
          ),
      );
      return [...next, ...removals];
    });
    setNotice(
      blocked > 0
        ? `${blocked} grade${blocked === 1 ? "" : "s"} still have students in ${name}, so those were left in place.`
        : removals.length === 0
          ? `${name} is not on the selected grades.`
          : null,
    );
    setConfirming(false);
  };

  const toggleCell = (grade: GradeRow, name: string) => {
    const existing = pendingFor(grade.id, name);
    if (existing) {
      setPending((current) =>
        current.filter(
          (change) =>
            !(
              change.gradeId === grade.id &&
              streamKey(change.name) === streamKey(name)
            ),
        ),
      );
      return;
    }
    const cell = grade.streams.get(streamKey(name));
    if (cell?.studentCount) {
      toast.error(
        `${grade.name} ${cell.name} has ${cell.studentCount} student${cell.studentCount === 1 ? "" : "s"}. Move them before removing it.`,
      );
      return;
    }
    setPending((current) => [
      ...current,
      cell
        ? {
            type: "remove",
            gradeId: grade.id,
            streamId: cell.streamId,
            name: cell.name,
          }
        : { type: "add", gradeId: grade.id, name },
    ]);
    setConfirming(false);
  };

  const adds = pending.filter((change) => change.type === "add");
  const removes = pending.filter((change) => change.type === "remove");

  const apply = async () => {
    setError(null);
    let created = 0;
    const failures: string[] = [];
    try {
      for (const change of adds) {
        const response = await fetch("/api/school/create-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: change.name,
            capacity: "30",
            gradeId: change.gradeId,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          const detail = Array.isArray(data.details)
            ? data.details[0]?.message
            : undefined;
          failures.push(detail || data.error || `Could not add ${change.name}`);
          continue;
        }
        created += 1;
      }

      if (removes.length > 0) {
        const units: CampusClassUnit[] = removes.map((change) => {
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
      } else {
        await queryClient.invalidateQueries({ queryKey: ["schoolConfig"] });
      }

      const removed = removes.length;
      toast.success(
        [
          created ? `Added ${created}` : null,
          removed ? `removed ${removed}` : null,
        ]
          .filter(Boolean)
          .join(" and ") || "Stream board updated",
      );
      if (failures.length > 0) {
        setError(failures[0]);
      } else {
        setPending([]);
        setConfirming(false);
        setNotice(null);
      }
    } catch (err) {
      setError(getDisplayErrorMessage(err));
    }
  };

  const toggleGrade = (gradeId: string) => {
    setSelectedGradeIds((current) => {
      const next = new Set(current);
      if (next.has(gradeId)) next.delete(gradeId);
      else next.add(gradeId);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-slate-200 px-5 py-4 text-left dark:border-slate-800">
          <DialogTitle>Streams across the school</DialogTitle>
          <DialogDescription>
            Tick a grade, then add A and B everywhere they are missing. Empty
            cells can be cleared without opening each grade. Nothing is saved
            until you apply.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search grades"
                className="h-8 pl-7 text-xs"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => queueAdds(preset.names, targets)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {preset.label}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={gapCount === 0}
                onClick={() => {
                  const names = columns
                    .filter((column) => commonKeys.includes(column.key))
                    .map((column) => column.name);
                  const missing = rows.filter((row) =>
                    commonKeys.some((key) => !row.streams.has(key)),
                  );
                  queueAdds(names, missing);
                }}
              >
                Fill {gapCount || ""} gap{gapCount === 1 ? "" : "s"}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={customNames}
              onChange={(event) => setCustomNames(event.target.value)}
              placeholder="Custom names, one per line or comma: North, South"
              className="h-8 text-xs"
            />
            <Button
              type="button"
              size="sm"
              className="h-8 shrink-0 text-xs"
              onClick={() => queueAdds(parseNames(customNames), targets)}
            >
              Add to {selectedGradeIds.size || rows.length} grade
              {(selectedGradeIds.size || rows.length) === 1 ? "" : "s"}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <button
              type="button"
              className="font-medium text-[#246a59]"
              onClick={() =>
                setSelectedGradeIds(new Set(visibleRows.map((row) => row.id)))
              }
            >
              Select visible
            </button>
            <button
              type="button"
              className="font-medium text-[#246a59]"
              onClick={() => setSelectedGradeIds(new Set())}
            >
              Use every grade
            </button>
            <span>
              {selectedGradeIds.size === 0
                ? "Presets apply to every grade."
                : `Presets apply to ${selectedGradeIds.size} selected grade${selectedGradeIds.size === 1 ? "" : "s"}.`}
            </span>
            {gapCount > 0 ? (
              <span className="text-amber-700">
                {gapCount} grade{gapCount === 1 ? "" : "s"} missing a stream
                others already use.
              </span>
            ) : null}
          </div>
          {notice ? <p className="text-xs text-slate-600">{notice}</p> : null}
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {visibleRows.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              No grades to show yet. Add a grade first.
            </p>
          ) : (
            <table className="w-full border-separate border-spacing-0 text-left text-xs">
              <thead className="sticky top-0 z-20 bg-white dark:bg-slate-950">
                <tr>
                  <th className="sticky left-0 z-30 min-w-40 border-b border-r border-slate-200 bg-white px-3 py-2 font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950">
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
                          onClick={() => queueClearColumn(column.name)}
                        >
                          Clear empty
                        </button>
                      </div>
                    </th>
                  ))}
                  {columns.length === 0 ? (
                    <th className="border-b border-slate-200 px-3 py-2 font-normal text-slate-400">
                      No streams yet. Use A &amp; B to start.
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((grade) => {
                  const dimmed =
                    selectedGradeIds.size > 0 &&
                    !selectedGradeIds.has(grade.id);
                  return (
                    <tr key={grade.id} className="hover:bg-slate-50/80">
                      <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedGradeIds.has(grade.id)}
                            onCheckedChange={() => toggleGrade(grade.id)}
                            aria-label={`Include ${grade.name}`}
                          />
                          <span className="min-w-0">
                            <span className="block font-medium text-slate-800 dark:text-slate-100">
                              {grade.name}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {grade.levelName}
                              {grade.streams.size === 0
                                ? " · no streams"
                                : ` · ${grade.streams.size}`}
                            </span>
                          </span>
                        </label>
                      </td>
                      {columns.map((column) => {
                        const cell = grade.streams.get(column.key);
                        const change = pendingFor(grade.id, column.name);
                        const blocked = (cell?.studentCount ?? 0) > 0;
                        return (
                          <td
                            key={column.key}
                            className="border-b border-slate-100 px-2 py-1.5 text-center dark:border-slate-800/70"
                          >
                            <button
                              type="button"
                              onClick={() => toggleCell(grade, column.name)}
                              className={cn(
                                "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-1.5 text-[11px] font-medium",
                                change?.type === "add" &&
                                  "border-[#246a59] bg-[#e8f2ef] text-[#246a59]",
                                change?.type === "remove" &&
                                  "border-rose-300 bg-rose-50 text-rose-700",
                                !change &&
                                  cell &&
                                  !blocked &&
                                  "border-slate-200 bg-white text-slate-700",
                                !change &&
                                  blocked &&
                                  "border-amber-200 bg-amber-50 text-amber-800",
                                !change &&
                                  !cell &&
                                  "border-dashed border-slate-200 text-slate-300",
                                dimmed && "opacity-45",
                              )}
                              title={
                                blocked
                                  ? `${cell?.studentCount} students. Move them before removing this stream.`
                                  : change?.type === "add"
                                    ? "Will be added"
                                    : change?.type === "remove"
                                      ? "Will be removed"
                                      : cell
                                        ? "Click to remove"
                                        : "Click to add"
                              }
                            >
                              {change?.type === "add" ? (
                                <Plus className="h-3.5 w-3.5" />
                              ) : change?.type === "remove" ? (
                                <X className="h-3.5 w-3.5" />
                              ) : cell ? (
                                <span className="inline-flex items-center gap-1">
                                  <Check className="h-3.5 w-3.5" />
                                  {blocked ? cell.studentCount : null}
                                </span>
                              ) : (
                                <Minus className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-2 border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
          {confirming && removes.length > 0 ? (
            <div className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs text-slate-700">
              <p className="font-medium text-rose-700">
                Remove {removes.length} empty stream
                {removes.length === 1 ? "" : "s"}?
              </p>
              <p className="mt-1 text-slate-500">
                {removes
                  .slice(0, 8)
                  .map((change) => {
                    const grade = rows.find((row) => row.id === change.gradeId);
                    return `${grade?.name ?? "Grade"} ${change.name}`;
                  })
                  .join(", ")}
                {removes.length > 8 ? ` and ${removes.length - 8} more` : ""}.
                The grades stay. Streams with students are not included.
              </p>
            </div>
          ) : null}
          {error ? (
            <p className="text-xs font-medium text-rose-600" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-500">
              {pending.length === 0
                ? "Click a cell, or use a preset. Green adds, red removes."
                : `${adds.length} to add · ${removes.length} to remove`}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending.length === 0 || actions.isDeleting}
                onClick={() => {
                  setPending([]);
                  setConfirming(false);
                  setNotice(null);
                  setError(null);
                }}
              >
                Discard
              </Button>
              {confirming && removes.length > 0 ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={actions.isDeleting}
                  onClick={() => void apply()}
                >
                  {actions.isDeleting ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  Confirm changes
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={pending.length === 0 || actions.isDeleting}
                  onClick={() => {
                    if (removes.length > 0) setConfirming(true);
                    else void apply();
                  }}
                >
                  Apply
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
