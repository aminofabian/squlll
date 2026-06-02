"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentRow } from "./StudentsTable";
import {
  studentsDirectoryMeta,
  studentsGhostButton,
  studentsSearchClearBtn,
  studentsSearchInput,
  studentsSidebarItem,
} from "./students-ui";

interface StudentsDirectorySidebarProps {
  students: StudentRow[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedStudentId: string | null;
  onStudentSelect: (studentId: string) => void;
  displayedStudentsCount: number;
  onLoadMore: () => void;
  isLoading?: boolean;
}

function StudentInitials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200/60 text-[11px] font-semibold text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
      {initials || "?"}
    </div>
  );
}

export function StudentsDirectorySidebar({
  students,
  searchTerm,
  onSearchChange,
  selectedStudentId,
  onStudentSelect,
  displayedStudentsCount,
  onLoadMore,
  isLoading = false,
}: StudentsDirectorySidebarProps) {
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const q = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        s.grade.toLowerCase().includes(q),
    );
  }, [students, searchTerm]);

  const visible = filtered.slice(0, displayedStudentsCount);
  const activeCount = students.filter((s) => s.status === "active").length;

  return (
    <div className="flex min-h-0 flex-1 flex-col pt-1">
      <div className="relative mb-3 shrink-0">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search name or admission…"
          className={studentsSearchInput}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          autoComplete="off"
          aria-label="Search students"
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className={studentsSearchClearBtn}
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <div className={studentsDirectoryMeta}>
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Directory
        </p>
        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {students.length}
          </span>{" "}
          students ·{" "}
          <span className="text-primary">
            {activeCount} active
          </span>
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-0.5">
        {isLoading ? (
          <p className="py-8 text-center text-xs text-slate-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center">
            <User className="mx-auto mb-2 h-5 w-5 text-slate-300 dark:text-slate-600" />
            <p className="text-xs text-slate-400">
              {searchTerm ? "No matches" : "No students in this view"}
            </p>
          </div>
        ) : (
          visible.map((student) => {
            const isSelected = student.id === selectedStudentId;
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => onStudentSelect(student.id)}
                className={studentsSidebarItem(
                  isSelected,
                  student.missingStream,
                )}
              >
                <div className="flex items-center gap-2.5">
                  <StudentInitials name={student.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {student.name}
                      </span>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          student.status === "active"
                            ? "bg-emerald-500"
                            : "bg-amber-400",
                        )}
                      />
                    </div>
                    <p className="truncate text-[11px] text-slate-400">
                      {student.grade}
                      {student.admissionNumber
                        ? ` · ${student.admissionNumber}`
                        : ""}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {filtered.length > displayedStudentsCount ? (
        <div className="mt-2 shrink-0 border-t border-slate-200/40 pt-2 dark:border-slate-800/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            className={studentsGhostButton}
          >
            Show more (
            {Math.min(10, filtered.length - displayedStudentsCount)})
          </Button>
        </div>
      ) : null}
    </div>
  );
}
