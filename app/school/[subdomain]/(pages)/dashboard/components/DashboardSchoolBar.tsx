"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardSchoolBarProps {
  studentCount: number;
  teacherCount?: number;
  streamCount?: number;
  attendanceRate?: number | null;
  academicProgress?: number | null;
  isLoading?: boolean;
  compact?: boolean;
}

type EmptyKind = "students" | "teachers" | "streams";

function StatCell({
  label,
  value,
  emptyKind,
  hasStudents,
  attendanceRate,
  compact,
}: {
  label: string;
  value: string;
  emptyKind: EmptyKind | null;
  hasStudents: boolean;
  attendanceRate?: number | null;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center rounded-md bg-slate-50/80 px-2 py-1.5 dark:bg-slate-800/30",
        compact ? "min-h-[3.25rem]" : "px-3 py-2.5",
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      {emptyKind === "students" ? (
        <Link
          href="/students?action=add"
          className="mt-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
        >
          Add →
        </Link>
      ) : emptyKind === "teachers" ? (
        <Link
          href="/teachers?action=add"
          className="mt-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
        >
          Add →
        </Link>
      ) : emptyKind === "streams" ? (
        <Link
          href="/classes"
          className="mt-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
        >
          Set up →
        </Link>
      ) : label === "Attendance" && hasStudents && attendanceRate == null ? (
        <Link
          href="/attendance"
          className="mt-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
        >
          Mark →
        </Link>
      ) : (
        <p
          className={cn(
            "mt-0.5 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100",
            value === "—" && "text-base font-normal text-slate-400",
          )}
        >
          {value}
        </p>
      )}
    </div>
  );
}

export function DashboardSchoolBar({
  studentCount,
  teacherCount,
  streamCount,
  attendanceRate,
  academicProgress,
  isLoading,
  compact = false,
}: DashboardSchoolBarProps) {
  const hasStudents = studentCount > 0;
  const resolvedTeachers = teacherCount ?? 0;
  const resolvedStreams = streamCount ?? 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
        {Array.from({ length: compact ? 3 : 5 }).map((_, index) => (
          <div
            key={index}
            className="h-[3.25rem] animate-pulse rounded-md bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
    );
  }

  const primaryStats = [
    {
      label: "Students",
      value: String(studentCount),
      emptyKind: (hasStudents ? null : "students") as EmptyKind | null,
    },
    {
      label: "Teachers",
      value: String(resolvedTeachers),
      emptyKind: (resolvedTeachers > 0 ? null : "teachers") as EmptyKind | null,
    },
    {
      label: "Streams",
      value: String(resolvedStreams),
      emptyKind: (resolvedStreams > 0 ? null : "streams") as EmptyKind | null,
    },
  ];

  const secondaryStats = [
    {
      label: "Attendance",
      value:
        hasStudents && attendanceRate != null ? `${attendanceRate}%` : "—",
      emptyKind: null as EmptyKind | null,
    },
    {
      label: "Progress",
      value:
        hasStudents && academicProgress != null
          ? `${academicProgress}%`
          : "—",
      emptyKind: null as EmptyKind | null,
    },
  ];

  const stats = compact ? primaryStats : [...primaryStats, ...secondaryStats];

  return (
    <div
      className={cn(
        "grid gap-1.5",
        compact ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-5",
      )}
      role="group"
      aria-label="School statistics"
    >
      {stats.map(({ label, value, emptyKind }) => (
        <StatCell
          key={label}
          label={label}
          value={value}
          emptyKind={emptyKind}
          hasStudents={hasStudents}
          attendanceRate={attendanceRate}
          compact={compact}
        />
      ))}
    </div>
  );
}
