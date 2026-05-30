"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { FormField } from "../classes/components/FormField";

interface AvailableSubject {
  subjectId: string;
  name: string;
  code: string;
  subjectType: string;
  category?: string;
  department?: string;
}

interface AddSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  curriculumId: string;
  levelName: string;
  gradeName?: string;
  streamName?: string;
  onSuccess?: () => void;
}

export function AddSubjectDialog({
  open,
  onOpenChange,
  curriculumId,
  levelName,
  gradeName,
  streamName,
  onSuccess,
}: AddSubjectDialogProps) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"catalog" | "custom">("catalog");
  const [search, setSearch] = useState("");
  const [available, setAvailable] = useState<AvailableSubject[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [savingCustom, setSavingCustom] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: "",
    code: "",
    subjectType: "core" as "core" | "elective",
  });
  const [customErrors, setCustomErrors] = useState<{ name?: string; code?: string }>({});

  useEffect(() => {
    if (!open || !curriculumId) return;

    setSearch("");
    setMode("catalog");
    setCustomForm({ name: "", code: "", subjectType: "core" });
    setCustomErrors({});

    const loadAvailable = async () => {
      setLoadingCatalog(true);
      try {
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query AvailableSubjects($curriculumId: String!) {
                availableSubjectsForCurriculum(curriculumId: $curriculumId) {
                  subjectId
                  name
                  code
                  subjectType
                  category
                  department
                }
              }
            `,
            variables: { curriculumId },
          }),
        });
        const data = await res.json();
        if (data.errors) {
          throw new Error(data.errors[0]?.message || "Failed to load subjects");
        }
        setAvailable(data.data?.availableSubjectsForCurriculum ?? []);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load catalog subjects",
        );
        setAvailable([]);
      } finally {
        setLoadingCatalog(false);
      }
    };

    loadAvailable();
  }, [open, curriculumId]);

  const filteredAvailable = useMemo(() => {
    if (!search.trim()) return available;
    const q = search.toLowerCase();
    return available.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q),
    );
  }, [available, search]);

  const contextLabel = useMemo(() => {
    const parts = [levelName];
    if (gradeName) parts.push(gradeName);
    if (streamName) parts.push(streamName);
    return parts.join(" · ");
  }, [levelName, gradeName, streamName]);

  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["tenantSubjects"] }),
      queryClient.invalidateQueries({ queryKey: ["schoolConfig"] }),
    ]);
    onSuccess?.();
  };

  const handleAssignCatalogSubject = async (subject: AvailableSubject) => {
    setAddingId(subject.subjectId);
    try {
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation AssignSubject($input: CreateTenantSubjectInput!) {
              assignSubjectToLevel(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              curriculumId,
              subjectId: subject.subjectId,
              subjectType: subject.subjectType === "elective" ? "elective" : "core",
            },
          },
        }),
      });
      const data = await res.json();
      if (data.errors) {
        throw new Error(data.errors[0]?.message || "Failed to add subject");
      }

      toast.success(`${subject.name} added`);
      setAvailable((prev) =>
        prev.filter((s) => s.subjectId !== subject.subjectId),
      );
      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add subject");
    } finally {
      setAddingId(null);
    }
  };

  const handleCreateCustom = async () => {
    const nextErrors: { name?: string; code?: string } = {};
    if (!customForm.name.trim()) nextErrors.name = "Subject name is required";
    if (!customForm.code.trim()) nextErrors.code = "Subject code is required";
    if (Object.keys(nextErrors).length > 0) {
      setCustomErrors(nextErrors);
      return;
    }
    setCustomErrors({});

    setSavingCustom(true);
    try {
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation CreateCustomSubject($input: CreateCustomSubjectInput!) {
              createCustomSubject(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              name: customForm.name.trim(),
              code: customForm.code.trim().toUpperCase(),
              curriculumId,
              subjectType: customForm.subjectType,
              isCompulsory: customForm.subjectType === "core",
            },
          },
        }),
      });
      const data = await res.json();
      if (data.errors) {
        throw new Error(data.errors[0]?.message || "Failed to create subject");
      }

      toast.success(`${customForm.name} created`);
      setCustomForm({ name: "", code: "", subjectType: "core" });
      await refreshData();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create subject",
      );
    } finally {
      setSavingCustom(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden border-slate-200/80 bg-slate-50/50 p-0 dark:border-slate-800 dark:bg-slate-950">
        <DialogHeader className="border-b border-slate-200/80 bg-white px-5 py-4 text-left dark:border-slate-800 dark:bg-slate-900">
          <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Add subject
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Adding to <span className="font-medium text-slate-700 dark:text-slate-300">{contextLabel}</span>.
            Subjects apply to the whole level — all streams in this level share them.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(70vh,520px)] overflow-y-auto px-5 py-4 space-y-4">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100/80 p-1 dark:bg-slate-800/60">
            {(
              [
                { id: "catalog", label: "From catalog" },
                { id: "custom", label: "Custom subject" },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  mode === id
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "catalog" ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search catalog..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 pl-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              {loadingCatalog ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : filteredAvailable.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  {available.length === 0
                    ? "All catalog subjects for this level are already added."
                    : "No subjects match your search."}
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/40">
                  {filteredAvailable.map((subject) => (
                    <li
                      key={subject.subjectId}
                      className="flex items-center gap-3 px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                          {subject.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {subject.code}
                          <span className="mx-1">·</span>
                          {subject.subjectType === "elective"
                            ? "Elective"
                            : "Core"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 shrink-0"
                        disabled={addingId === subject.subjectId}
                        onClick={() => handleAssignCatalogSubject(subject)}
                      >
                        {addingId === subject.subjectId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-4 dark:border-slate-800 dark:bg-slate-900/40">
              <FormField
                id="subject-name"
                label="Subject name"
                required
                hint="The name students and teachers will see"
                error={customErrors.name}
              >
                <Input
                  id="subject-name"
                  value={customForm.name}
                  onChange={(e) => {
                    setCustomForm((f) => ({ ...f, name: e.target.value }));
                    setCustomErrors((err) => ({ ...err, name: undefined }));
                  }}
                  placeholder="e.g. Robotics, Art & Design"
                  className="h-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  aria-invalid={!!customErrors.name}
                />
              </FormField>
              <FormField
                id="subject-code"
                label="Subject code"
                required
                hint="A short code for reports (2–6 letters)"
                error={customErrors.code}
              >
                <Input
                  id="subject-code"
                  value={customForm.code}
                  onChange={(e) => {
                    setCustomForm((f) => ({ ...f, code: e.target.value }));
                    setCustomErrors((err) => ({ ...err, code: undefined }));
                  }}
                  placeholder="e.g. ROB, ART"
                  className="h-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  aria-invalid={!!customErrors.code}
                />
              </FormField>
              <FormField
                id="subject-type"
                label="Subject type"
                hint="Core subjects are required; elective subjects are optional"
              >
                <div className="flex items-center gap-1 rounded-lg bg-slate-100/80 p-1 dark:bg-slate-800/60">
                  {(
                    [
                      { id: "core", label: "Core" },
                      { id: "elective", label: "Elective" },
                    ] as const
                  ).map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        setCustomForm((f) => ({ ...f, subjectType: id }))
                      }
                      className={cn(
                        "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        customForm.subjectType === id
                          ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                          : "text-slate-500",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </FormField>
              <Button
                className="h-9 w-full"
                size="sm"
                disabled={savingCustom}
                onClick={handleCreateCustom}
              >
                {savingCustom ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create subject"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
