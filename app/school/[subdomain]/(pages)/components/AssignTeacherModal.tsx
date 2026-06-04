"use client";

import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormField } from "../classes/components/FormField";
import {
  mapAssignResponseToAssignment,
  refreshAfterClassTeacherChange,
} from "../classes/utils/class-teacher-cache";
import { useGetTeachers } from "@/lib/hooks/useTeachers";
import { useClassTeacherAssignment } from "@/lib/hooks/useClassTeacherAssignment";
import { resolveTeacherDisplayName } from "@/lib/utils/teacher-display";
import {
  dedupeTeachersForPicker,
  isTeacherClassTeacherForScope,
  type TeacherPickerRow,
} from "@/lib/utils/teacher-picker";
import { cn } from "@/lib/utils";

interface AssignTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  streamId?: string;
  streamName?: string;
  gradeLevelId?: string;
  gradeName?: string;
}

export function AssignTeacherModal({
  isOpen,
  onClose,
  onSuccess,
  streamId,
  streamName,
  gradeLevelId,
  gradeName,
}: AssignTeacherModalProps) {
  const queryClient = useQueryClient();
  const { teachers, isLoading, refetch } = useGetTeachers();
  const { data: currentAssignment } = useClassTeacherAssignment(
    streamId ? null : gradeLevelId,
    streamId || null,
  );

  const [isAssigning, setIsAssigning] = useState(false);
  const [isUnassigning, setIsUnassigning] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherPickerRow | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectionError, setSelectionError] = useState("");

  const scope = useMemo(
    () => ({ streamId, gradeLevelId }),
    [streamId, gradeLevelId],
  );

  const currentTeacherId = currentAssignment?.teacher?.id;
  const currentTeacherName = currentAssignment?.teacher?.fullName;

  const pickerTeachers = useMemo(
    () => dedupeTeachersForPicker(teachers),
    [teachers],
  );

  const filteredTeachers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return pickerTeachers;
    return pickerTeachers.filter((teacher) => {
      const name = resolveTeacherDisplayName(teacher).toLowerCase();
      const email = (teacher.email || "").toLowerCase();
      const dept = (teacher.department || "").toLowerCase();
      return name.includes(q) || email.includes(q) || dept.includes(q);
    });
  }, [pickerTeachers, searchTerm]);

  useEffect(() => {
    if (!isOpen) return;
    void refetch();
    setSelectedTeacher(null);
    setSearchTerm("");
    setSelectionError("");
  }, [isOpen, refetch]);

  useEffect(() => {
    if (!isOpen || !currentTeacherId) return;
    const match = pickerTeachers.find((t) => t.id === currentTeacherId);
    if (match) setSelectedTeacher(match);
  }, [isOpen, currentTeacherId, pickerTeachers]);

  const displayTarget = useMemo(() => {
    if (gradeName && streamName) return `${gradeName} · ${streamName}`;
    return streamName || gradeName || "Selected class";
  }, [gradeName, streamName]);

  const selectedIsCurrentForScope =
    selectedTeacher &&
    isTeacherClassTeacherForScope(selectedTeacher, scope);

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) {
      setSelectionError("Please select a teacher from the list below");
      return;
    }
    setSelectionError("");
    setIsAssigning(true);

    try {
      const requestBody: Record<string, string> = {
        teacherId: selectedTeacher.id,
      };
      if (streamId) {
        requestBody.streamId = streamId;
        if (gradeLevelId) requestBody.gradeLevelId = gradeLevelId;
      } else if (gradeLevelId) {
        requestBody.gradeLevelId = gradeLevelId;
      }

      const response = await fetch("/api/school/assign-class-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details?.length) {
          throw new Error(
            data.details[0]?.message || data.error || "Failed to assign",
          );
        }
        throw new Error(data.error || "Failed to assign class teacher");
      }

      const name = resolveTeacherDisplayName(selectedTeacher);
      toast.success("Class teacher assigned", {
        description: `${name} → ${displayTarget}`,
      });

      const assignment = mapAssignResponseToAssignment(
        data,
        {
          id: selectedTeacher.id,
          fullName: name,
          email: selectedTeacher.email || "",
        },
        streamId,
        streamName,
      );

      await refreshAfterClassTeacherChange(queryClient, {
        gradeLevelId,
        streamId,
        assignment,
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Assignment failed", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignTeacher = async () => {
    const teacherToUnassign =
      selectedTeacher ||
      (currentTeacherId
        ? {
            id: currentTeacherId,
            fullName: currentTeacherName,
          }
        : null);

    if (!teacherToUnassign?.id) {
      toast.error("No teacher selected to remove");
      return;
    }

    setIsUnassigning(true);

    try {
      const response = await fetch("/api/school/unassign-class-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: teacherToUnassign.id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to remove class teacher");
      }

      const name =
        resolveTeacherDisplayName(teacherToUnassign as TeacherPickerRow) ||
        currentTeacherName ||
        "Teacher";
      toast.success("Class teacher removed", {
        description: `${name} is no longer class teacher for ${displayTarget}.`,
      });

      await refreshAfterClassTeacherChange(queryClient, {
        gradeLevelId,
        streamId,
        assignment: null,
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Could not remove teacher", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsUnassigning(false);
    }
  };

  const handleClose = () => {
    setSelectedTeacher(null);
    setSearchTerm("");
    setSelectionError("");
    onClose();
  };

  const primaryAction =
    selectedIsCurrentForScope ? handleUnassignTeacher : handleAssignTeacher;
  const primaryLabel = selectedIsCurrentForScope
    ? "Remove from this class"
    : "Assign teacher";
  const primaryBusy = selectedIsCurrentForScope ? isUnassigning : isAssigning;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border-slate-200/80 bg-slate-50/50 p-0 sm:max-w-lg dark:border-slate-800 dark:bg-slate-950">
        <DialogHeader className="border-b border-slate-200/80 bg-white px-5 py-4 text-left dark:border-slate-800 dark:bg-slate-900">
          <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {currentTeacherId ? "Manage class teacher" : "Assign class teacher"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {currentTeacherId ? (
              <>
                Current:{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {currentTeacherName}
                </span>
                {" · "}
                {streamId ? "Stream teacher" : "Class teacher"} for this group
              </>
            ) : (
              <>
                Choose the {streamId ? "stream" : "class"} teacher for{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {displayTarget}
                </span>
                . This is not the same as assigning subject teachers.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="rounded-lg border border-[#0073ea]/20 bg-[#0073ea]/[0.06] px-3 py-2.5 dark:border-[#0073ea]/30">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#0073ea]/80">
              Assigning to
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
              {displayTarget}
            </p>
          </div>

          <FormField
            id="teacher-search"
            label="Find a teacher"
            hint="One entry per email — search by name or department"
            error={selectionError}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="teacher-search"
                placeholder="Start typing a name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectionError) setSelectionError("");
                }}
                className="h-9 border-slate-200 bg-white pl-9 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </FormField>

          <div className="min-h-0 flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : filteredTeachers.length === 0 ? (
              <p className="py-10 text-center text-xs text-slate-400">
                {searchTerm
                  ? "No teachers match your search."
                  : "No teachers found. Add staff in Teachers first."}
              </p>
            ) : (
              <ScrollArea className="h-[min(50vh,320px)]">
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/40">
                  {filteredTeachers.map((teacher) => {
                    const name = resolveTeacherDisplayName(teacher);
                    const isCurrent = teacher.id === currentTeacherId;
                    const isSelected = selectedTeacher?.id === teacher.id;
                    const assignedHere = isTeacherClassTeacherForScope(
                      teacher,
                      scope,
                    );
                    const otherAssignments = (
                      teacher.classTeacherAssignments ?? []
                    ).filter(
                      (a) =>
                        a.active !== false &&
                        !isTeacherClassTeacherForScope(
                          { ...teacher, classTeacherAssignments: [a] },
                          scope,
                        ),
                    );

                    return (
                      <li key={teacher.id}>
                        <button
                          type="button"
                          className={cn(
                            "w-full px-3 py-2.5 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
                            isSelected && "bg-slate-50 dark:bg-slate-800/60",
                          )}
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setSelectionError("");
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                {name}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                {teacher.email}
                                {teacher.department
                                  ? ` · ${teacher.department}`
                                  : ""}
                              </p>
                              {"mergedProfileCount" in teacher &&
                              teacher.mergedProfileCount &&
                              teacher.mergedProfileCount > 1 ? (
                                <p className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                                  {teacher.mergedProfileCount} duplicate staff
                                  profiles merged — using primary account
                                </p>
                              ) : null}
                              {otherAssignments.length > 0 ? (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {otherAssignments.map((assignment) => (
                                    <span
                                      key={assignment.id}
                                      className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-800"
                                    >
                                      {assignment.stream?.stream?.name ||
                                        assignment.gradeLevel?.gradeLevel
                                          ?.name ||
                                        "Other class"}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            <div className="flex shrink-0 flex-col gap-1">
                              {isCurrent && (
                                <Badge
                                  variant="outline"
                                  className="h-5 border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
                                >
                                  Current
                                </Badge>
                              )}
                              {assignedHere && !isCurrent && (
                                <Badge
                                  variant="outline"
                                  className="h-5 text-[10px]"
                                >
                                  This class
                                </Badge>
                              )}
                              {isSelected && (
                                <Badge
                                  variant="outline"
                                  className="h-5 border-[#0073ea]/30 bg-[#0073ea]/10 text-[10px] text-[#0073ea]"
                                >
                                  Selected
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200/80 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-400">
            {selectedTeacher
              ? `Selected: ${resolveTeacherDisplayName(selectedTeacher)}`
              : "Select a teacher to continue"}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isAssigning || isUnassigning}
            >
              Cancel
            </Button>

            {currentTeacherId && !selectedTeacher && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUnassignTeacher}
                disabled={isAssigning || isUnassigning}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                {isUnassigning ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Remove current
                  </>
                )}
              </Button>
            )}

            {selectedTeacher ? (
              <Button
                type="button"
                size="sm"
                onClick={primaryAction}
                disabled={primaryBusy}
                variant={selectedIsCurrentForScope ? "outline" : "default"}
                className={cn(
                  "h-9 min-w-[9rem]",
                  selectedIsCurrentForScope &&
                    "border-red-200 text-red-600 hover:bg-red-50",
                )}
              >
                {primaryBusy ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Working...
                  </>
                ) : (
                  primaryLabel
                )}
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
