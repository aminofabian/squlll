"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetTeachers } from "@/lib/hooks/useTeachers";
import { TeacherAvatar } from "./TeacherAvatar";

type Teacher = {
  id: string;
  name: string;
  department: string;
  subjects: string[];
  status: "active" | "inactive" | "on leave" | "former" | "substitute" | "retired";
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
        status: teacher.isActive ? "active" : "inactive",
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
  const activeCount = teachers.filter((t) => t.status === "active").length;

  return (
    <div className="flex h-full flex-col pt-2">
      <div className="relative mb-2.5">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#1a4d42]/40" />
        <Input
          type="text"
          placeholder="Search by name, dept…"
          className="h-9 rounded-none border border-[#1a4d42]/15 bg-white pl-8 text-sm shadow-none placeholder:text-[#1a4d42]/40 focus-visible:border-[#246a59]/50 focus-visible:ring-[#246a59]/20 dark:border-white/15 dark:bg-[#0c1a17]"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-2 rounded-none p-0.5 text-[#1a4d42]/40 hover:text-[#0a1f1a]"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mb-2.5 rounded-none border border-[#1a4d42]/10 bg-[#f8fbfa] px-2.5 py-2 dark:border-white/10 dark:bg-[#071411]">
        <p className="text-[10px] font-medium uppercase tracking-wide text-[#1a4d42]/45">
          Directory
        </p>
        <p className="mt-0.5 text-xs text-[#1a4d42]/60 dark:text-white/55">
          <span className="font-semibold text-[#0a1f1a] dark:text-white">
            {teachers.length}
          </span>{" "}
          staff ·{" "}
          <span className="text-[#246a59]">{activeCount} active</span>
        </p>
      </div>

      {isError && (
        <div className="mb-2.5 rounded-none border border-red-200/80 bg-red-50 p-2.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error instanceof Error ? error.message : "Failed to load"}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-7 w-full rounded-none border-red-200 text-xs text-red-700"
          >
            Retry
          </Button>
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 py-8 text-sm text-[#1a4d42]/45">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : filteredTeachers.length === 0 ? (
          <p className="py-8 text-center text-xs text-[#1a4d42]/45">
            {searchTerm ? "No matches" : "No teachers yet"}
          </p>
        ) : (
          visible.map((teacher) => {
            const isSelected = teacher.id === selectedTeacherId;
            return (
              <button
                key={teacher.id}
                type="button"
                onClick={() => onTeacherSelect(teacher.id)}
                className={cn(
                  "w-full rounded-none border px-2.5 py-2 text-left transition-colors",
                  isSelected
                    ? "border-[#246a59]/25 bg-[#246a59]/10 dark:bg-[#246a59]/15"
                    : "border-transparent hover:border-[#1a4d42]/10 hover:bg-white dark:hover:bg-white/5",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <TeacherAvatar name={teacher.name} size="sm" ring={isSelected} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-[#0a1f1a] dark:text-white">
                        {teacher.name}
                      </span>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-none",
                          teacher.status === "active"
                            ? "bg-[#246a59]"
                            : "bg-amber-400",
                        )}
                      />
                    </div>
                    <p className="truncate text-[11px] capitalize text-[#1a4d42]/45">
                      {teacher.department}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {filteredTeachers.length > displayedTeachersCount && (
        <div className="mt-2 shrink-0 border-t border-[#1a4d42]/10 pt-2 dark:border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            className="h-7 w-full rounded-none text-xs text-[#1a4d42]/55 hover:bg-[#e8f2ef] hover:text-[#0a1f1a]"
          >
            Show more (
            {Math.min(10, filteredTeachers.length - displayedTeachersCount)})
          </Button>
        </div>
      )}
    </div>
  );
}
