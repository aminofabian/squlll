"use client";

import React, { useMemo } from "react";
import type { Level } from "@/lib/types/school-config";
import { cn } from "@/lib/utils";

interface ClassesOverviewProps {
  levels: Level[];
  isLoading?: boolean;
}

function formatStreamCount(count: number): string {
  if (count === 0) return "No streams";
  if (count === 1) return "1 stream";
  return `${count} streams`;
}

export function ClassesOverview({ levels, isLoading }: ClassesOverviewProps) {
  const rows = useMemo(() => {
    return levels.flatMap((level) => {
      const grades = level.gradeLevels ?? [];
      if (grades.length === 0) {
        return [
          {
            levelId: level.id,
            levelName: level.name,
            gradeId: `${level.id}-empty`,
            gradeName: "—",
            streamCount: 0,
            subjectCount: level.subjects?.length ?? 0,
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
        subjectCount: level.subjects?.length ?? 0,
        isFirstInLevel: index === 0,
        levelGradeCount: grades.length,
      }));
    });
  }, [levels]);

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-none border border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#0c1a17]">
        <div className="border-b border-[#1a4d42]/10 px-4 py-3 dark:border-white/10">
          <div className="h-4 w-32 animate-pulse rounded bg-[#e8f2ef] dark:bg-slate-800" />
        </div>
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded-none bg-[#f8fbfa] dark:bg-slate-800/60"
            />
          ))}
        </div>
      </div>
    );
  }

  if (levels.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-none border border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#0c1a17]">
      <div className="border-b border-[#1a4d42]/10 px-4 py-3 dark:border-white/10">
        <h2 className="text-sm font-medium text-[#0a1f1a] dark:text-white">
          Levels at a glance
        </h2>
        <p className="mt-0.5 text-xs text-[#1a4d42]/45">
          Select a grade in the sidebar to view subjects, fees, and actions.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a4d42]/10 bg-[#f8fbfa] text-left dark:border-white/10 dark:bg-[#0c1a17]">
              <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[#1a4d42]/45">
                Level
              </th>
              <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[#1a4d42]/45">
                Grade
              </th>
              <th className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[#1a4d42]/45">
                Streams
              </th>
              <th className="hidden px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[#1a4d42]/45 sm:table-cell">
                Subjects
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr
                key={`${row.levelId}-${row.gradeId}`}
                className="text-[#1a4d42]/80 dark:text-[#1a4d42]/30"
              >
                <td className="px-4 py-2.5 align-top">
                  {row.isFirstInLevel ? (
                    <div>
                      <span className="font-medium text-[#0a1f1a] dark:text-white">
                        {row.levelName}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[#1a4d42]/45">
                        {row.levelGradeCount} grade
                        {row.levelGradeCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-2.5 font-medium text-[#0a1f1a] dark:text-white">
                  {row.gradeName}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "text-xs",
                      row.streamCount > 0
                        ? "text-[#1a4d42]/65 dark:text-[#1a4d42]/45"
                        : "text-[#1a4d42]/45",
                    )}
                  >
                    {formatStreamCount(row.streamCount)}
                  </span>
                </td>
                <td className="hidden px-4 py-2.5 text-xs text-[#1a4d42]/55 sm:table-cell">
                  {row.isFirstInLevel ? (
                    <>
                      {row.subjectCount} subject
                      {row.subjectCount !== 1 ? "s" : ""}
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
