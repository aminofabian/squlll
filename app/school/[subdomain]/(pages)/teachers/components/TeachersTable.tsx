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
import { User, Trash, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { teachersPanel, teachersTh } from "./teachers-ui";
import { TeacherAvatar } from "./TeacherAvatar";

type Teacher = {
  id: string;
  name: string;
  gender: "male" | "female";
  department: string;
  subjects: string[];
  employeeId: string;
  dateOfBirth: string;
  status: "active" | "inactive" | "on leave" | "former" | "substitute" | "retired";
  contacts: {
    phone: string;
    email: string;
    address?: string;
  };
};

interface TeachersTableProps {
  teachers: Teacher[];
  onTeacherSelect: (teacherId: string) => void;
  onTeacherDelete?: (teacherId: string) => void;
}

function formatBirthDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function hasPlaceholderData(teacher: Teacher) {
  return (
    !teacher.contacts.email ||
    teacher.contacts.phone === "+254700000000" ||
    teacher.dateOfBirth === "1980-01-01" ||
    teacher.contacts.address === "Address not provided"
  );
}

function statusBadge(status: Teacher["status"]) {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "inactive") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function statusLabel(status: Teacher["status"]) {
  if (status === "inactive") return "Not activated";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function TeachersTable({
  teachers,
  onTeacherSelect,
  onTeacherDelete,
}: TeachersTableProps) {
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const placeholderCount = teachers.filter(hasPlaceholderData).length;

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
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
          All teachers
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Click a row to view full profile · {teachers.length} shown
        </p>
      </div>

      {teachers.length === 0 ? (
        <div className="px-4 py-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <User className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            No teachers match
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Try a different filter or search term.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left dark:border-slate-800 dark:bg-slate-900/60">
                  <th className={cn(teachersTh, "w-10")}>#</th>
                  <th className={teachersTh}>Teacher</th>
                  <th className={teachersTh}>Status</th>
                  <th className={cn(teachersTh, "hidden sm:table-cell")}>Contact</th>
                  <th className={teachersTh}>Department</th>
                  <th className={cn(teachersTh, "hidden lg:table-cell")}>Subjects</th>
                  <th className={cn(teachersTh, "w-16")} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teachers.map((teacher, index) => {
                  const isPlaceholder = hasPlaceholderData(teacher);
                  return (
                    <tr
                      key={teacher.id}
                      className={cn(
                        "group cursor-pointer text-slate-700 transition-colors hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40",
                        isPlaceholder && "bg-amber-50/30 dark:bg-amber-950/10",
                      )}
                      onClick={() => onTeacherSelect(teacher.id)}
                    >
                      <td className="px-4 py-3 text-xs tabular-nums text-slate-400">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <TeacherAvatar name={teacher.name} size="md" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                              {teacher.name}
                            </p>
                            <p className="truncate font-mono text-[11px] text-slate-400">
                              {teacher.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-normal",
                            statusBadge(teacher.status),
                          )}
                        >
                          {statusLabel(teacher.status)}
                        </Badge>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p
                          className="truncate max-w-[160px] text-xs text-slate-600"
                          title={teacher.contacts.email}
                        >
                          {teacher.contacts.email || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-400">
                        {teacher.department || "—"}
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <div className="flex max-w-[200px] flex-wrap gap-1">
                          {teacher.subjects.slice(0, 2).map((subject) => (
                            <Badge
                              key={subject}
                              variant="outline"
                              className="border-emerald-200 bg-emerald-50 px-1.5 py-0 text-[10px] font-normal capitalize text-emerald-700"
                            >
                              {subject}
                            </Badge>
                          ))}
                          {teacher.subjects.length > 2 && (
                            <span className="text-[11px] text-slate-400">
                              +{teacher.subjects.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-3">
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
                              className="h-7 w-7 p-0 text-slate-300 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {placeholderCount > 0 && (
            <div className="flex items-center gap-2 border-t border-amber-100 bg-amber-50/50 px-4 py-2.5 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {placeholderCount} row{placeholderCount !== 1 ? "s" : ""} may have
              incomplete data — open the profile to review.
            </div>
          )}
        </>
      )}

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {confirmDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes them from your school staff list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingTeacherId}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
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
