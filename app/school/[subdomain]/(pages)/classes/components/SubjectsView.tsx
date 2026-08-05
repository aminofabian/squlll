"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Edit, Trash2, Loader2, Plus, Layers } from "lucide-react";
import {
  useTenantSubjects,
  TenantSubject,
} from "@/lib/hooks/useTenantSubjects";
import { EditSubjectDialog } from "../../components/EditSubjectDialog";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
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
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ClassActionBar,
  type ClassAction,
} from "./ClassActionBar";

import {
  dedupeSubjectsByMaster,
  type SubjectListItem,
} from "../utils/dedupeSubjects";
import { useSubjectTeacherMap } from "../utils/useSubjectTeacherMap";
import { SubjectTeacherBadge } from "./SubjectTeacherBadge";
import { AssignSubjectTeacherSheet } from "./AssignSubjectTeacherSheet";

type DisplaySubject = SubjectListItem;

interface SubjectsViewProps {
  selectedGradeId?: string | null;
  onAddSubject?: () => void;
  onAddStream?: () => void;
}

export function SubjectsView({
  selectedGradeId,
  onAddSubject,
  onAddStream,
}: SubjectsViewProps = {}) {
  const { config } = useSchoolConfigStore();
  const { data: tenantSubjects = [], isLoading } = useTenantSubjects();
  const queryClient = useQueryClient();
  const { getTeacherForSubject, refetch: refetchSubjectTeachers } =
    useSubjectTeacherMap();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingSubject, setEditingSubject] = useState<TenantSubject | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<DisplaySubject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assignSubject, setAssignSubject] = useState<{
    tenantSubjectIds: string[];
    name: string;
  } | null>(null);

  const filteredSubjects = useMemo(() => {
    let subs = tenantSubjects.map((ts) => ({
      id: ts.id,
      name: ts.subject?.name || ts.customSubject?.name || "Unknown",
      code: ts.subject?.code || ts.customSubject?.code || "",
      subjectType: (ts.subjectType === "core" ? "core" : "elective") as
        | "core"
        | "elective",
      _tenantSubject: ts,
    }));

    if (selectedGradeId && config?.selectedLevels) {
      const level = config.selectedLevels.find((l) =>
        l.gradeLevels?.some((g) => g.id === selectedGradeId),
      );
      if (level) {
        const names = new Set(
          level.subjects.map((s) => s.name.toLowerCase().trim()),
        );
        const codes = new Set(
          level.subjects
            .map((s) => s.code?.toLowerCase().trim())
            .filter(Boolean),
        );
        subs = subs.filter(
          (s) =>
            names.has(s.name.toLowerCase().trim()) ||
            (s.code && codes.has(s.code.toLowerCase().trim())),
        );
      } else {
        subs = [];
      }
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      subs = subs.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q),
      );
    }

    return dedupeSubjectsByMaster(subs).sort((a, b) => {
      if (a.subjectType === "core" && b.subjectType !== "core") return -1;
      if (a.subjectType !== "core" && b.subjectType === "core") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [tenantSubjects, selectedGradeId, config, searchTerm]);

  const coreSubjects = filteredSubjects.filter((s) => s.subjectType === "core");
  const electiveSubjects = filteredSubjects.filter(
    (s) => s.subjectType === "elective",
  );

  const handleDelete = async (subject: DisplaySubject) => {
    setIsDeleting(true);
    try {
      for (const tenantSubjectId of subject.tenantSubjectIds) {
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `mutation DeleteTenantSubject($tenantSubjectId: String!) { deleteTenantSubject(tenantSubjectId: $tenantSubjectId) }`,
            variables: { tenantSubjectId },
          }),
        });
        const data = await res.json();
        if (data.errors) throw new Error(data.errors[0]?.message || "Failed");
      }
      toast.success("Subject removed");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["tenantSubjects"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-9 bg-[#e8f2ef] dark:bg-slate-800 rounded-none animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-11 bg-[#e8f2ef] dark:bg-slate-800 rounded-none animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const toolbarActions: ClassAction[] = [
    onAddSubject && {
      id: "add-subject",
      label: "Add subject",
      icon: Plus,
      onClick: onAddSubject,
    },
    onAddStream && {
      id: "add-stream",
      label: "Add stream",
      icon: Layers,
      onClick: onAddStream,
    },
  ].filter(Boolean) as ClassAction[];

  return (
    <div className="space-y-5">
      {/* Search + filter */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1a4d42]/45" />
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 border-[#1a4d42]/15 bg-white dark:border-white/15 dark:bg-[#0c1a17]"
            />
          </div>
          {toolbarActions.length > 0 && (
            <ClassActionBar
              actions={toolbarActions}
              layout="links"
              className="shrink-0 sm:justify-end"
            />
          )}
        </div>
        <p className="text-xs text-[#1a4d42]/55">
          {filteredSubjects.length} subject
          {filteredSubjects.length !== 1 ? "s" : ""}
          {coreSubjects.length > 0 && electiveSubjects.length > 0
            ? ` · ${coreSubjects.length} core · ${electiveSubjects.length} elective`
            : ""}
        </p>
      </div>

      {filteredSubjects.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-9 w-9 text-[#1a4d42]/30 mx-auto mb-3" />
          <p className="text-sm text-[#1a4d42]/65 dark:text-[#1a4d42]/45">
            No subjects found
          </p>
          <p className="text-xs text-[#1a4d42]/45 mt-1">
            {searchTerm
              ? "Try a different search."
              : "Subjects appear here after school setup."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {coreSubjects.length > 0 && (
              <SubjectSection
                title="Core"
                hint="Required"
                subjects={coreSubjects}
                accent="emerald"
                getTeacherForSubject={getTeacherForSubject}
                onAssignSubject={(s) =>
                  setAssignSubject({
                    tenantSubjectIds: s.tenantSubjectIds,
                    name: s.name,
                  })
                }
                onEdit={setEditingSubject}
                onDelete={setDeleteTarget}
              />
            )}
          {electiveSubjects.length > 0 && (
              <SubjectSection
                title="Elective"
                hint="Optional"
                subjects={electiveSubjects}
                accent="amber"
                getTeacherForSubject={getTeacherForSubject}
                onAssignSubject={(s) =>
                  setAssignSubject({
                    tenantSubjectIds: s.tenantSubjectIds,
                    name: s.name,
                  })
                }
                onEdit={setEditingSubject}
                onDelete={setDeleteTarget}
              />
            )}
        </div>
      )}

      {assignSubject ? (
        <AssignSubjectTeacherSheet
          open={Boolean(assignSubject)}
          onOpenChange={(open) => {
            if (!open) setAssignSubject(null);
          }}
          tenantSubjectIds={assignSubject.tenantSubjectIds}
          subjectName={assignSubject.name}
          onAssigned={() => void refetchSubjectTeachers()}
        />
      ) : null}

      {editingSubject && (
        <EditSubjectDialog
          subject={{
            id: editingSubject.id,
            name:
              editingSubject.subject?.name ||
              editingSubject.customSubject?.name ||
              "Unknown",
            code:
              editingSubject.subject?.code ||
              editingSubject.customSubject?.code ||
              "",
            subjectType: editingSubject.subjectType,
            category:
              editingSubject.subject?.category ||
              editingSubject.customSubject?.category ||
              null,
            department:
              editingSubject.subject?.department ||
              editingSubject.customSubject?.department ||
              null,
            shortName:
              editingSubject.subject?.shortName ||
              editingSubject.customSubject?.shortName ||
              null,
            isCompulsory: editingSubject.isCompulsory,
            totalMarks: editingSubject.totalMarks,
            passingMarks: editingSubject.passingMarks,
            creditHours: editingSubject.creditHours,
            curriculum: editingSubject.curriculum.name,
          }}
          isOpen={!!editingSubject}
          onClose={() => setEditingSubject(null)}
          onSave={() => {
            setEditingSubject(null);
            queryClient.invalidateQueries({ queryKey: ["tenantSubjects"] });
          }}
          tenantSubjectId={editingSubject.id}
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove subject?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.name}&rdquo; will be removed from your
              school. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isDeleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SubjectSection({
  title,
  hint,
  subjects,
  accent,
  getTeacherForSubject,
  onAssignSubject,
  onEdit,
  onDelete,
}: {
  title: string;
  hint: string;
  subjects: DisplaySubject[];
  accent: "emerald" | "amber";
  getTeacherForSubject: (
    tenantSubjectIds: string[],
    meta?: { _tenantSubject: TenantSubject; name: string; code: string },
  ) => string | undefined;
  onAssignSubject: (s: DisplaySubject) => void;
  onEdit: (s: TenantSubject) => void;
  onDelete: (s: DisplaySubject) => void;
}) {
  const dot =
    accent === "emerald" ? "bg-emerald-500" : "bg-amber-400";

  return (
    <section>
      <div className="mb-2 flex items-center gap-1.5 px-0.5">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-none", dot)} />
        <p className="text-xs font-medium text-[#1a4d42]/65 dark:text-[#1a4d42]/30">
          {title} · {hint}
        </p>
        <span className="ml-auto text-[11px] text-[#1a4d42]/45">{subjects.length}</span>
      </div>
      <ul className="overflow-hidden rounded-none border border-[#1a4d42]/12 bg-white dark:divide-slate-800 dark:border-white/10 dark:bg-[#0c1a17]">
          {subjects.map((s) => (
            <li
              key={s.id}
              className="group flex items-center gap-2 border-b border-[#1a4d42]/10 px-3 py-2.5 last:border-b-0 hover:bg-[#f8fbfa] dark:border-white/10 dark:hover:bg-slate-800/40"
            >
              <span
                className="min-w-0 flex-1 truncate text-sm font-medium text-[#0a1f1a] dark:text-white"
                title={s.name}
              >
                {s.name}
              </span>
              <SubjectTeacherBadge
                teacherName={getTeacherForSubject(s.tenantSubjectIds, {
                  _tenantSubject: s._tenantSubject,
                  name: s.name,
                  code: s.code,
                })}
                onAssign={() => onAssignSubject(s)}
              />
              <div className="flex shrink-0 items-center">
                <ClassActionBar
                  layout="icons"
                  actions={[
                    {
                      id: "edit",
                      label: "Edit subject",
                      tooltip: "Edit subject settings",
                      icon: Edit,
                      onClick: () => onEdit(s._tenantSubject),
                    },
                    {
                      id: "remove",
                      label: "Remove subject",
                      tooltip: "Remove subject from school",
                      icon: Trash2,
                      onClick: () => onDelete(s),
                      destructive: true,
                    },
                  ]}
                />
              </div>
            </li>
          ))}
        </ul>
    </section>
  );
}
