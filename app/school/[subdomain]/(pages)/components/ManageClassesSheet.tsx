"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  GraduationCap,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useClassDirectoryActions } from "../classes/hooks/useClassDirectoryActions";
import type { CampusClassUnit } from "../classes/components/ClassesCampusOverview";
import {
  EditClassDialog,
  EditStreamDialog,
} from "../classes/components/ClassDirectoryDialogs";
import { AddStreamModal } from "./AddStreamModal";
import { AddGradeDialog } from "./AddGradeDialog";
import { StreamBoard } from "./StreamBoard";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";
import {
  formatGradeDisplayName,
  getGradeSortOrder,
} from "@/lib/utils/grade-display";
import { toast } from "sonner";

interface StudentLike {
  grade?: { gradeLevel?: { id?: string; name?: string } } | string;
  streamId?: string | null;
}

interface ManageClassesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: SchoolConfiguration | null;
  students: StudentLike[];
  onGradeDeleted?: (gradeId: string) => void;
  onStreamDeleted?: (streamId: string) => void;
}

function countStudents(
  students: StudentLike[],
  gradeId: string,
  streamId?: string,
) {
  let count = 0;
  for (const student of students) {
    const studentGradeId =
      typeof student.grade === "object"
        ? student.grade?.gradeLevel?.id
        : undefined;
    if (studentGradeId !== gradeId) continue;
    if (streamId) {
      if (student.streamId === streamId) count += 1;
    } else {
      count += 1;
    }
  }
  return count;
}

function buildUnits(
  config: SchoolConfiguration | null,
  students: StudentLike[],
): CampusClassUnit[] {
  if (!config?.selectedLevels) return [];
  const units: CampusClassUnit[] = [];

  for (const level of config.selectedLevels) {
    const grades = [...(level.gradeLevels ?? [])].sort(
      (a, b) => getGradeSortOrder(a.name) - getGradeSortOrder(b.name),
    );

    for (const grade of grades) {
      const displayName = formatGradeDisplayName(grade.name);
      const streams = grade.streams ?? [];
      const gradeStudentCount = countStudents(students, grade.id);

      if (streams.length === 0) {
        units.push({
          id: `${grade.id}:grade`,
          gradeId: grade.id,
          levelId: level.id,
          label: displayName,
          gradeName: displayName,
          levelName: level.name,
          studentCount: gradeStudentCount,
          subjectCount: 0,
          subjectsStaffed: 0,
          classTeacher: null,
          health: gradeStudentCount > 0 ? "ready" : "empty",
        });
        continue;
      }

      for (const stream of streams) {
        const streamStudentCount = countStudents(students, grade.id, stream.id);
        units.push({
          id: `${grade.id}:${stream.id}`,
          gradeId: grade.id,
          levelId: level.id,
          label: `${displayName} · ${stream.name}`,
          gradeName: displayName,
          levelName: level.name,
          streamId: stream.id,
          streamName: stream.name,
          studentCount: streamStudentCount,
          subjectCount: 0,
          subjectsStaffed: 0,
          classTeacher: null,
          health: streamStudentCount > 0 ? "ready" : "empty",
        });
      }
    }
  }

  return units;
}

type DeleteTarget =
  | { kind: "grade"; unit: CampusClassUnit }
  | { kind: "stream"; unit: CampusClassUnit };

export function ManageClassesSheet({
  open,
  onOpenChange,
  config,
  students,
  onGradeDeleted,
  onStreamDeleted,
}: ManageClassesSheetProps) {
  const actions = useClassDirectoryActions();
  const units = useMemo(() => buildUnits(config, students), [config, students]);

  const [addGradeOpen, setAddGradeOpen] = useState(false);
  const [addStreamGrade, setAddStreamGrade] = useState<{
    id: string;
    name: string;
    existing: string[];
  } | null>(null);
  const [editGradeUnit, setEditGradeUnit] = useState<CampusClassUnit | null>(
    null,
  );
  const [editStreamUnit, setEditStreamUnit] =
    useState<CampusClassUnit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkStreamGrades, setBulkStreamGrades] = useState<
    { id: string; name: string; existing: string[] }[] | null
  >(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [streamBoardOpen, setStreamBoardOpen] = useState(false);

  const selectedUnits = units.filter((unit) => selectedIds.has(unit.id));
  const deletableUnits = units.filter((unit) => unit.studentCount === 0);

  const exitSelect = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    setBulkError(null);
  };

  const toggleUnit = (unit: CampusClassUnit) => {
    if (unit.studentCount > 0) return;
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(unit.id)) next.delete(unit.id);
      else next.add(unit.id);
      return next;
    });
  };

  const openBulkStreams = () => {
    const grades = new Map<string, { id: string; name: string; existing: string[] }>();
    for (const unit of selectedUnits) {
      if (grades.has(unit.gradeId)) continue;
      const existing =
        (config?.selectedLevels ?? [])
          .flatMap((level) => level.gradeLevels ?? [])
          .find((grade) => grade.id === unit.gradeId)
          ?.streams?.map((stream) => stream.name) ?? [];
      grades.set(unit.gradeId, {
        id: unit.gradeId,
        name: unit.gradeName,
        existing,
      });
    }
    if (grades.size === 0) return;
    setBulkStreamGrades(Array.from(grades.values()));
  };

  const gradeCount = useMemo(
    () =>
      new Set(
        (config?.selectedLevels ?? []).flatMap((level) =>
          (level.gradeLevels ?? []).map((grade) => grade.id),
        ),
      ).size,
    [config?.selectedLevels],
  );
  const streamCount = units.filter((unit) => Boolean(unit.streamId)).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b border-slate-200/80 px-5 py-4 text-left dark:border-slate-800">
          <SheetTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f2ef] text-[#246a59] dark:bg-emerald-950/40 dark:text-emerald-300">
              <GraduationCap className="h-4 w-4" />
            </span>
            Grades &amp; streams
          </SheetTitle>
          <SheetDescription>
            Add grades, split them into streams, or rename and remove classes.
            Classes with students must be emptied before they can be deleted.
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-3 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {gradeCount}
            </span>{" "}
            grade{gradeCount === 1 ? "" : "s"}
            <span className="mx-1 text-slate-300 dark:text-slate-600">·</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {streamCount}
            </span>{" "}
            stream{streamCount === 1 ? "" : "s"}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            {selectMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() =>
                    setSelectedIds(
                      new Set(deletableUnits.map((unit) => unit.id)),
                    )
                  }
                  disabled={deletableUnits.length === 0}
                >
                  All empty
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={openBulkStreams}
                  disabled={selectedUnits.length === 0}
                >
                  Add streams
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setBulkError(null);
                    setBulkDeleteOpen(true);
                  }}
                  disabled={selectedUnits.length === 0}
                >
                  Delete {selectedUnits.length || ""}
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
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setStreamBoardOpen(true)}
                >
                  Add streams
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setSelectMode(true)}
                >
                  Select
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg bg-[#0a1f1a] text-xs text-white hover:bg-[#246a59]"
                  onClick={() => setAddGradeOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add grades
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {(config?.selectedLevels ?? []).map((level) => {
            const grades = [...(level.gradeLevels ?? [])].sort(
              (a, b) => getGradeSortOrder(a.name) - getGradeSortOrder(b.name),
            );
            if (grades.length === 0) return null;

            return (
              <section key={level.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-[#246a59] dark:text-emerald-300" />
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {level.name}
                  </h3>
                </div>

                <div className="space-y-2">
                  {grades.map((grade) => {
                    const displayName = formatGradeDisplayName(grade.name);
                    const gradeUnits = units.filter(
                      (unit) => unit.gradeId === grade.id,
                    );
                    const gradeStudentCount = countStudents(
                      students,
                      grade.id,
                    );
                    const streams = grade.streams ?? [];

                    return (
                      <div
                        key={grade.id}
                        className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/50"
                      >
                        <div className="flex items-start justify-between gap-2 px-3 py-2.5">
                          {selectMode ? (
                            <Checkbox
                              checked={
                                gradeUnits.filter(
                                  (unit) => unit.studentCount === 0,
                                ).length > 0 &&
                                gradeUnits
                                  .filter((unit) => unit.studentCount === 0)
                                  .every((unit) => selectedIds.has(unit.id))
                              }
                              disabled={
                                gradeUnits.every(
                                  (unit) => unit.studentCount > 0,
                                )
                              }
                              onCheckedChange={() => {
                                const empty = gradeUnits.filter(
                                  (unit) => unit.studentCount === 0,
                                );
                                if (empty.length === 0) return;
                                const allSelected = empty.every((unit) =>
                                  selectedIds.has(unit.id),
                                );
                                setSelectedIds((current) => {
                                  const next = new Set(current);
                                  for (const unit of empty) {
                                    if (allSelected) next.delete(unit.id);
                                    else next.add(unit.id);
                                  }
                                  return next;
                                });
                              }}
                              aria-label={`Select ${displayName}`}
                              className="mt-0.5"
                            />
                          ) : null}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {displayName}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {gradeStudentCount} student
                              {gradeStudentCount === 1 ? "" : "s"}
                              <span className="mx-1 text-slate-300 dark:text-slate-600">
                                ·
                              </span>
                              {streams.length > 0
                                ? `${streams.length} stream${streams.length === 1 ? "" : "s"}`
                                : "No streams"}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <Link
                              href={`/classes?gradeId=${encodeURIComponent(grade.id)}&levelId=${encodeURIComponent(level.id)}`}
                              title="Open class page"
                              aria-label={`Open ${displayName}`}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 gap-1 rounded-lg px-2 text-[11px]"
                              onClick={() =>
                                setAddStreamGrade({
                                  id: grade.id,
                                  name: displayName,
                                  existing: streams.map((stream) => stream.name),
                                })
                              }
                            >
                              <Plus className="h-3 w-3" />
                              Stream
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-500"
                              onClick={() => {
                                const unit =
                                  gradeUnits.find((item) => !item.streamId) ??
                                  gradeUnits[0];
                                if (unit) setEditGradeUnit(unit);
                              }}
                              aria-label={`Edit ${displayName}`}
                              title="Edit grade name"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                              disabled={gradeStudentCount > 0}
                              onClick={() => {
                                const unit = gradeUnits[0];
                                if (unit) {
                                  setDeleteTarget({ kind: "grade", unit });
                                }
                              }}
                              aria-label={`Delete ${displayName}`}
                              title={
                                gradeStudentCount > 0
                                  ? "Move students before deleting this grade"
                                  : "Delete grade"
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {streams.length > 0 ? (
                          <div className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800/60 dark:border-slate-800/60">
                            {streams.map((stream) => {
                              const streamCount = countStudents(
                                students,
                                grade.id,
                                stream.id,
                              );
                              return (
                                <div
                                  key={stream.id}
                                  className="flex items-center justify-between gap-2 bg-slate-50/40 px-3 py-1.5 pl-5 dark:bg-slate-900/20"
                                >
                                  {selectMode ? (
                                    <Checkbox
                                      checked={selectedIds.has(
                                        `${grade.id}:${stream.id}`,
                                      )}
                                      disabled={streamCount > 0}
                                      onCheckedChange={() => {
                                        const unit = units.find(
                                          (item) =>
                                            item.gradeId === grade.id &&
                                            item.streamId === stream.id,
                                        );
                                        if (unit) toggleUnit(unit);
                                      }}
                                      aria-label={`Select ${displayName} ${stream.name}`}
                                    />
                                  ) : null}
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                                      {stream.name}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      {streamCount} student
                                      {streamCount === 1 ? "" : "s"}
                                    </p>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-slate-400"
                                      onClick={() => {
                                        const unit = units.find(
                                          (item) =>
                                            item.gradeId === grade.id &&
                                            item.streamId === stream.id,
                                        );
                                        if (unit) setEditStreamUnit(unit);
                                      }}
                                      aria-label={`Edit ${stream.name}`}
                                      title="Edit stream name"
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                                      disabled={streamCount > 0}
                                      onClick={() => {
                                        const unit = units.find(
                                          (item) =>
                                            item.gradeId === grade.id &&
                                            item.streamId === stream.id,
                                        );
                                        if (unit) {
                                          setDeleteTarget({
                                            kind: "stream",
                                            unit,
                                          });
                                        }
                                      }}
                                      aria-label={`Delete ${stream.name}`}
                                      title={
                                        streamCount > 0
                                          ? "Move students before deleting this stream"
                                          : "Delete stream"
                                      }
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="border-t border-slate-100 px-3 py-2 text-[11px] text-slate-400 dark:border-slate-800/60">
                            No streams yet — add one to split this grade into
                            classes.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {(config?.selectedLevels ?? []).length === 0 ? (
            <p className="rounded-xl border border-slate-200/80 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
              No curriculum levels are configured for this school.
            </p>
          ) : null}
        </div>

        <div className="border-t border-slate-200/80 bg-slate-50/60 px-5 py-3 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
          Renaming a grade changes it for every stream in that grade. Deleting
          a grade removes its streams too. Classes with students stay locked
          until the students are moved.
        </div>
      </SheetContent>

      {streamBoardOpen ? (
        <StreamBoard
          open
          onOpenChange={setStreamBoardOpen}
          config={config}
          students={students}
        />
      ) : null}

      {addGradeOpen ? (
        <AddGradeDialog
          open={addGradeOpen}
          onOpenChange={setAddGradeOpen}
          levels={config?.selectedLevels ?? []}
        />
      ) : null}

      {addStreamGrade ? (
        <AddStreamModal
          isOpen
          onClose={() => setAddStreamGrade(null)}
          onSuccess={() => setAddStreamGrade(null)}
          gradeId={addStreamGrade.id}
          gradeName={addStreamGrade.name}
          existing={addStreamGrade.existing}
        />
      ) : null}

      {bulkStreamGrades ? (
        <AddStreamModal
          isOpen
          onClose={() => setBulkStreamGrades(null)}
          onSuccess={() => {
            setBulkStreamGrades(null);
            exitSelect();
          }}
          gradeId={bulkStreamGrades[0]?.id ?? ""}
          gradeName={bulkStreamGrades[0]?.name ?? ""}
          grades={bulkStreamGrades}
        />
      ) : null}

      {bulkDeleteOpen ? (
        <Dialog
          open
          onOpenChange={(next) => {
            if (!next && !actions.isDeleting) setBulkDeleteOpen(false);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Delete {selectedUnits.length} class
                {selectedUnits.length === 1 ? "" : "es"}?
              </DialogTitle>
              <DialogDescription>
                Empty grades are removed completely. Empty streams are removed
                from their grade. Classes that still have students stay.
              </DialogDescription>
            </DialogHeader>
            {bulkError ? (
              <p className="text-xs font-medium text-rose-600" role="alert">
                {bulkError}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setBulkDeleteOpen(false)}
                disabled={actions.isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={actions.isDeleting}
                onClick={() => {
                  void (async () => {
                    setBulkError(null);
                    try {
                      await actions.deleteClasses(selectedUnits, units);
                      toast.success(
                        `${selectedUnits.length} class${selectedUnits.length === 1 ? "" : "es"} deleted`,
                      );
                      exitSelect();
                    } catch (err) {
                      setBulkError(getDisplayErrorMessage(err));
                    }
                  })();
                }}
              >
                {actions.isDeleting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Delete selected"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {editGradeUnit ? (
        <EditClassDialog
          key={`edit-grade-${editGradeUnit.gradeId}`}
          open
          unit={editGradeUnit}
          saving={actions.isSaving}
          onClose={() => setEditGradeUnit(null)}
          onSave={async (name) => {
            await actions.renameClass(editGradeUnit, name);
            toast.success("Grade name updated");
          }}
        />
      ) : null}

      {editStreamUnit ? (
        <EditStreamDialog
          key={`edit-stream-${editStreamUnit.id}`}
          open
          unit={editStreamUnit}
          saving={actions.isSaving}
          onClose={() => setEditStreamUnit(null)}
          onSave={async (name) => {
            await actions.renameStream(editStreamUnit, name);
            toast.success("Stream name updated");
          }}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDeleteClassDialog
          key={`delete-${deleteTarget.kind}-${deleteTarget.unit.id}`}
          target={deleteTarget}
          deleting={actions.isDeleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (deleteTarget.kind === "grade") {
              await actions.deleteGrade(deleteTarget.unit);
              toast.success(
                `${deleteTarget.unit.gradeName ?? "Grade"} deleted`,
              );
              onGradeDeleted?.(deleteTarget.unit.gradeId);
            } else {
              await actions.deleteStream(deleteTarget.unit);
              toast.success(
                `${deleteTarget.unit.streamName ?? "Stream"} deleted`,
              );
              if (deleteTarget.unit.streamId) {
                onStreamDeleted?.(deleteTarget.unit.streamId);
              }
            }
            setDeleteTarget(null);
          }}
        />
      ) : null}
    </Sheet>
  );
}

function ConfirmDeleteClassDialog({
  target,
  deleting,
  onClose,
  onConfirm,
}: {
  target: DeleteTarget;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(getDisplayErrorMessage(err));
    }
  };

  const isGrade = target.kind === "grade";
  const title = isGrade
    ? `Delete ${target.unit.gradeName ?? "grade"}?`
    : `Delete ${target.unit.streamName ?? "stream"}?`;

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4" />
            </span>
            {title}
          </DialogTitle>
          <DialogDescription>
            {isGrade
              ? "This removes the grade and every stream under it from the class directory. Students must be moved first."
              : "This removes only this stream. Students must be moved first."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
            {target.unit.label}
          </div>
          {error ? (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => void handleConfirm()}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Deleting…
              </>
            ) : (
              `Delete ${isGrade ? "grade" : "stream"}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
