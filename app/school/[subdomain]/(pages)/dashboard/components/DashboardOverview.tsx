"use client";

import { useMemo } from "react";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import { cn } from "@/lib/utils";

interface StudentLike {
  grade?: {
    gradeLevel?: { id?: string; name?: string };
  } | string;
}

interface DashboardOverviewProps {
  config: SchoolConfiguration | null;
  students: StudentLike[];
  isLoading?: boolean;
}

function formatStreamCount(count: number): string {
  if (count === 0) return "No streams";
  if (count === 1) return "1 stream";
  return `${count} streams`;
}

export function DashboardOverview({
  config,
  students,
  isLoading,
}: DashboardOverviewProps) {
  const studentCountByGradeId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const student of students) {
      if (typeof student.grade === "string" || !student.grade?.gradeLevel?.id) {
        continue;
      }
      const id = student.grade.gradeLevel.id;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
  }, [students]);

  const rows = useMemo(() => {
    if (!config?.selectedLevels) return [];
    return config.selectedLevels.flatMap((level) => {
      const grades = level.gradeLevels ?? [];
      if (grades.length === 0) {
        return [
          {
            levelId: level.id,
            levelName: level.name,
            gradeId: `${level.id}-empty`,
            gradeName: "—",
            streamCount: 0,
            studentCount: 0,
            isFirstInLevel: true,
            levelGradeCount: 0,
          },
        ];
      }
      return grades.map((grade, index) => ({
        levelId: level.id,
        levelName: level.name,
        gradeId: grade.id,
        gradeName: grade.name,
        streamCount: grade.streams?.length ?? 0,
        studentCount: studentCountByGradeId.get(grade.id) ?? 0,
        isFirstInLevel: index === 0,
        levelGradeCount: grades.length,
      }));
    });
  }, [config?.selectedLevels, studentCountByGradeId]);

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

  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40">
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
          Levels at a glance
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Select a grade in the sidebar to view activity and performance.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left dark:border-slate-800 dark:bg-slate-900/60">
              <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Level
              </th>
              <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Grade
              </th>
              <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Streams
              </th>
              <th className="hidden px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:table-cell">
                Students
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr
                key={`${row.levelId}-${row.gradeId}`}
                className="text-slate-700 dark:text-slate-300"
              >
                <td className="px-4 py-2.5 align-top">
                  {row.isFirstInLevel ? (
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {row.levelName}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-400">
                        {row.levelGradeCount} grade
                        {row.levelGradeCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-100">
                  {row.gradeName}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "text-xs",
                      row.streamCount > 0
                        ? "text-slate-600 dark:text-slate-400"
                        : "text-slate-400",
                    )}
                  >
                    {formatStreamCount(row.streamCount)}
                  </span>
                </td>
                <td className="hidden px-4 py-2.5 text-xs tabular-nums text-slate-500 sm:table-cell">
                  {row.studentCount > 0 ? row.studentCount : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
