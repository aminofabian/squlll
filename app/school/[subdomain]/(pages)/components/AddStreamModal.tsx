"use client";

import { useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { FormField } from "../classes/components/FormField";

interface StreamGradeTarget {
  id: string;
  name: string;
}

interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gradeId: string;
  gradeName: string;
  grades?: StreamGradeTarget[];
}

function parseStreamNames(value: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const part of value.split(/[\n,]/)) {
    const name = part.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
}

export function AddStreamModal({
  isOpen,
  onClose,
  onSuccess,
  gradeId,
  gradeName,
  grades,
}: AddStreamModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const [namesText, setNamesText] = useState("");
  const [capacity, setCapacity] = useState("30");
  const [errors, setErrors] = useState<{ names?: string; capacity?: string }>(
    {},
  );

  const targets = useMemo(() => {
    if (grades && grades.length > 0) return grades;
    return [{ id: gradeId, name: gradeName }];
  }, [grades, gradeId, gradeName]);

  const resetForm = () => {
    setNamesText("");
    setCapacity("30");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const names = parseStreamNames(namesText);
    const capacityValue = Number(capacity);
    const next: { names?: string; capacity?: string } = {};
    if (names.length === 0) {
      next.names = "Enter at least one stream name";
    }
    if (!capacity || Number.isNaN(capacityValue) || capacityValue < 1) {
      next.capacity = "Enter a capacity of at least 1 student";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsLoading(true);
    let created = 0;
    const failures: string[] = [];

    try {
      for (const grade of targets) {
        for (const name of names) {
          const response = await fetch("/api/school/create-stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              capacity,
              gradeId: grade.id,
            }),
          });
          const data = await response.json();
          if (!response.ok) {
            const detail = Array.isArray(data.details)
              ? data.details[0]?.message
              : undefined;
            failures.push(
              `${grade.name} · ${name}: ${detail || data.error || "Could not create this stream"}`,
            );
            continue;
          }
          created += 1;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["schoolConfig"] });

      if (created > 0 && failures.length === 0) {
        toast.success(
          created === 1 ? "Stream created" : `${created} streams created`,
        );
        resetForm();
        onSuccess();
        onClose();
        return;
      }

      if (created > 0) {
        toast.success(
          `Created ${created} stream${created === 1 ? "" : "s"}. ${failures.length} could not be added.`,
        );
        resetForm();
        onSuccess();
        onClose();
        return;
      }

      toast.error(failures[0] ?? "Could not create the streams");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while creating the streams",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const gradeLabel =
    targets.length === 1
      ? targets[0].name
      : `${targets.length} grades`;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md gap-0 overflow-hidden border-slate-200/80 bg-slate-50 p-0 dark:border-slate-800 dark:bg-slate-950">
        <DialogHeader className="border-b border-slate-200/80 bg-white px-5 py-4 text-left dark:border-slate-800 dark:bg-slate-900">
          <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Add streams
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Add one or more class divisions to{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {gradeLabel}
            </span>
            . Put each name on its own line, for example East, West, and Blue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 py-4">
            {targets.length > 1 ? (
              <p className="text-[11px] text-slate-500">
                {targets.map((grade) => grade.name).join(", ")}
              </p>
            ) : null}
            <div className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <FormField
                id="stream-names"
                label="Stream names"
                required
                hint="One name per line, or separate them with commas"
                error={errors.names}
              >
                <Textarea
                  id="stream-names"
                  value={namesText}
                  onChange={(event) => {
                    setNamesText(event.target.value);
                    setErrors((current) => ({ ...current, names: undefined }));
                  }}
                  placeholder={"East\nWest\nBlue"}
                  className="min-h-24 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  aria-invalid={!!errors.names}
                />
              </FormField>
              <FormField
                id="capacity"
                label="Maximum students"
                required
                hint="Applied to every stream you add"
                error={errors.capacity}
              >
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={capacity}
                  onChange={(event) => {
                    setCapacity(event.target.value);
                    setErrors((current) => ({
                      ...current,
                      capacity: undefined,
                    }));
                  }}
                  className="h-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  min={1}
                  aria-invalid={!!errors.capacity}
                />
              </FormField>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200/80 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-9 sm:min-w-[8rem]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add streams"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
