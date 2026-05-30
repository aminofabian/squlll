"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StudentRow {
  id: string;
  name: string;
  admissionNumber: string;
  grade: string;
  stream: string;
  status: string;
}

interface StudentsTableProps {
  students: StudentRow[];
  isLoading?: boolean;
  onStudentClick?: (studentId: string) => void;
  title?: string;
  description?: string;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  hideGradeColumn?: boolean;
  emptyMessage?: string;
  showAddAction?: boolean;
}

const PAGE_SIZE = 15;

export function StudentsTable({
  students,
  isLoading,
  onStudentClick,
  title = "All students",
  description,
  searchTerm = "",
  onSearchChange,
  hideGradeColumn = false,
  emptyMessage = "No students yet",
  showAddAction = false,
}: StudentsTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = students.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [students.length, searchTerm]);

  const defaultDescription =
    students.length === 0
      ? emptyMessage
      : `Showing ${paginated.length} of ${students.length}`;

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40">
        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded-lg bg-slate-50 dark:bg-slate-800/60"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {description ?? defaultDescription}
          </p>
        </div>
        {onSearchChange && (
          <div className="relative w-full shrink-0 sm:w-52">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search students…"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
        )}
      </div>

      {students.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-slate-500">{emptyMessage}</p>
          {showAddAction && (
            <Link
              href="/students?action=add"
              className="mt-3 inline-flex text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
            >
              Add student →
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left dark:border-slate-800 dark:bg-slate-900/60">
                  <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Name
                  </th>
                  <th className="hidden px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:table-cell">
                    Admission
                  </th>
                  {!hideGradeColumn && (
                    <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Grade
                    </th>
                  )}
                  <th className="hidden px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400 md:table-cell">
                    Stream
                  </th>
                  <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginated.map((student) => (
                  <tr
                    key={student.id}
                    className={cn(
                      "text-slate-700 dark:text-slate-300",
                      onStudentClick &&
                        "cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
                    )}
                    onClick={() => onStudentClick?.(student.id)}
                  >
                    <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-100">
                      {student.name}
                    </td>
                    <td className="hidden px-4 py-2.5 text-xs text-slate-500 sm:table-cell">
                      {student.admissionNumber}
                    </td>
                    {!hideGradeColumn && (
                      <td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">
                        {student.grade}
                      </td>
                    )}
                    <td className="hidden px-4 py-2.5 text-xs text-slate-500 md:table-cell">
                      {student.stream}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "text-xs capitalize",
                          student.status === "active"
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-slate-400",
                        )}
                      >
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
                className="h-8 text-xs text-slate-500"
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                Previous
              </Button>
              <span className="text-xs text-slate-400">
                Page {safePage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
                className="h-8 text-xs text-slate-500"
              >
                Next
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
