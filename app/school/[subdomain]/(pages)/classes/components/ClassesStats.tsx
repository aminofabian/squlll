"use client";

import React, { useMemo } from "react";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import { useGetTeachers } from "@/lib/hooks/useTeachers";

interface ClassesStatsProps {
  config: SchoolConfiguration | null;
  isLoading?: boolean;
  /** When set (e.g. dashboard), include enrolled student count in the summary */
  studentCount?: number | null;
  studentsLoading?: boolean;
}

export function ClassesStats({
  config,
  isLoading,
  studentCount,
  studentsLoading,
}: ClassesStatsProps) {
  const { teachers, isLoading: teachersLoading } = useGetTeachers();

  const stats = useMemo(() => {
    if (!config?.selectedLevels) {
      return {
        totalLevels: 0,
        totalGrades: 0,
        totalStreams: 0,
        totalSubjects: 0,
      };
    }

    const levels = config.selectedLevels;
    const totalLevels = levels.length;
    const totalGrades = levels.reduce(
      (sum, level) => sum + (level.gradeLevels?.length || 0),
      0,
    );
    const totalStreams = levels.reduce((sum, level) => {
      return (
        sum +
        (level.gradeLevels?.reduce(
          (gradeSum, grade) => gradeSum + (grade.streams?.length || 0),
          0,
        ) || 0)
      );
    }, 0);

    const subjectSet = new Set<string>();
    levels.forEach((level) => {
      level.subjects.forEach((subject) => subjectSet.add(subject.id));
    });

    return {
      totalLevels,
      totalGrades,
      totalStreams,
      totalSubjects: subjectSet.size,
    };
  }, [config]);

  if (isLoading || teachersLoading || studentsLoading) {
    return (
      <p className="text-xs text-[#1a4d42]/45">
        <span className="inline-block h-3 w-48 animate-pulse rounded bg-[#e8f2ef] dark:bg-slate-800" />
      </p>
    );
  }

  const parts = [
    ...(studentCount != null
      ? [
          `${studentCount} student${studentCount !== 1 ? "s" : ""}`,
        ]
      : []),
    `${stats.totalLevels} level${stats.totalLevels !== 1 ? "s" : ""}`,
    `${stats.totalGrades} grade${stats.totalGrades !== 1 ? "s" : ""}`,
    `${stats.totalStreams} stream${stats.totalStreams !== 1 ? "s" : ""}`,
    `${teachers.length} teacher${teachers.length !== 1 ? "s" : ""}`,
    `${stats.totalSubjects} subject${stats.totalSubjects !== 1 ? "s" : ""}`,
  ];

  return (
    <p
      className="text-xs text-[#1a4d42]/55 dark:text-[#1a4d42]/45"
      aria-label={`School summary: ${parts.join(", ")}`}
    >
      <span className="font-medium text-[#1a4d42]/65 dark:text-[#1a4d42]/30">
        Summary
      </span>
      <span className="mx-1.5 text-[#1a4d42]/30 dark:text-[#1a4d42]/65">·</span>
      {parts.join(" · ")}
    </p>
  );
}
