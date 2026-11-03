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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { FormField } from "../classes/components/FormField";
import { cn } from "@/lib/utils";

interface StreamGradeTarget {
  id: string;
  name: string;
  existing?: string[];
}

interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gradeId: string;
  gradeName: string;
  existing?: string[];
  grades?: StreamGradeTarget[];
}

const PRESETS: { label: string; names: string[] }[] = [
  { label: "A and B", names: ["A", "B"] },
  { label: "A, B and C", names: ["A", "B", "C"] },
];

function streamKey(name: string) {
  return name.trim().toLowerCase();
}

function joinNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function AddStreamModal({
  isOpen,
  onClose,
  onSuccess,
  gradeId,
  gradeName,
  existing,
  grades,
}: AddStreamModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const [names, setNames] = useState<string[]>([]);
  const [draftName, setDraftName] = useState("");
  const [capacity, setCapacity] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [capacityError, setCapacityError] = useState<string | null>(null);

  const targets = useMemo(() => {
    if (grades && grades.length > 0) return grades;
    return [{ id: gradeId, name: gradeName, existing }];
  }, [grades, gradeId, gradeName, existing]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(targets.map((grade) => grade.id)),
  );

  const resetForm = () => {
    setNames([]);
    setDraftName("");
    setCapacity("30");
    setError(null);
    setCapacityError(null);
    setSelectedIds(new Set(targets.map((grade) => grade.id)));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addNames = (incoming: string[]) => {
    setNames((current) => {
      const next = [...current];
      const seen = new Set(current.map(streamKey));
      for (const name of incoming) {
        const trimmed = name.trim();
        const key = streamKey(trimmed);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        next.push(trimmed);
      }
      return next;
    });
    setError(null);
  };

  const commitDraft = () => {
    const parts = draftName.split(/[\n,]/);
    if (parts.some((part) => part.trim())) addNames(parts);
    setDraftName("");
  };

  const selected = targets.filter((grade) => selectedIds.has(grade.id));
  const creates = selected.flatMap((grade) =>
    names
      .filter(
        (name) =>
          !(grade.existing ?? []).some(
            (current) => streamKey(current) === streamKey(name),
          ),
      )
      .map((name) => ({ grade, name })),
  );
  const skippedCount = selected.length * names.length - creates.length;

  const presetActive = (presetNames: string[]) =>
    names.length === presetNames.length &&
    presetNames.every(
      (name, index) => streamKey(names[index] ?? "") === streamKey(name),
    );

  const handleSubmit = async () => {
    const capacityValue = Number(capacity);
    if (!capacity || Number.isNaN(capacityValue) || capacityValue < 1) {
      setCapacityError("Enter a capacity of at least 1 student");
      return;
    }
    if (creates.length === 0) return;

    setIsLoading(true);
    setError(null);
    let created = 0;
    const failures: string[] = [];

    try {
      for (const pair of creates) {
        const response = await fetch("/api/school/create-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: pair.name,
            capacity,
            gradeId: pair.grade.id,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          const detail = Array.isArray(data.details)
            ? data.details[0]?.message
            : undefined;
          failures.push(
            `${pair.grade.name} · ${pair.name}: ${detail || data.error || "Could not create this stream"}`,
          );
          continue;
        }
        created += 1;
      }

      await queryClient.invalidateQueries({ queryKey: ["schoolConfig"] });

      if (created > 0 && failures.length === 0) {
        toast.success(
          created === 1 ? "Stream added" : `${created} streams added`,
        );
        resetForm();
        onSuccess();
        onClose();
        return;
      }

      if (created > 0) {
        toast.success(
          `Added ${created} stream${created === 1 ? "" : "s"}. ${failures.length} could not be added.`,
        );
        resetForm();
        onSuccess();
        onClose();
        return;
      }

      setError(failures[0] ?? "Could not create the streams");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "An error occurred while creating the streams",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addLabel =
    names.length === 0
      ? "Choose stream names"
      : selected.length === 0
        ? "Choose grades"
        : creates.length === 0
          ? "Already on those grades"
          : targets.length === 1
            ? `Add ${joinNames(names)}`
            : `Add ${joinNames(names)} to ${selected.length} grades`;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden border-slate-200/80 bg-slate-50 p-0 dark:border-slate-800 dark:bg-slate-950 sm:max-w-lg">
        <DialogHeader className="border-b border-slate-200/80 bg-white px-5 py-4 text-left dark:border-slate-800 dark:bg-slate-900">
          <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {targets.length > 1 ? "Add streams to grades" : "Add streams"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {targets.length > 1
              ? "The same names are added to every grade you leave ticked. Names a grade already has are skipped."
              : `Add class divisions to ${targets[0]?.name ?? gradeName}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-auto px-5 py-4">
          <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Stream names
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setNames(preset.names);
                    setError(null);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium",
                    presetActive(preset.names)
                      ? "border-[#246a59] bg-[#e8f2ef] text-[#246a59]"
                      : "border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {names.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {names.map((name) => (
                  <span
                    key={streamKey(name)}
                    className="inline-flex items-center gap-1 rounded-full bg-[#e8f2ef] px-2.5 py-1 text-xs font-medium text-[#246a59]"
                  >
                    {name}
                    <button
                      type="button"
                      aria-label={`Remove ${name}`}
                      onClick={() =>
                        setNames((current) =>
                          current.filter(
                            (item) => streamKey(item) !== streamKey(name),
                          ),
                        )
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <div className="flex gap-2">
              <Input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitDraft();
                  }
                }}
                placeholder="North, South, or Blue"
                className="h-9 border-slate-200 bg-white text-sm dark:border-slate-700 dark:bg-slate-900"
              />
              <Button
                type="button"
                variant="outline"
                className="h-9 shrink-0"
                onClick={commitDraft}
                disabled={!draftName.trim()}
              >
                Add name
              </Button>
            </div>
          </div>

          {targets.length > 1 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Grades
                </p>
                <button
                  type="button"
                  className="text-[11px] font-medium text-[#246a59]"
                  onClick={() => {
                    const allOn = targets.every((grade) =>
                      selectedIds.has(grade.id),
                    );
                    setSelectedIds(
                      allOn
                        ? new Set()
                        : new Set(targets.map((grade) => grade.id)),
                    );
                  }}
                >
                  {targets.every((grade) => selectedIds.has(grade.id))
                    ? "Clear"
                    : "All grades"}
                </button>
              </div>
              <div className="space-y-2">
                {targets.map((grade) => {
                  const checked = selectedIds.has(grade.id);
                  const has = grade.existing ?? [];
                  const willAdd = names.filter(
                    (name) =>
                      !has.some(
                        (current) => streamKey(current) === streamKey(name),
                      ),
                  );
                  return (
                    <label
                      key={grade.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5",
                        checked
                          ? "border-[#246a59] bg-[#e8f2ef]/60"
                          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() =>
                          setSelectedIds((current) => {
                            const next = new Set(current);
                            if (next.has(grade.id)) next.delete(grade.id);
                            else next.add(grade.id);
                            return next;
                          })
                        }
                        aria-label={grade.name}
                        className="mt-0.5"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                          {grade.name}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-slate-500">
                          {checked && names.length > 0
                            ? willAdd.length === 0
                              ? `Already has ${joinNames(names)}`
                              : `Will add ${joinNames(willAdd)}`
                            : has.length > 0
                              ? `Has ${has.join(", ")}`
                              : "No streams yet"}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (targets[0]?.existing?.length ?? 0) > 0 ? (
            <p className="text-xs text-slate-500">
              {targets[0]?.name} already has {targets[0]?.existing?.join(", ")}.
            </p>
          ) : null}

          {skippedCount > 0 && creates.length > 0 ? (
            <p className="text-xs text-slate-500">
              {skippedCount} stream{skippedCount === 1 ? "" : "s"} already
              exist and will be left as they are.
            </p>
          ) : null}

          <FormField
            id="capacity"
            label="Maximum students"
            hint="Used for every new stream"
            error={capacityError ?? undefined}
          >
            <Input
              id="capacity"
              name="capacity"
              type="number"
              value={capacity}
              onChange={(event) => {
                setCapacity(event.target.value);
                setCapacityError(null);
              }}
              className="h-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              min={1}
              aria-invalid={!!capacityError}
            />
          </FormField>

          {error ? (
            <p className="text-xs font-medium text-rose-600" role="alert">
              {error}
            </p>
          ) : null}
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
            type="button"
            size="sm"
            className="h-9 sm:min-w-[8rem]"
            disabled={isLoading || creates.length === 0}
            onClick={() => void handleSubmit()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {addLabel}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
