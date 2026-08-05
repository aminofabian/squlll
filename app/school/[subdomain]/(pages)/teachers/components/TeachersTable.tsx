"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { User, Trash, AlertTriangle, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { teachersPanel, teachersTh } from "./teachers-ui";
import { TeacherAvatar } from "./TeacherAvatar";
import {
  isTeacherProfileIncomplete,
  type TeachersListItem,
} from "../utils/mapGraphqlTeacher";

type Teacher = Pick<
  TeachersListItem,
  | "id"
  | "name"
  | "gender"
  | "department"
  | "subjects"
  | "grades"
  | "employeeId"
  | "dateOfBirth"
  | "status"
  | "contacts"
  | "qualifications"
  | "hasCompletedProfile"
>;

interface TeachersTableProps {
  teachers: Teacher[];
  onTeacherSelect: (teacherId: string) => void;
  onTeacherDelete?: (teacherId: string) => void;
  lessonCounts?: Map<string, number>;
  timetableLoading?: boolean;
  termName?: string | null;
}

export function hasIncompleteProfile(teacher: Teacher) {
  return isTeacherProfileIncomplete(teacher);
}

function statusBadge(status: Teacher["status"]) {
  if (status === "active") {
    return "rounded-none border-emerald-200/80 bg-emerald-50 text-emerald-800";
  }
  if (status === "inactive") {
    return "rounded-none border-amber-200/80 bg-amber-50 text-amber-800";
  }
  return "rounded-none border-[#1a4d42]/12 bg-[#f8fbfa] text-[#1a4d42]/70";
}

function statusLabel(status: Teacher["status"]) {
  if (status === "inactive") return "Not activated";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function scheduleBadge(
  teacherId: string,
  lessonCounts: Map<string, number> | undefined,
  timetableLoading: boolean,
) {
  if (timetableLoading) {
    return (
      <span className="text-[10px] text-[#1a4d42]/40">Checking…</span>
    );
  }

  const count = lessonCounts?.get(teacherId) ?? 0;
  if (count > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium tabular-nums text-[#246a59]">
        <CalendarDays className="h-3 w-3" />
        {count}
      </span>
    );
  }

  return (
    <span
      className="text-[10px] text-amber-700"
      title="No lessons scheduled for the current term"
    >
      None
    </span>
  );
}

export function TeachersTable({
  teachers,
  onTeacherSelect,
  onTeacherDelete,
  lessonCounts,
  timetableLoading = false,
  termName,
}: TeachersTableProps) {
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const incompleteCount = teachers.filter(hasIncompleteProfile).length;

  const handleDeleteTeacher = async () => {
    if (!confirmDelete || !onTeacherDelete) return;
    setDeletingTeacherId(confirmDelete.id);
    try {
      await onTeacherDelete(confirmDelete.id);
      toast.success(`${confirmDelete.name} has been removed`);
      setConfirmDelete(null);
    } catch (error) {
      toast.error(`Failed to remove ${confirmDelete.name}`);
      console.error("Delete teacher error:", error);
    } finally {
      setDeletingTeacherId(null);
    }
  };

  return (
    <div className={teachersPanel}>
      <div className="flex items-center justify-between gap-2 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-1.5 dark:border-white/10 dark:bg-[#071411]">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold text-[#0a1f1a] dark:text-white">
            Directory
          </h2>
          <p className="truncate text-[10px] text-[#1a4d42]/45">
            {teachers.length} shown
            {termName ? ` · ${termName}` : ""}
          </p>
        </div>
      </div>

      {teachers.length === 0 ? (
        <div className="px-3 py-10 text-center">
          <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-none bg-[#246a59]/10">
            <User className="h-4 w-4 text-[#246a59]" />
          </div>
          <p className="text-sm font-medium text-[#0a1f1a] dark:text-white">
            No teachers match
          </p>
          <p className="mt-0.5 text-[11px] text-[#1a4d42]/50">
            Try a different filter or search.
          </p>
        </div>
      ) : (
        <>
          <div className="max-h-[min(52vh,420px)] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-[#1a4d42]/10 bg-[#f8fbfa] text-left dark:border-white/10 dark:bg-[#071411]">
                  <th className={cn(teachersTh, "w-8 px-2 py-1.5")}>#</th>
                  <th className={cn(teachersTh, "px-2 py-1.5")}>Teacher</th>
                  <th className={cn(teachersTh, "px-2 py-1.5")}>Status</th>
                  <th className={cn(teachersTh, "hidden px-2 py-1.5 sm:table-cell")}>
                    Contact
                  </th>
                  <th className={cn(teachersTh, "px-2 py-1.5")}>Dept</th>
                  <th className={cn(teachersTh, "hidden px-2 py-1.5 lg:table-cell")}>
                    Subjects
                  </th>
                  <th className={cn(teachersTh, "hidden px-2 py-1.5 md:table-cell")}>
                    Grades
                  </th>
                  <th className={cn(teachersTh, "hidden px-2 py-1.5 xl:table-cell")}>
                    Sched
                  </th>
                  <th className={cn(teachersTh, "w-12 px-1 py-1.5")} />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a4d42]/08 dark:divide-white/10">
                {teachers.map((teacher, index) => {
                  const isIncomplete = hasIncompleteProfile(teacher);
                  return (
                    <tr
                      key={teacher.id}
                      className={cn(
                        "group cursor-pointer text-[#1a4d42]/80 transition-colors hover:bg-[#f8fbfa] dark:text-white/70 dark:hover:bg-white/5",
                        isIncomplete && "bg-amber-50/40 dark:bg-amber-950/10",
                      )}
                      onClick={() => onTeacherSelect(teacher.id)}
                    >
                      <td className="px-2 py-1.5 text-[10px] tabular-nums text-[#1a4d42]/35">
                        {index + 1}
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-2">
                          <TeacherAvatar name={teacher.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-[#0a1f1a] dark:text-white">
                              {teacher.name}
                            </p>
                            <p className="truncate font-mono text-[10px] text-[#1a4d42]/40">
                              {teacher.employeeId || "No ID"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-normal",
                            statusBadge(teacher.status),
                          )}
                        >
                          {statusLabel(teacher.status)}
                        </Badge>
                      </td>
                      <td className="hidden px-2 py-1.5 sm:table-cell">
                        <p
                          className="max-w-[140px] truncate text-[11px] text-[#1a4d42]/65"
                          title={teacher.contacts.email}
                        >
                          {teacher.contacts.email || "—"}
                        </p>
                      </td>
                      <td className="px-2 py-1.5 text-[11px] capitalize text-[#1a4d42]/65">
                        {teacher.department || "—"}
                      </td>
                      <td className="hidden px-2 py-1.5 lg:table-cell">
                        <p className="max-w-[160px] truncate text-[11px] capitalize text-[#1a4d42]/65">
                          {teacher.subjects.length > 0
                            ? teacher.subjects.slice(0, 2).join(", ") +
                              (teacher.subjects.length > 2
                                ? ` +${teacher.subjects.length - 2}`
                                : "")
                            : "—"}
                        </p>
                      </td>
                      <td className="hidden px-2 py-1.5 md:table-cell">
                        <p className="max-w-[120px] truncate text-[11px] text-[#1a4d42]/65">
                          {teacher.grades.length > 0
                            ? teacher.grades.slice(0, 2).join(", ") +
                              (teacher.grades.length > 2
                                ? ` +${teacher.grades.length - 2}`
                                : "")
                            : "—"}
                        </p>
                      </td>
                      <td className="hidden px-2 py-1.5 xl:table-cell">
                        {scheduleBadge(teacher.id, lessonCounts, timetableLoading)}
                      </td>
                      <td className="px-1 py-1.5">
                        <div className="flex items-center justify-end gap-0.5">
                          {onTeacherDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDelete({
                                  id: teacher.id,
                                  name: teacher.name,
                                });
                              }}
                              disabled={deletingTeacherId === teacher.id}
                              className="h-6 w-6 p-0 text-[#1a4d42]/25 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          )}
                          <ChevronRight className="h-3.5 w-3.5 text-[#1a4d42]/25 transition-transform group-hover:translate-x-0.5 group-hover:text-[#246a59]" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {incompleteCount > 0 && (
            <div className="flex items-center gap-1.5 border-t border-amber-100 bg-amber-50/50 px-3 py-1.5 text-[10px] text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              {incompleteCount} incomplete profile
              {incompleteCount !== 1 ? "s" : ""} — open a row to finish.
            </div>
          )}
        </>
      )}

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent className="rounded-none border border-[#1a4d42]/12">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-[#0a1f1a]">
              Remove {confirmDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes them from your school staff list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none" disabled={!!deletingTeacherId}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-red-600 hover:bg-red-700"
              disabled={!!deletingTeacherId}
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteTeacher();
              }}
            >
              {deletingTeacherId ? "Removing…" : "Remove teacher"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
