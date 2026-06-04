"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronLeft, ChevronRight, GraduationCap, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { studentsEnrollLinkLg, studentsPanel, studentsTh } from "./students-ui";

export interface StudentRow {
  id: string;
  name: string;
  admissionNumber: string;
  grade: string;
  gradeId?: string;
  stream: string;
  streamId?: string | null;
  missingStream?: boolean;
  status: string;
  createdAt?: string;
}

interface StudentsTableProps {
  students: StudentRow[];
  isLoading?: boolean;
  onStudentClick?: (studentId: string) => void;
  onAssignClass?: (student: StudentRow) => void;
  title?: string;
  description?: string;
  hideGradeColumn?: boolean;
  emptyMessage?: string;
  showAddAction?: boolean;
}

const PAGE_SIZE = 15;

function statusBadge(status: string) {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export function StudentsTable({
  students,
  isLoading,
  onStudentClick,
  onAssignClass,
  title = "All students",
  description,
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

  const missingClassCount = students.filter((s) => s.missingStream).length;

  useEffect(() => {
    setPage(1);
  }, [students.length]);

  const defaultDescription =
    students.length === 0
      ? emptyMessage
      : `Click a row to view full profile · ${students.length} shown`;

  if (isLoading) {
    return (
      <div className={studentsPanel}>
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
    <div className={studentsPanel}>
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          {description ?? defaultDescription}
        </p>
      </div>

      {students.length === 0 ? (
        <div className="px-4 py-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <User className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {emptyMessage}
          </p>
          {showAddAction ? (
            <Link href="/students?action=add" className={cn(studentsEnrollLinkLg, "mt-4")}>
              Enroll student
              <ArrowRight className="h-3 w-3 text-white/70" />
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left dark:border-slate-800 dark:bg-slate-900/60">
                  <th className={cn(studentsTh, "w-10")}>#</th>
                  <th className={studentsTh}>Student</th>
                  <th className={cn(studentsTh, "hidden sm:table-cell")}>
                    Admission
                  </th>
                  {!hideGradeColumn ? (
                    <th className={studentsTh}>Grade</th>
                  ) : null}
                  <th className={cn(studentsTh, "hidden md:table-cell")}>
                    Stream
                  </th>
                  <th className={studentsTh}>Status</th>
                  {onAssignClass ? (
                    <th className={studentsTh}>Class</th>
                  ) : null}
                  <th className={cn(studentsTh, "w-10")} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginated.map((student, index) => (
                  <tr
                    key={student.id}
                    className={cn(
                      "group cursor-pointer text-slate-700 transition-colors hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40",
                      student.missingStream &&
                        "bg-amber-50/30 dark:bg-amber-950/10",
                    )}
                    onClick={() => onStudentClick?.(student.id)}
                  >
                    <td className="px-4 py-3 text-xs tabular-nums text-slate-400">
                      {(safePage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                        {student.name}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-slate-500 sm:table-cell">
                      {student.admissionNumber}
                    </td>
                    {!hideGradeColumn ? (
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                        {student.grade}
                      </td>
                    ) : null}
                    <td className="hidden px-4 py-3 text-xs md:table-cell">
                      <span
                        className={cn(
                          student.missingStream
                            ? "font-medium text-amber-700 dark:text-amber-400"
                            : "text-slate-500",
                        )}
                      >
                        {student.stream}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-normal capitalize",
                          statusBadge(student.status),
                        )}
                      >
                        {student.status}
                      </Badge>
                    </td>
                    {onAssignClass ? (
                      <td className="px-4 py-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 rounded-md bg-transparent px-2 text-xs text-slate-600 hover:bg-slate-100/80 hover:text-primary dark:hover:bg-slate-800/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssignClass(student);
                          }}
                        >
                          <GraduationCap className="h-3.5 w-3.5" />
                          {student.missingStream ? "Assign" : "Change"}
                        </Button>
                      </td>
                    ) : null}
                    <td className="px-2 py-3">
                      <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {missingClassCount > 0 ? (
            <div className="flex items-center gap-2 border-t border-amber-100 bg-amber-50/50 px-4 py-2.5 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
              {missingClassCount} student
              {missingClassCount !== 1 ? "s need" : " needs"} a class or stream
              assignment.
            </div>
          ) : null}

          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
                className="h-8 rounded-md text-xs text-slate-500 hover:bg-slate-100/80 dark:hover:bg-slate-800/50"
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
                className="h-8 rounded-md text-xs text-slate-500 hover:bg-slate-100/80 dark:hover:bg-slate-800/50"
              >
                Next
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
