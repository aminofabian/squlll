"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetTeachers } from "@/lib/hooks/useTeachers";

type Teacher = {
  id: string;
  name: string;
  department: string;
  subjects: string[];
  status: "active" | "on leave" | "former" | "substitute" | "retired";
};

interface TeachersSearchSidebarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedTeacherId: string | null;
  onTeacherSelect: (teacherId: string) => void;
  displayedTeachersCount: number;
  onLoadMore: () => void;
}

export function TeachersSearchSidebar({
  searchTerm,
  onSearchChange,
  selectedTeacherId,
  onTeacherSelect,
  displayedTeachersCount,
  onLoadMore,
}: TeachersSearchSidebarProps) {
  const { teachers: graphqlTeachers, isLoading, isError, error, refetch } =
    useGetTeachers();

  const teachers: Teacher[] = useMemo(() => {
    if (!graphqlTeachers || !Array.isArray(graphqlTeachers)) return [];

    return graphqlTeachers.map((teacher: {
      id: string;
      fullName?: string;
      firstName?: string;
      lastName?: string;
      department?: string;
      isActive?: boolean;
      user?: { name?: string };
      tenantSubjects?: { name: string }[];
    }) => {
      const name =
        teacher.fullName ||
        (teacher.firstName && teacher.lastName
          ? `${teacher.firstName} ${teacher.lastName}`
          : "") ||
        teacher.user?.name ||
        "Unknown Teacher";

      return {
        id: teacher.id,
        name,
        department: teacher.department || "General",
        subjects: teacher.tenantSubjects?.map((s) => s.name) || [],
        status: teacher.isActive ? "active" : "former",
      };
    });
  }, [graphqlTeachers]);

  const filteredTeachers = useMemo(() => {
    if (!searchTerm.trim()) return teachers;
    const q = searchTerm.toLowerCase();
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q)) ||
        t.id.toLowerCase().includes(q),
    );
  }, [teachers, searchTerm]);

  const visible = filteredTeachers.slice(0, displayedTeachersCount);

  return (
    <div className="flex h-full flex-col pt-2">
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <Input
          type="text"
          placeholder="Search teachers…"
          className="h-9 border-slate-200/80 bg-white pl-8 text-sm dark:border-slate-700 dark:bg-slate-900"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-2 rounded p-0.5 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mb-2 flex items-center justify-between px-0.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Staff
        </p>
        {!isLoading && (
          <span className="text-[11px] tabular-nums text-slate-400">
            {visible.length}/{filteredTeachers.length}
          </span>
        )}
      </div>

      {isError && (
        <div className="mb-3 rounded-lg border border-red-200/80 bg-red-50 p-2.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error instanceof Error ? error.message : "Failed to load"}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-7 w-full border-red-200 text-xs text-red-700"
          >
            Retry
          </Button>
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 py-8 text-sm text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : filteredTeachers.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">
            {searchTerm ? "No matches" : "No teachers yet"}
          </p>
        ) : (
          visible.map((teacher) => (
            <button
              key={teacher.id}
              type="button"
              onClick={() => onTeacherSelect(teacher.id)}
              className={cn(
                "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                teacher.id === selectedTeacherId
                  ? "border-slate-300 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-900"
                  : "border-transparent hover:border-slate-200/80 hover:bg-white/80 dark:hover:border-slate-700 dark:hover:bg-slate-900/60",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    teacher.status === "active"
                      ? "bg-emerald-500"
                      : "bg-slate-300",
                  )}
                />
                <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                  {teacher.name}
                </span>
              </div>
              <p className="mt-0.5 truncate pl-3.5 text-[11px] text-slate-400">
                {teacher.department}
                {teacher.subjects.length > 0 &&
                  ` · ${teacher.subjects.slice(0, 2).join(", ")}`}
              </p>
            </button>
          ))
        )}
      </div>

      {filteredTeachers.length > displayedTeachersCount && (
        <div className="mt-2 shrink-0 border-t border-slate-200/80 pt-2 dark:border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            className="h-7 w-full text-xs text-slate-500 hover:text-slate-700"
          >
            Load more (
            {Math.min(10, filteredTeachers.length - displayedTeachersCount)})
          </Button>
        </div>
      )}
    </div>
  );
}
