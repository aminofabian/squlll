"use client";

import { useMemo, useState } from "react";
import { Check, GraduationCap, Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAvailableCurriculaForSchool } from "@/lib/hooks/useAvailableGradeLevels";
import { useClassDirectoryActions } from "../classes/hooks/useClassDirectoryActions";
import type { Level } from "@/lib/types/school-config";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";
import { formatGradeDisplayName, getGradeSortOrder } from "@/lib/utils/grade-display";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddGradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  levels: Level[];
  defaultLevelId?: string;
  onAdded?: () => void;
}

export function AddGradeDialog({
  open,
  onOpenChange,
  onAdded,
}: AddGradeDialogProps) {
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<{
    curriculumId: string;
    gradeId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const actions = useClassDirectoryActions();

  const {
    data: curricula = [],
    isLoading,
    error: queryError,
    refetch,
  } = useAvailableCurriculaForSchool(open);

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase();
    return curricula
      .map((curriculum) => {
        const grades = [...curriculum.grades]
          .sort(
            (a, b) =>
              (a.order ?? 0) - (b.order ?? 0) ||
              getGradeSortOrder(a.name) - getGradeSortOrder(b.name),
          )
          .filter((grade) => {
            if (!term) return true;
            const label = formatGradeDisplayName(grade.name).toLowerCase();
            return (
              label.includes(term) ||
              grade.name.toLowerCase().includes(term) ||
              curriculum.name.toLowerCase().includes(term)
            );
          });
        return { ...curriculum, grades };
      })
      .filter((curriculum) => curriculum.grades.length > 0);
  }, [curricula, query]);

  const selected = useMemo(() => {
    if (!selection) return null;
    for (const curriculum of curricula) {
      const grade = curriculum.grades.find(
        (item) => item.id === selection.gradeId,
      );
      if (grade && curriculum.id === selection.curriculumId) {
        return { curriculum, grade };
      }
    }
    return null;
  }, [curricula, selection]);

  const remainingCount = curricula.reduce(
    (count, curriculum) => count + curriculum.grades.length,
    0,
  );

  const submit = async () => {
    if (!selection) {
      setError("Choose a grade to add");
      return;
    }

    setError(null);
    try {
      await actions.createGrade(selection.curriculumId, selection.gradeId);
      toast.success(
        `${selected ? formatGradeDisplayName(selected.grade.name) : "Grade"} added`,
      );
      onAdded?.();
      onOpenChange(false);
    } catch (err) {
      setError(getDisplayErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f2ef] text-[#246a59] dark:bg-emerald-950/40 dark:text-emerald-300">
              <GraduationCap className="h-4 w-4" />
            </span>
            Add grade
          </DialogTitle>
          <DialogDescription>
            Pick any grade from your school type, including levels you have not
            added yet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="add-grade-search">Available grades</Label>
              <span className="text-[11px] text-slate-400">
                {selected
                  ? `Selected: ${formatGradeDisplayName(selected.grade.name)}`
                  : remainingCount > 0
                    ? `${remainingCount} not added yet`
                    : null}
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50/60 px-4 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading grades…
              </div>
            ) : queryError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
                <p>Could not load the available grades.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 h-8"
                  onClick={() => void refetch()}
                >
                  Try again
                </Button>
              </div>
            ) : remainingCount === 0 ? (
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 px-4 py-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
                <Check className="mx-auto h-5 w-5 text-emerald-600" />
                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Every grade is already added
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  You can rename existing grades or add streams to them.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  id="add-grade-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search grades, including ones not on the school yet"
                  className="h-9"
                />
                <div className="max-h-72 space-y-3 overflow-y-auto rounded-xl border border-slate-200/70 bg-white p-2 dark:border-slate-800 dark:bg-slate-900/40">
                  {groups.length === 0 ? (
                    <p className="px-2 py-6 text-center text-sm text-slate-500">
                      No grades match that search.
                    </p>
                  ) : (
                    groups.map((curriculum) => (
                      <section key={curriculum.id} className="space-y-1.5">
                        <h3 className="px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                          {curriculum.name}
                        </h3>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {curriculum.grades.map((grade) => {
                            const active =
                              selection?.gradeId === grade.id &&
                              selection.curriculumId === curriculum.id;
                            return (
                              <button
                                key={grade.id}
                                type="button"
                                onClick={() => {
                                  setSelection({
                                    curriculumId: curriculum.id,
                                    gradeId: grade.id,
                                  });
                                  setError(null);
                                }}
                                className={cn(
                                  "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                                  active
                                    ? "border-[#246a59] bg-[#e8f2ef] text-[#0a1f1a] dark:border-emerald-400/50 dark:bg-emerald-950/40 dark:text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-[#246a59]/40 hover:bg-[#f8fbfa] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-400/40",
                                )}
                                aria-pressed={active}
                              >
                                <span className="min-w-0">
                                  <span className="block truncate font-medium">
                                    {formatGradeDisplayName(grade.name)}
                                  </span>
                                  {grade.age ? (
                                    <span className="mt-0.5 block text-[11px] text-slate-400">
                                      Age {grade.age}
                                    </span>
                                  ) : null}
                                </span>
                                {active ? (
                                  <Check className="h-4 w-4 shrink-0 text-[#246a59] dark:text-emerald-300" />
                                ) : (
                                  <Plus className="h-4 w-4 shrink-0 text-slate-300" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {error ? (
            <p className="text-xs font-medium text-rose-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={actions.isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void submit()}
            disabled={actions.isSaving || isLoading || !selection}
          >
            {actions.isSaving ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Adding…
              </>
            ) : (
              "Add grade"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
