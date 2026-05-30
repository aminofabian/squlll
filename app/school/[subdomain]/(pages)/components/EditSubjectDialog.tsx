"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Subject } from "@/lib/types/school-config";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface EditSubjectDialogProps {
  subject: Subject;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSubject: Subject) => void;
  tenantSubjectId?: string;
}

function normalizeSubjectType(type: string | undefined): "core" | "elective" {
  if (type === "core") return "core";
  return "elective";
}

export function EditSubjectDialog({
  subject,
  isOpen,
  onClose,
  onSave,
  tenantSubjectId,
}: EditSubjectDialogProps) {
  const [editedSubject, setEditedSubject] = useState<Subject>({ ...subject });
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setEditedSubject({
        ...subject,
        subjectType: normalizeSubjectType(subject.subjectType),
      });
    }
  }, [isOpen, subject]);

  const handleSave = async () => {
    if (tenantSubjectId) {
      await handleUpdateCustomSubject();
    } else {
      onSave(editedSubject);
      onClose();
    }
  };

  const handleUpdateCustomSubject = async () => {
    if (!tenantSubjectId) {
      toast.error("Missing tenant subject ID");
      return;
    }

    setIsLoading(true);

    try {
      const input: Record<string, unknown> = {};

      if (editedSubject.name) input.name = editedSubject.name;
      if (
        editedSubject.totalMarks !== null &&
        editedSubject.totalMarks !== undefined
      ) {
        input.totalMarks = editedSubject.totalMarks;
      }
      if (
        editedSubject.isCompulsory !== null &&
        editedSubject.isCompulsory !== undefined
      ) {
        input.isCompulsory = editedSubject.isCompulsory;
      }
      if (
        editedSubject.passingMarks !== null &&
        editedSubject.passingMarks !== undefined
      ) {
        input.passingMarks = editedSubject.passingMarks;
      }
      if (
        editedSubject.creditHours !== null &&
        editedSubject.creditHours !== undefined
      ) {
        input.creditHours = editedSubject.creditHours;
      }
      if (editedSubject.code) input.code = editedSubject.code;
      if (editedSubject.category) input.category = editedSubject.category;
      if (editedSubject.department) input.department = editedSubject.department;
      if (editedSubject.shortName) input.shortName = editedSubject.shortName;
      if (editedSubject.subjectType) {
        input.subjectType = normalizeSubjectType(editedSubject.subjectType);
      }

      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation UpdateCustomSubject($tenantSubjectId: String!, $input: UpdateTenantSubjectInput!) {
              updateCustomSubject(tenantSubjectId: $tenantSubjectId, input: $input) {
                id
                customSubject {
                  id
                  name
                  code
                  category
                  department
                  shortName
                }
                isCompulsory
                totalMarks
                passingMarks
                creditHours
                subjectType
              }
            }
          `,
          variables: {
            tenantSubjectId,
            input,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || "Failed to update subject");
      }

      if (result.data?.updateCustomSubject) {
        toast.success("Subject updated");

        const updatedData = result.data.updateCustomSubject;
        const updatedSubject = {
          ...editedSubject,
          id: updatedData.id,
          name: updatedData.customSubject?.name || editedSubject.name,
          code: updatedData.customSubject?.code || editedSubject.code,
          category:
            updatedData.customSubject?.category || editedSubject.category,
          department:
            updatedData.customSubject?.department || editedSubject.department,
          shortName:
            updatedData.customSubject?.shortName || editedSubject.shortName,
          totalMarks: updatedData.totalMarks,
          passingMarks: updatedData.passingMarks,
          creditHours: updatedData.creditHours,
          isCompulsory: updatedData.isCompulsory,
          subjectType:
            updatedData.subjectType ||
            normalizeSubjectType(editedSubject.subjectType),
        };

        queryClient.invalidateQueries({ queryKey: ["tenantSubjects"] });

        onSave(updatedSubject);
        onClose();
      } else {
        throw new Error("Update failed - no data returned");
      }
    } catch (error) {
      console.error("Error updating custom subject:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update subject",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const subjectType = normalizeSubjectType(editedSubject.subjectType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden border-slate-200/80 bg-slate-50/50 p-0 dark:border-slate-800 dark:bg-slate-950">
        <DialogHeader className="border-b border-slate-200/80 bg-white px-5 py-4 text-left dark:border-slate-800 dark:bg-slate-900">
          <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Edit subject
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Update name, type, and assessment settings
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(70vh,560px)] overflow-y-auto px-5 py-4 space-y-5">
          <section className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Basics
            </h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs text-slate-600">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editedSubject.name}
                  onChange={(e) =>
                    setEditedSubject({ ...editedSubject, name: e.target.value })
                  }
                  className="h-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  placeholder="Subject name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-xs text-slate-600">
                    Code
                  </Label>
                  <Input
                    id="code"
                    value={editedSubject.code}
                    onChange={(e) =>
                      setEditedSubject({
                        ...editedSubject,
                        code: e.target.value,
                      })
                    }
                    className="h-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                    placeholder="e.g. MATH"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="department" className="text-xs text-slate-600">
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={editedSubject.department || ""}
                    onChange={(e) =>
                      setEditedSubject({
                        ...editedSubject,
                        department: e.target.value,
                      })
                    }
                    className="h-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Type
            </h3>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100/80 p-1 dark:bg-slate-800/60">
              {(
                [
                  { id: "core", label: "Core", hint: "Required" },
                  { id: "elective", label: "Elective", hint: "Optional" },
                ] as const
              ).map(({ id, label, hint }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setEditedSubject({ ...editedSubject, subjectType: id })
                  }
                  className={cn(
                    "flex-1 rounded-md px-3 py-2 text-left transition-colors",
                    subjectType === id
                      ? id === "core"
                        ? "bg-white text-emerald-800 shadow-sm dark:bg-slate-900 dark:text-emerald-300"
                        : "bg-white text-amber-800 shadow-sm dark:bg-slate-900 dark:text-amber-300"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400",
                  )}
                >
                  <span className="block text-xs font-medium">{label}</span>
                  <span className="block text-[10px] opacity-70">{hint}</span>
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/60">
              <Checkbox
                id="isCompulsory"
                checked={editedSubject.isCompulsory || false}
                onCheckedChange={(checked) =>
                  setEditedSubject({
                    ...editedSubject,
                    isCompulsory: checked === true ? true : null,
                  })
                }
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <Label
                  htmlFor="isCompulsory"
                  className="text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  Compulsory for all students
                </Label>
                <p className="text-[11px] text-slate-400">
                  Applies when assigning subjects to classes
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Assessment
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="totalMarks" className="text-xs text-slate-600">
                  Total marks
                </Label>
                <Input
                  id="totalMarks"
                  type="number"
                  value={editedSubject.totalMarks ?? ""}
                  onChange={(e) =>
                    setEditedSubject({
                      ...editedSubject,
                      totalMarks: parseInt(e.target.value, 10) || null,
                    })
                  }
                  className="h-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  placeholder="100"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="passingMarks" className="text-xs text-slate-600">
                  Pass mark
                </Label>
                <Input
                  id="passingMarks"
                  type="number"
                  value={editedSubject.passingMarks ?? ""}
                  onChange={(e) =>
                    setEditedSubject({
                      ...editedSubject,
                      passingMarks: parseInt(e.target.value, 10) || null,
                    })
                  }
                  className="h-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  placeholder="40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="creditHours" className="text-xs text-slate-600">
                  Credit hrs
                </Label>
                <Input
                  id="creditHours"
                  type="number"
                  value={editedSubject.creditHours ?? ""}
                  onChange={(e) =>
                    setEditedSubject({
                      ...editedSubject,
                      creditHours: parseInt(e.target.value, 10) || null,
                    })
                  }
                  className="h-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  placeholder="—"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200/80 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-600"
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
