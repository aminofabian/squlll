"use client";

import React from "react";
import Link from "next/link";
import { useGradeLevelFeeSummary } from "@/lib/hooks/useGradeLevelFeeSummary";
import { useClassTeacherAssignment } from "@/lib/hooks/useClassTeacherAssignment";
import type { GradeLevel } from "@/lib/types/school-config";
import { cn } from "@/lib/utils";

function formatStreamCount(count: number): string {
  if (count === 0) return "No streams";
  if (count === 1) return "1 stream";
  return `${count} streams`;
}

interface GradeDetailsViewProps {
  grade: GradeLevel;
  selectedStreamId?: string;
  onStreamSelect?: (streamId: string) => void;
  onAssignTeacher?: () => void;
}

export function GradeDetailsView({
  grade,
  selectedStreamId,
  onStreamSelect,
  onAssignTeacher,
}: GradeDetailsViewProps) {
  const { data: feeSummary, isLoading: studentsLoading } =
    useGradeLevelFeeSummary(grade.id);

  const { data: classTeacher, isLoading: teacherLoading } =
    useClassTeacherAssignment(
      selectedStreamId ? null : grade.id,
      selectedStreamId || null,
    );

  const studentCount = feeSummary?.totalStudents || 0;
  const showStudentNudge = !studentsLoading && studentCount === 0;
  const showTeacherNudge = !teacherLoading && !classTeacher;
  const teacherLabel = selectedStreamId ? "Stream teacher" : "Class teacher";

  const statItems = [
    {
      label: "Students",
      value: studentsLoading ? "—" : String(studentCount),
      emptyKind: showStudentNudge ? ("students" as const) : null,
    },
    {
      label: teacherLabel,
      value: teacherLoading
        ? "—"
        : classTeacher?.teacher.fullName || "—",
      emptyKind: showTeacherNudge ? ("teacher" as const) : null,
    },
    {
      label: "Streams",
      value: selectedStreamId
        ? "1 stream"
        : formatStreamCount(grade.streams?.length || 0),
      emptyKind: null,
    },
    {
      label: "Fees owed",
      value: studentsLoading
        ? "—"
        : `KES ${(feeSummary?.totalFeesOwed || 0).toLocaleString()}`,
      emptyKind: null,
    },
    {
      label: "Fees paid",
      value: studentsLoading
        ? "—"
        : `KES ${(feeSummary?.totalFeesPaid || 0).toLocaleString()}`,
      emptyKind: null,
    },
  ];

  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40"
      role="group"
      aria-label="Grade statistics"
    >
      <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 dark:divide-slate-800 lg:grid-cols-5">
        {statItems.map(({ label, value, emptyKind }) => (
          <div key={label} className="px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {label}
            </p>
            {emptyKind === "students" ? (
              <div className="mt-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No students enrolled yet.
                </p>
                <Link
                  href="/students?action=add"
                  className="mt-1 inline-flex text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Add students →
                </Link>
              </div>
            ) : emptyKind === "teacher" ? (
              <div className="mt-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedStreamId
                    ? "No stream teacher assigned."
                    : "No class teacher assigned."}
                </p>
                {onAssignTeacher ? (
                  <button
                    type="button"
                    onClick={onAssignTeacher}
                    className="mt-1 inline-flex text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    Assign teacher →
                  </button>
                ) : (
                  <Link
                    href="/teachers?action=add"
                    className="mt-1 inline-flex text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    Add teachers →
                  </Link>
                )}
              </div>
            ) : (
              <p
                className={cn(
                  "mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100",
                  label !== "Streams" &&
                    label !== teacherLabel &&
                    (studentsLoading || teacherLoading) &&
                    "animate-pulse",
                  (label === teacherLabel || label === "Students") &&
                    "truncate",
                  (label === "Fees owed" || label === "Fees paid") &&
                    "tabular-nums",
                )}
              >
                {value}
              </p>
            )}
          </div>
        ))}
      </div>

      {!selectedStreamId && grade.streams && grade.streams.length > 0 && (
        <div className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Streams
          </p>
          <div className="flex flex-wrap gap-1.5">
            {grade.streams.map((stream) => (
              <button
                key={stream.id}
                type="button"
                onClick={() => onStreamSelect?.(stream.id)}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
              >
                {stream.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
