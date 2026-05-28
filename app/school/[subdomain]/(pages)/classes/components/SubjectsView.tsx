"use client";

import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Edit, Trash2, X, Loader2 } from "lucide-react";
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

// ─── Helpers ───────────────────────────────────────────────────

function abbreviateGrade(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("baby") || lower.includes("pg")) return "PG";
  if (lower.includes("pp1")) return "PP1";
  if (lower.includes("pp2")) return "PP2";
  const gm = name.match(/grade\s*(\d+)/i);
  if (gm) return `G${gm[1]}`;
  const fm = name.match(/form\s*(\d+)/i);
  if (fm) return `F${fm[1]}`;
  return name.length <= 4
    ? name.toUpperCase()
    : name.substring(0, 4).toUpperCase();
}

function gradePriority(name: string): number {
  const lower = name.toLowerCase();
  if (lower.includes("baby") || lower.includes("pg")) return 1;
  if (lower.includes("pp1")) return 2;
  if (lower.includes("pp2")) return 3;
  const gm = name.match(/grade\s*(\d+)/i);
  if (gm) {
    const n = parseInt(gm[1]);
    return n <= 6 ? 10 + n : 20 + n;
  }
  const fm = name.match(/form\s*(\d+)/i);
  if (fm) return 20 + parseInt(fm[1]) + 6;
  return 999;
}

// ─── Component ─────────────────────────────────────────────────

interface SubjectsViewProps {
  selectedGradeId?: string | null;
}

export function SubjectsView({ selectedGradeId }: SubjectsViewProps = {}) {
  const { config, getAllGradeLevels } = useSchoolConfigStore();
  const { data: tenantSubjects = [], isLoading } = useTenantSubjects();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "core" | "elective">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [gradeFilter, setGradeFilter] = useState<string | null>(
    selectedGradeId || null,
  );
  const [editingSubject, setEditingSubject] = useState<TenantSubject | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<TenantSubject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sorted grades
  const allGrades = useMemo(() => {
    return getAllGradeLevels()
      .flatMap((level) =>
        level.grades.map((grade) => ({
          id: grade.id,
          name: grade.name,
          abbreviated: abbreviateGrade(grade.name),
          priority: gradePriority(grade.name),
        })),
      )
      .sort((a, b) => a.priority - b.priority);
  }, [getAllGradeLevels]);

  // Filtered subjects
  const filteredSubjects = useMemo(() => {
    let subs = tenantSubjects.map((ts) => ({
      ...ts,
      name: ts.subject?.name || ts.customSubject?.name || "Unknown",
      code: ts.subject?.code || ts.customSubject?.code || "",
      department: ts.subject?.department || ts.customSubject?.department || "",
    }));

    // Grade filter
    const gid = gradeFilter || selectedGradeId;
    if (gid && config?.selectedLevels) {
      const level = config.selectedLevels.find((l) =>
        l.gradeLevels?.some((g) => g.id === gid),
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

    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      subs = subs.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q),
      );
    }

    // Type / Status
    if (typeFilter === "core")
      subs = subs.filter((s) => s.subjectType === "core");
    if (typeFilter === "elective")
      subs = subs.filter((s) => s.subjectType === "elective");
    if (statusFilter === "active") subs = subs.filter((s) => s.isActive);
    if (statusFilter === "inactive") subs = subs.filter((s) => !s.isActive);

    return subs.sort((a, b) => {
      if (a.subjectType === "core" && b.subjectType !== "core") return -1;
      if (a.subjectType !== "core" && b.subjectType === "core") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [
    tenantSubjects,
    gradeFilter,
    selectedGradeId,
    config,
    searchTerm,
    typeFilter,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    const f = filteredSubjects;
    return {
      total: f.length,
      core: f.filter((s) => s.subjectType === "core").length,
      elective: f.filter((s) => s.subjectType === "elective").length,
      active: f.filter((s) => s.isActive).length,
      inactive: f.filter((s) => !s.isActive).length,
    };
  }, [filteredSubjects]);

  const hasFilters =
    searchTerm || typeFilter !== "all" || statusFilter !== "all" || gradeFilter;

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setGradeFilter(null);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation DeleteTenantSubject($tenantSubjectId: String!) { deleteTenantSubject(tenantSubjectId: $tenantSubjectId) }`,
          variables: { tenantSubjectId: id },
        }),
      });
      const data = await res.json();
      if (data.errors) throw new Error(data.errors[0]?.message || "Failed");
      toast.success("Subject deleted");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["tenantSubjects"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"
            />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-14 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Grade chips */}
        <div className="flex flex-wrap gap-1">
          <FilterChip
            active={gradeFilter === null}
            onClick={() => setGradeFilter(null)}
          >
            All Grades
          </FilterChip>
          {allGrades.map((g) => (
            <FilterChip
              key={g.id}
              active={gradeFilter === g.id}
              onClick={() => setGradeFilter(g.id)}
            >
              {g.abbreviated}
            </FilterChip>
          ))}
        </div>

        {/* Type + Status */}
        <div className="flex flex-wrap gap-1">
          <FilterChip
            active={typeFilter === "all"}
            onClick={() => setTypeFilter("all")}
          >
            All
          </FilterChip>
          <FilterChip
            active={typeFilter === "core"}
            onClick={() => setTypeFilter("core")}
          >
            Core
          </FilterChip>
          <FilterChip
            active={typeFilter === "elective"}
            onClick={() => setTypeFilter("elective")}
          >
            Elective
          </FilterChip>
          <span className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />
          <FilterChip
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
            variant="default"
          >
            All Status
          </FilterChip>
          <FilterChip
            active={statusFilter === "active"}
            onClick={() => setStatusFilter("active")}
            variant="success"
          >
            Active
          </FilterChip>
          <FilterChip
            active={statusFilter === "inactive"}
            onClick={() => setStatusFilter("inactive")}
            variant="danger"
          >
            Inactive
          </FilterChip>
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="flex items-center gap-1.5">
            {searchTerm && (
              <FilterBadge
                label={`"${searchTerm}"`}
                onRemove={() => setSearchTerm("")}
              />
            )}
            {typeFilter !== "all" && (
              <FilterBadge
                label={typeFilter}
                onRemove={() => setTypeFilter("all")}
              />
            )}
            {statusFilter !== "all" && (
              <FilterBadge
                label={statusFilter}
                onRemove={() => setStatusFilter("all")}
              />
            )}
            {gradeFilter && (
              <FilterBadge
                label={
                  allGrades.find((g) => g.id === gradeFilter)?.name || "Grade"
                }
                onRemove={() => setGradeFilter(null)}
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        <StatBadge label="Total" value={stats.total} />
        <StatBadge label="Core" value={stats.core} />
        <StatBadge label="Elective" value={stats.elective} />
        <StatBadge label="Active" value={stats.active} variant="success" />
        <StatBadge label="Inactive" value={stats.inactive} variant="danger" />
      </div>

      {/* Table */}
      {filteredSubjects.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">
            No subjects found
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {hasFilters
              ? "Try adjusting your filters."
              : "No subjects configured yet."}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Subject
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Code
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Department
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 w-[80px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSubjects.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                  onClick={() => setEditingSubject(s)}
                >
                  <td className="px-4 py-2.5 font-medium">{s.name}</td>
                  <td className="px-4 py-2.5">
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {s.code || "—"}
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">
                    {s.department || "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <Badge
                        variant={s.isActive ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {s.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {s.isCompulsory && (
                        <Badge variant="outline" className="text-[10px]">
                          Required
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSubject(s);
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      >
                        <Edit className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(s);
                        }}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Dialog */}
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

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &ldquo;
              {deleteTarget?.subject?.name || deleteTarget?.customSubject?.name}
              &rdquo;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
              disabled={isDeleting}
              className="bg-red-600"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function FilterChip({
  active,
  onClick,
  children,
  variant = "default",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "success" | "danger";
}) {
  const activeClass =
    variant === "success"
      ? "bg-emerald-600 text-white border-emerald-600"
      : variant === "danger"
        ? "bg-red-600 text-white border-red-600"
        : "bg-primary text-white border-primary";
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
        active
          ? activeClass
          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function FilterBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

function StatBadge({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: number;
  variant?: "default" | "success" | "danger";
}) {
  const colors =
    variant === "success"
      ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700"
      : variant === "danger"
        ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-red-700"
        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700";
  return (
    <div className={`border rounded-lg p-2 text-center ${colors}`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide">{label}</div>
    </div>
  );
}
