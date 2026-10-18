"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Check,
  Copy,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
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
import type { Level } from "@/lib/types/school-config";
import type { TenantSubject } from "@/lib/hooks/useTenantSubjects";
import { cn } from "@/lib/utils";
import { useClassSubjectsForLevel } from "../utils/useClassSubjectsForLevel";
import {
  deleteTenantSubjects,
  invalidateSubjectCaches,
  updateTenantSubject,
} from "../utils/subjectMutations";
import { AssignSubjectTeacherSheet } from "./AssignSubjectTeacherSheet";
import { ClassDetailProgressRing } from "./ClassDetailProgressRing";
import { SubjectTeacherBadge } from "./SubjectTeacherBadge";

type SubjectListItem = {
  id: string;
  name: string;
  code: string;
  subjectType: "core" | "elective";
  tenantSubjectIds: string[];
  _tenantSubject: TenantSubject;
};

type Filter = "all" | "core" | "elective";

interface ClassSubjectStudioProps {
  level: Level;
  gradeId: string;
  className?: string;
  onAddSubject?: () => void;
  /** Hide the add controls for read-only viewers. */
  readOnly?: boolean;
}

export function ClassSubjectStudio({
  level,
  gradeId,
  className,
  onAddSubject,
  readOnly = false,
}: ClassSubjectStudioProps) {
  const queryClient = useQueryClient();
  const {
    subjects,
    assignedCount,
    totalCount,
    getTeacherForSubject,
    isLoading,
    refetch,
  } = useClassSubjectsForLevel(level, gradeId);

  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftType, setDraftType] = useState<"core" | "elective">("core");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubjectListItem | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [assignSubject, setAssignSubject] = useState<{
    tenantSubjectIds: string[];
    name: string;
  } | null>(null);

  const coverage =
    totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0;
  const unassigned = totalCount - assignedCount;

  const counts = useMemo(
    () => ({
      all: subjects.length,
      core: subjects.filter((s) => s.subjectType === "core").length,
      elective: subjects.filter((s) => s.subjectType === "elective").length,
    }),
    [subjects],
  );

  const visible = useMemo(
    () =>
      filter === "all"
        ? subjects
        : subjects.filter((s) => s.subjectType === filter),
    [subjects, filter],
  );

  const startEdit = (subject: SubjectListItem) => {
    setEditingId(subject.id);
    setDraftName(subject.name);
    setDraftType(subject.subjectType);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftName("");
  };

  const saveEdit = async (subject: SubjectListItem) => {
    const name = draftName.trim();
    if (!name) {
      toast.error("Subject name can’t be empty");
      return;
    }

    const input: Parameters<typeof updateTenantSubject>[1] = {};
    if (name !== subject.name) input.name = name;
    if (draftType !== subject.subjectType) input.subjectType = draftType;
    if (Object.keys(input).length === 0) {
      cancelEdit();
      return;
    }

    setSavingId(subject.id);
    try {
      for (const tenantSubjectId of subject.tenantSubjectIds) {
        await updateTenantSubject(tenantSubjectId, input);
      }
      await invalidateSubjectCaches(queryClient);
      toast.success(`Saved “${name}”`);
      cancelEdit();
    } catch (error) {
      // A partial multi-row update can still have changed something — refresh.
      await invalidateSubjectCaches(queryClient);
      toast.error(
        error instanceof Error ? error.message : "Couldn’t update the subject",
      );
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTenantSubjects(deleteTarget.tenantSubjectIds);
      await invalidateSubjectCaches(queryClient);
      toast.success(`Removed “${deleteTarget.name}” from the curriculum`);
      setDeleteTarget(null);
      void refetch();
    } catch (error) {
      await invalidateSubjectCaches(queryClient);
      void refetch();
      toast.error(
        error instanceof Error ? error.message : "Couldn’t delete the subject",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className={cn("space-y-3", className)}>
      <div className="overflow-hidden rounded-xl border border-[#1a4d42]/12 bg-white shadow-[0_1px_2px_rgba(10,31,26,0.04)] dark:border-white/10 dark:bg-[#0c1a17]">
        <div className="flex flex-wrap items-start gap-3 border-b border-[#1a4d42]/10 px-4 py-3.5 dark:border-white/10 sm:px-5">
          <ClassDetailProgressRing
            value={coverage}
            size={48}
            stroke={5}
            label={`${coverage}% of subjects staffed`}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#246a59] dark:text-[#8fe3c8]">
              Subject studio
            </p>
            <h3 className="mt-0.5 font-display text-base tracking-tight text-[#0a1f1a] dark:text-white">
              Curriculum &amp; teachers
            </h3>
            <p className="mt-0.5 text-[11px] text-[#1a4d42]/55 dark:text-white/45">
              {isLoading
                ? "Loading subjects…"
                : totalCount === 0
                  ? "No subjects yet — add the first one"
                  : `${assignedCount} of ${totalCount} subjects staffed${
                      unassigned > 0
                        ? ` · ${unassigned} need${unassigned === 1 ? "s" : ""} a teacher`
                        : " · fully covered"
                    }`}
            </p>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="mr-auto flex items-center gap-1 rounded-lg bg-[#f3f7f5] p-0.5 dark:bg-white/5">
              {(
                [
                  ["all", "All"],
                  ["core", "Core"],
                  ["elective", "Elective"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  aria-pressed={filter === id}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors",
                    filter === id
                      ? "bg-white text-[#0a1f1a] shadow-sm dark:bg-[#0c1a17] dark:text-white"
                      : "text-[#1a4d42]/55 hover:text-[#0a1f1a] dark:text-white/50 dark:hover:text-white",
                  )}
                >
                  {label}
                  <span className="ml-1 tabular-nums opacity-60">
                    {counts[id]}
                  </span>
                </button>
              ))}
            </div>
            {!readOnly && onAddSubject ? (
              <Button
                type="button"
                size="sm"
                className="h-8 gap-1.5 rounded-lg bg-[#0a1f1a] px-2.5 text-[11px] font-medium text-white hover:bg-[#246a59]"
                onClick={onAddSubject}
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-b border-[#1a4d42]/10 px-4 py-2 dark:border-white/10 sm:px-5">
          <div className="flex h-1.5 flex-1 items-center gap-0.5 overflow-hidden rounded-full bg-[#e8f2ef] dark:bg-white/10">
            {subjects.length > 0
              ? subjects.map((subject) => {
                  const staffed = Boolean(
                    getTeacherForSubject(subject.tenantSubjectIds, {
                      _tenantSubject: subject._tenantSubject,
                      name: subject.name,
                      code: subject.code,
                    }),
                  );
                  return (
                    <span
                      key={subject.id}
                      title={`${subject.name} — ${
                        staffed ? "teacher assigned" : "needs a teacher"
                      }`}
                      className={cn(
                        "h-full flex-1 rounded-full transition-colors",
                        staffed
                          ? "bg-emerald-500/80"
                          : "bg-amber-400/90 dark:bg-amber-500/80",
                      )}
                    />
                  );
                })
              : null}
          </div>
          <span className="ml-1 shrink-0 text-[10px] font-semibold tabular-nums text-[#1a4d42]/45 dark:text-white/40">
            {coverage}% staffed
          </span>
        </div>

        <div className="px-3 py-2 sm:px-4">
          {isLoading ? (
            <div className="space-y-1.5 py-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-lg bg-[#f3f7f5] dark:bg-white/5"
                />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center px-3 py-10 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f2ef] text-[#246a59] dark:bg-white/5 dark:text-[#8fe3c8]">
                <BookOpen className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-[#0a1f1a] dark:text-white">
                {totalCount === 0
                  ? "Build the subject list"
                  : "Nothing in this filter"}
              </p>
              <p className="mt-1 max-w-xs text-[11px] text-[#1a4d42]/55 dark:text-white/45">
                {totalCount === 0
                  ? "Add subjects from the school catalog or create a custom one. They apply to every stream in this level."
                  : "Switch the filter or add a subject to fill this group."}
              </p>
              {!readOnly && onAddSubject && totalCount === 0 ? (
                <Button
                  type="button"
                  size="sm"
                  className="mt-3 h-8 gap-1.5 rounded-lg bg-[#246a59] px-3 text-[11px] text-white hover:bg-[#1a4d42]"
                  onClick={onAddSubject}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add first subject
                </Button>
              ) : null}
            </div>
          ) : (
            <ul className="divide-y divide-[#1a4d42]/8 dark:divide-white/8">
              {visible.map((subject) => {
                const teacher = getTeacherForSubject(
                  subject.tenantSubjectIds,
                  {
                    _tenantSubject: subject._tenantSubject,
                    name: subject.name,
                    code: subject.code,
                  },
                );
                const staffed = Boolean(teacher);
                const isEditing = editingId === subject.id;
                const isSaving = savingId === subject.id;

                return (
                  <li key={subject.id} className="py-1 first:pt-0 last:pb-0">
                    {isEditing ? (
                      <form
                        className="my-1 rounded-lg border border-[#246a59]/30 bg-[#f8fbfa] p-2.5 dark:border-[#246a59]/50 dark:bg-white/[0.03]"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void saveEdit(subject);
                        }}
                      >
                        <label
                          htmlFor={`subject-name-${subject.id}`}
                          className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45 dark:text-white/40"
                        >
                          Subject name
                        </label>
                        <Input
                          id={`subject-name-${subject.id}`}
                          autoFocus
                          value={draftName}
                          onChange={(event) => setDraftName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") cancelEdit();
                          }}
                          className="mt-1 h-8 border-[#1a4d42]/15 bg-white text-[13px] dark:border-white/15 dark:bg-[#071411]"
                        />
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1 rounded-lg bg-[#e8f2ef] p-0.5 dark:bg-white/5">
                            {(["core", "elective"] as const).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setDraftType(type)}
                                className={cn(
                                  "rounded-md px-2.5 py-1 text-[10px] font-semibold capitalize transition-colors",
                                  draftType === type
                                    ? "bg-white text-[#0a1f1a] shadow-sm dark:bg-[#0c1a17] dark:text-white"
                                    : "text-[#1a4d42]/55 dark:text-white/50",
                                )}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 rounded-md px-2 text-[11px] text-[#1a4d42]/55"
                              onClick={cancelEdit}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              size="sm"
                              className="h-7 gap-1 rounded-md bg-[#0a1f1a] px-2.5 text-[11px] text-white hover:bg-[#246a59]"
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              Save
                            </Button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div className="group flex items-center gap-2.5 rounded-lg px-1.5 py-2 transition-colors hover:bg-[#f8fbfa] dark:hover:bg-white/[0.03]">
                        <span
                          className={cn(
                            "h-8 w-[3px] shrink-0 rounded-full",
                            subject.subjectType === "core"
                              ? "bg-[#246a59]"
                              : "bg-amber-400 dark:bg-amber-500",
                          )}
                          title={
                            subject.subjectType === "core"
                              ? "Core subject"
                              : "Elective"
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="truncate text-[13px] font-semibold tracking-tight text-[#0a1f1a] dark:text-white">
                              {subject.name}
                            </p>
                            {subject.code ? (
                              <button
                                type="button"
                                title="Copy subject code"
                                onClick={() => {
                                  void navigator.clipboard?.writeText(
                                    subject.code,
                                  );
                                  toast.success("Code copied");
                                }}
                                className="inline-flex items-center gap-0.5 rounded border border-[#1a4d42]/10 bg-[#f3f7f5] px-1.5 py-0.5 font-mono text-[9px] text-[#1a4d42]/50 transition-colors hover:text-[#0a1f1a] dark:border-white/10 dark:bg-white/5 dark:text-white/40 dark:hover:text-white"
                              >
                                {subject.code}
                                <Copy className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
                              </button>
                            ) : null}
                            <span
                              className={cn(
                                "rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                                subject.subjectType === "core"
                                  ? "bg-[#246a59]/10 text-[#246a59] dark:bg-[#246a59]/25 dark:text-[#8fe3c8]"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
                              )}
                            >
                              {subject.subjectType}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[10px] text-[#1a4d42]/45 dark:text-white/35">
                            {staffed
                              ? `Taught by ${teacher}`
                              : "No teacher assigned yet"}
                          </p>
                        </div>

                        <div className="hidden items-center gap-1.5 sm:flex">
                          <SubjectTeacherBadge
                            teacherName={teacher}
                            onAssign={() =>
                              setAssignSubject({
                                tenantSubjectIds: subject.tenantSubjectIds,
                                name: subject.name,
                              })
                            }
                          />
                        </div>

                        {!readOnly ? (
                          <div className="flex shrink-0 items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                setAssignSubject({
                                  tenantSubjectIds: subject.tenantSubjectIds,
                                  name: subject.name,
                                })
                              }
                              title={
                                staffed
                                  ? "Change subject teacher"
                                  : "Assign a subject teacher"
                              }
                              className={cn(
                                "h-7 w-7 items-center justify-center rounded-md text-[#1a4d42]/45 transition-colors hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white",
                                staffed ? "flex" : "flex sm:hidden",
                              )}
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => startEdit(subject)}
                              title="Rename or change type"
                              className="flex h-7 w-7 items-center justify-center rounded-md text-[#1a4d42]/45 transition-colors hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(subject)}
                              title="Remove subject"
                              className="flex h-7 w-7 items-center justify-center rounded-md text-[#1a4d42]/40 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-white/35 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!readOnly && totalCount > 0 ? (
          <div className="border-t border-[#1a4d42]/10 px-3 py-2 dark:border-white/10 sm:px-4">
            <p className="text-[10px] text-[#1a4d42]/45 dark:text-white/35">
              Curriculum is shared by every stream in{" "}
              <span className="font-semibold text-[#1a4d42]/65 dark:text-white/55">
                {level.name}
              </span>
              . Edits apply level-wide.
            </p>
          </div>
        ) : null}
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
            void refetch();
            void queryClient.invalidateQueries({ queryKey: ["getTeachers"] });
          }}
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
              This removes the subject from the curriculum for{" "}
              <span className="font-medium">{level.name}</span> — every class
              and stream that shares it. Timetable lessons and exam papers that
              reference it may need attention.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              disabled={deleting}
              className="gap-1.5 bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Remove subject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
