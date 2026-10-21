"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetTeachers } from "@/lib/hooks/useTeachers";
import { resolveTeacherDisplayName } from "@/lib/utils/teacher-display";
import { Loader2, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const UPDATE_TEACHER_ASSIGNMENTS = `
  mutation UpdateTeacherAssignments($input: UpdateTeacherAssignmentsInput!) {
    updateTeacherAssignments(input: $input) {
      id
    }
  }
`;

interface AssignSubjectTeacherSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** All tenant-subject row ids for this curriculum line (deduped duplicates). */
  tenantSubjectIds: string[];
  /**
   * Grade level(s) this subject is being assigned in. Accepts the school
   * config GradeLevel id — the API resolves it to the tenant grade level.
   * Passing it keeps the teacher's portal in sync ("No Assigned Grades" bug).
   */
  gradeLevelIds?: string[];
  subjectName: string;
  onAssigned?: () => void;
}

export function AssignSubjectTeacherSheet({
  open,
  onOpenChange,
  tenantSubjectIds,
  gradeLevelIds,
  subjectName,
  onAssigned,
}: AssignSubjectTeacherSheetProps) {
  const queryClient = useQueryClient();
  const { teachers, isLoading } = useGetTeachers();
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = teachers.filter((t) => {
    if (t.isActive === false) return false;
    const name = resolveTeacherDisplayName(t).toLowerCase();
    const email = (t.email || "").toLowerCase();
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return name.includes(q) || email.includes(q);
  });

  const assignToTeacher = async (teacher: (typeof teachers)[0]) => {
    const existingSubjectIds = (teacher.tenantSubjects || []).map((s) => s.id);
    const missingSubjectIds = tenantSubjectIds.filter(
      (id) => !existingSubjectIds.includes(id),
    );

    const existingGradeIds = (teacher.tenantGradeLevels || []).map((g) => g.id);
    const missingGradeIds = (gradeLevelIds ?? []).filter(
      (id) => !existingGradeIds.includes(id),
    );

    if (missingSubjectIds.length === 0 && missingGradeIds.length === 0) {
      toast.info(`${resolveTeacherDisplayName(teacher)} already teaches this subject`);
      onOpenChange(false);
      return;
    }

    setSavingId(teacher.id);
    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: UPDATE_TEACHER_ASSIGNMENTS,
          variables: {
            input: {
              teacherId: teacher.id,
              tenantSubjectIds: [...existingSubjectIds, ...missingSubjectIds],
              // Assigning a subject inside a class also makes the teacher a
              // teacher of that class, so the portal has grades to work with.
              tenantGradeLevelIds: [...existingGradeIds, ...missingGradeIds],
              tenantStreamIds: (teacher.tenantStreams || []).map(
                (s) => s.id,
              ),
            },
          },
        }),
      });

      const result = await response.json();
      if (result.errors?.length) {
        throw new Error(result.errors[0]?.message || "Failed to assign");
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["getTeachers"] }),
        queryClient.invalidateQueries({ queryKey: ["tenantSubjects"] }),
      ]);

      toast.success("Subject teacher assigned", {
        description: `${resolveTeacherDisplayName(teacher)} → ${subjectName}`,
      });
      onAssigned?.();
      onOpenChange(false);
    } catch (err) {
      toast.error("Could not assign teacher", {
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Assign subject teacher</SheetTitle>
          <SheetDescription>
            Who teaches <span className="font-medium text-[#0a1f1a]">{subjectName}</span>?
            The teacher is also assigned to this class in their portal (not the
            class/stream teacher role).
          </SheetDescription>
        </SheetHeader>

        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#1a4d42]/45" />
          <Input
            placeholder="Search teachers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#1a4d42]/45" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#1a4d42]/55">
              No teachers found. Add staff in Teachers first.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {filtered.map((teacher) => {
                const name = resolveTeacherDisplayName(teacher) || "Teacher";
                const already = tenantSubjectIds.every((id) =>
                  (teacher.tenantSubjects || []).some((s) => s.id === id),
                );
                return (
                  <li key={teacher.id}>
                    <button
                      type="button"
                      disabled={Boolean(savingId)}
                      onClick={() => assignToTeacher(teacher)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                        already
                          ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/30"
                          : "border-[#1a4d42]/12 hover:border-[#246a59]/30 hover:bg-[#f8fbfa] dark:border-white/15",
                      )}
                    >
                      <span>
                        <span className="font-medium text-[#0a1f1a] dark:text-white">
                          {name}
                        </span>
                        {teacher.email ? (
                          <span className="mt-0.5 block text-xs text-[#1a4d42]/55">
                            {teacher.email}
                          </span>
                        ) : null}
                      </span>
                      {savingId === teacher.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#1a4d42]/45" />
                      ) : already ? (
                        <span className="text-[10px] font-semibold text-emerald-600">
                          Assigned
                        </span>
                      ) : (
                        <UserPlus className="h-4 w-4 text-[#246a59]" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
      </SheetContent>
    </Sheet>
  );
}
