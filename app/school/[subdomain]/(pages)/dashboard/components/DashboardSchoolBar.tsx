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
}

type EmptyKind = "students" | "teachers" | "streams";

export function DashboardSchoolBar({
  studentCount,
  teacherCount,
  streamCount,
  attendanceRate,
  academicProgress,
  isLoading,
}: DashboardSchoolBarProps) {
  const hasStudents = studentCount > 0;
  const resolvedTeachers = teacherCount ?? 0;
  const resolvedStreams = streamCount ?? 0;

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40">
        <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white px-4 py-3 dark:bg-slate-900/40">
              <div className="h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="mt-2 h-4 w-20 animate-pulse rounded bg-slate-50 dark:bg-slate-800/60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statItems: Array<{
    label: string;
    value: string;
    emptyKind: EmptyKind | null;
  }> = [
    {
      label: "Students",
      value: String(studentCount),
      emptyKind: hasStudents ? null : "students",
    },
    {
      label: "Teachers",
      value: String(resolvedTeachers),
      emptyKind: resolvedTeachers > 0 ? null : "teachers",
    },
    {
      label: "Streams",
      value: String(resolvedStreams),
      emptyKind: resolvedStreams > 0 ? null : "streams",
    },
    {
      label: "Attendance",
      value:
        hasStudents && attendanceRate != null ? `${attendanceRate}%` : "—",
      emptyKind: null,
    },
    {
      label: "Progress",
      value:
        hasStudents && academicProgress != null
          ? `${academicProgress}%`
          : "—",
      emptyKind: null,
    },
  ];

  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40"
      role="group"
      aria-label="School statistics"
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
            ) : emptyKind === "teachers" ? (
              <div className="mt-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No teachers added yet.
                </p>
                <Link
                  href="/teachers?action=add"
                  className="mt-1 inline-flex text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Add teachers →
                </Link>
              </div>
            ) : emptyKind === "streams" ? (
              <div className="mt-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No classes set up yet.
                </p>
                <Link
                  href="/classes"
                  className="mt-1 inline-flex text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Set up classes →
                </Link>
              </div>
            ) : label === "Attendance" && hasStudents && attendanceRate == null ? (
              <div className="mt-1">
                <Link
                  href="/attendance"
                  className="inline-flex text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Mark attendance →
                </Link>
              </div>
            ) : (
              <p
                className={cn(
                  "mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100",
                  (label === "Attendance" || label === "Progress") &&
                    value === "—" &&
                    "text-slate-400",
                  (label === "Attendance" || label === "Progress") &&
                    value !== "—" &&
                    "tabular-nums",
                )}
              >
                {value}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
