"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useGradeLevelsForSchoolType } from "@/lib/hooks/useGradeLevelsForSchoolType";
import { formatGradeDisplayName } from "@/lib/utils/grade-display";

interface AssignGradeStreamDialogProps {
  studentId: string;
  studentName?: string;
  currentGradeLevelId?: string;
  currentStreamId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function sortGrades<
  T extends { gradeLevel: { name: string }; sortOrder?: number },
>(grades: T[]): T[] {
  return [...grades].sort((a, b) => {
    const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return a.gradeLevel.name.localeCompare(b.gradeLevel.name);
  });
}

export function AssignGradeStreamDialog({
  studentId,
  studentName,
  currentGradeLevelId = "",
  currentStreamId,
  open,
  onOpenChange,
  onSuccess,
}: AssignGradeStreamDialogProps) {
  const queryClient = useQueryClient();
  const { data: gradeLevels, isLoading: gradesLoading } =
    useGradeLevelsForSchoolType(open);

  const sortedGrades = useMemo(
    () => sortGrades(gradeLevels ?? []),
    [gradeLevels],
  );

  const [gradeId, setGradeId] = useState(currentGradeLevelId);
  const [streamId, setStreamId] = useState(currentStreamId ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setGradeId(currentGradeLevelId);
    setStreamId(currentStreamId ?? "");
    setError(null);
  }, [open, currentGradeLevelId, currentStreamId]);

  const selectedGrade = sortedGrades.find((g) => g.id === gradeId);
  const availableStreams = useMemo(
    () =>
      selectedGrade?.tenantStreams
        .map((ts) => ts.stream)
        .filter((stream): stream is { id: string; name: string } =>
          Boolean(stream),
        ) ?? [],
    [selectedGrade],
  );
  const requiresStream = availableStreams.length > 0;

  useEffect(() => {
    if (!open || !gradeId) return;

    if (availableStreams.length === 0) {
      setStreamId("");
      return;
    }

    const stillValid = availableStreams.some((s) => s.id === streamId);
    if (!stillValid) {
      setStreamId("");
    }
  }, [open, gradeId, availableStreams, streamId]);

  const handleSubmit = async () => {
    if (!gradeId) {
      setError("Please select a grade");
      return;
    }

    if (requiresStream && !streamId) {
      setError("Please select a stream for this grade");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/school/update-student-enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          tenantGradeLevelId: gradeId,
          ...(streamId ? { streamId } : {}),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update class assignment");
      }

      await queryClient.invalidateQueries({ queryKey: ["students"] });

      toast.success("Class assignment updated", {
        description: studentName
          ? `${studentName} has been assigned to the selected grade${streamId ? " and stream" : ""}.`
          : "Grade and stream updated successfully.",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update class assignment";
      setError(message);
      toast.error("Update failed", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAssignment = Boolean(currentGradeLevelId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-emerald-700" />
            {hasAssignment ? "Change grade & stream" : "Assign grade & stream"}
          </DialogTitle>
          <DialogDescription>
            {studentName
              ? `Set the grade and stream for ${studentName}.`
              : "Choose the grade and stream for this student."}
          </DialogDescription>
        </DialogHeader>

        {gradesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Grade</Label>
              <Select value={gradeId || undefined} onValueChange={setGradeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {sortedGrades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {formatGradeDisplayName(grade.gradeLevel.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {requiresStream && (
              <div className="space-y-2">
                <Label>Stream</Label>
                <Select
                  value={streamId || undefined}
                  onValueChange={setStreamId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stream" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStreams.map((stream) => (
                      <SelectItem key={stream.id} value={stream.id}>
                        {stream.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {availableStreams.length === 1
                    ? "This grade has one stream — confirm or change the assignment."
                    : "Select the stream this student belongs to."}
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || gradesLoading || !gradeId}
            className="bg-[#246a59] hover:bg-[#1a4d42]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save assignment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
