"use client";

import React from "react";
import Link from "next/link";
import { useGradeLevelFeeSummary } from "@/lib/hooks/useGradeLevelFeeSummary";
import { useClassTeacherAssignment } from "@/lib/hooks/useClassTeacherAssignment";
import type { GradeLevel } from "@/lib/types/school-config";
import { cn } from "@/lib/utils";

function formatStreamCount(count: number): string {
  if (count === 0) return "0";
  if (count === 1) return "1";
  return String(count);
}

interface GradeDetailsViewProps {
  grade: GradeLevel;
  selectedStreamId?: string;
  onStreamSelect?: (streamId: string) => void;
  onAssignTeacher?: () => void;
}

function StatCell({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[3.25rem] flex-col justify-center rounded-md bg-slate-50/80 px-2 py-1.5 dark:bg-slate-800/30",
        className,
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
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
  const feesOwed = feeSummary?.totalFeesOwed || 0;
  const feesPaid = feeSummary?.totalFeesPaid || 0;

  return (
    <div className="space-y-2" role="group" aria-label="Grade statistics">
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
        <StatCell label="Students">
          {showStudentNudge ? (
            <Link
              href="/students?action=add"
              className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
            >
              Add →
            </Link>
          ) : (
            <p className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
              {studentsLoading ? "—" : studentCount}
            </p>
          )}
        </StatCell>

        <StatCell label={teacherLabel}>
          {showTeacherNudge ? (
            onAssignTeacher ? (
              <button
                type="button"
                onClick={onAssignTeacher}
                className="text-left text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
              >
                Assign →
              </button>
            ) : (
              <Link
                href="/teachers?action=add"
                className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
              >
                Add →
              </Link>
            )
          ) : (
            <p
              className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100"
              title={classTeacher?.teacher.fullName}
            >
              {teacherLoading ? "—" : classTeacher?.teacher.fullName}
            </p>
          )}
        </StatCell>

        <StatCell label="Streams">
          <p className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
            {selectedStreamId
              ? "1"
              : formatStreamCount(grade.streams?.length || 0)}
          </p>
        </StatCell>

        <StatCell label="Fees owed" className="hidden sm:flex">
          <p className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
            {studentsLoading ? "—" : `KES ${feesOwed.toLocaleString()}`}
          </p>
        </StatCell>

        <StatCell label="Fees paid" className="hidden sm:flex">
          <p className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
            {studentsLoading ? "—" : `KES ${feesPaid.toLocaleString()}`}
          </p>
        </StatCell>
      </div>

      {!selectedStreamId && grade.streams && grade.streams.length > 0 ? (
        <div className="rounded-lg border border-slate-200/80 bg-white px-2.5 py-2 dark:border-slate-700 dark:bg-slate-900/40">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Streams
          </p>
          <div className="flex flex-wrap gap-1.5">
            {grade.streams.map((stream) => (
              <button
                key={stream.id}
                type="button"
                onClick={() => onStreamSelect?.(stream.id)}
                className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {stream.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
