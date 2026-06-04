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
  subjectName: string;
  onAssigned?: () => void;
}

export function AssignSubjectTeacherSheet({
  open,
  onOpenChange,
  tenantSubjectIds,
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
    const existingIds = (teacher.tenantSubjects || []).map((s) => s.id);
    const missingIds = tenantSubjectIds.filter((id) => !existingIds.includes(id));
    if (missingIds.length === 0) {
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
              tenantSubjectIds: [...existingIds, ...missingIds],
              tenantGradeLevelIds: (teacher.tenantGradeLevels || []).map(
                (g) => g.id,
              ),
              tenantStreamIds: (teacher.tenantStreams || []).map((s) => s.id),
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
            Who teaches <span className="font-medium text-slate-800">{subjectName}</span>?
            This updates the teacher&apos;s subject assignments (not the class/stream
            teacher role).
          </SheetDescription>
        </SheetHeader>

        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
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
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
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
                          : "border-slate-200/80 hover:border-[#0073ea]/30 hover:bg-slate-50 dark:border-slate-700",
                      )}
                    >
                      <span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {name}
                        </span>
                        {teacher.email ? (
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {teacher.email}
                          </span>
                        ) : null}
                      </span>
                      {savingId === teacher.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      ) : already ? (
                        <span className="text-[10px] font-semibold text-emerald-600">
                          Assigned
                        </span>
                      ) : (
                        <UserPlus className="h-4 w-4 text-[#0073ea]" />
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
