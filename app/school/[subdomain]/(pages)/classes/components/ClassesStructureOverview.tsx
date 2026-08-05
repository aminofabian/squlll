"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Filter,
  GraduationCap,
  Layers,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import {
  abbreviateGradeShort,
  formatGradeDisplayName,
  getGradeSortOrder,
} from "@/lib/utils/grade-display";
import { cn } from "@/lib/utils";

interface StudentLike {
  grade?: {
    gradeLevel?: { id?: string; name?: string };
  } | string;
}

interface ClassesStructureOverviewProps {
  config: SchoolConfiguration | null;
  students: StudentLike[];
  isLoading?: boolean;
  onOpenGradePicker: () => void;
  onGradeSelect: (gradeId: string, levelId: string) => void;
  onStreamSelect: (streamId: string, gradeId: string, levelId: string) => void;
}

interface GradeRow {
  gradeId: string;
  levelId: string;
  gradeName: string;
  displayName: string;
  levelName: string;
  streamCount: number;
  studentCount: number;
  subjectCount: number;
}

interface LevelSummary {
  levelId: string;
  levelName: string;
  gradeCount: number;
  streamCount: number;
  studentCount: number;
  subjectCount: number;
}

export function ClassesStructureOverview({
  config,
  students,
  isLoading,
  onOpenGradePicker,
  onGradeSelect,
  onStreamSelect,
}: ClassesStructureOverviewProps) {
  const studentCountByGrade = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of students) {
      if (typeof s.grade === "string" || !s.grade?.gradeLevel?.id) continue;
      const id = s.grade.gradeLevel.id;
      map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [students]);

  const { levelSummaries, gradeRows, attention } = useMemo(() => {
    if (!config?.selectedLevels) {
      return { levelSummaries: [], gradeRows: [], attention: [] as GradeRow[] };
    }

    const levels: LevelSummary[] = [];
    const rows: GradeRow[] = [];

    for (const level of config.selectedLevels) {
      const grades = [...(level.gradeLevels ?? [])].sort(
        (a, b) => getGradeSortOrder(a.name) - getGradeSortOrder(b.name),
      );
      let levelStreams = 0;
      let levelStudents = 0;

      for (const grade of grades) {
        const streamCount = grade.streams?.length ?? 0;
        const studentCount = studentCountByGrade.get(grade.id) ?? 0;
        levelStreams += streamCount;
        levelStudents += studentCount;
        rows.push({
          gradeId: grade.id,
          levelId: level.id,
          gradeName: grade.name,
          displayName: formatGradeDisplayName(grade.name),
          levelName: level.name,
          streamCount,
          studentCount,
          subjectCount: level.subjects?.length ?? 0,
        });
      }

      if (grades.length > 0) {
        levels.push({
          levelId: level.id,
          levelName: level.name,
          gradeCount: grades.length,
          streamCount: levelStreams,
          studentCount: levelStudents,
          subjectCount: level.subjects?.length ?? 0,
        });
      }
    }

    const needsAttention = rows.filter(
      (r) => r.studentCount === 0 || (r.streamCount > 0 && r.studentCount === 0),
    );

    return {
      levelSummaries: levels,
      gradeRows: rows.sort((a, b) => b.studentCount - a.studentCount),
      attention: needsAttention.slice(0, 4),
    };
  }, [config?.selectedLevels, studentCountByGrade]);

  const maxLevelStudents = Math.max(
    ...levelSummaries.map((l) => l.studentCount),
    1,
  );

  const topGrades = gradeRows.slice(0, 6);

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="h-48 animate-pulse rounded-none bg-[#e8f2ef] dark:bg-slate-800 lg:col-span-2" />
        <div className="h-48 animate-pulse rounded-none bg-[#e8f2ef] dark:bg-slate-800 lg:col-span-3" />
      </div>
    );
  }

  if (levelSummaries.length === 0) {
    return (
      <div className="rounded-none border border-dashed border-[#1a4d42]/15 px-6 py-10 text-center dark:border-white/15">
        <p className="text-sm text-[#1a4d42]/55">No class levels configured yet.</p>
        <p className="mt-1 text-xs text-[#1a4d42]/45">
          Finish school setup to add grades and streams.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="overflow-hidden rounded-none border border-[#1a4d42]/12 bg-white shadow-none dark:border-white/10 dark:bg-[#0c1a17] lg:col-span-2">
        <div className="border-b border-[#1a4d42]/10 px-4 py-3 dark:border-white/10">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-[#0a1f1a] dark:text-white">
            <Layers className="h-3.5 w-3.5 text-[#246a59]" />
            By school level
          </h3>
          <p className="mt-0.5 text-[11px] text-[#1a4d42]/45">
            Enrollment spread across levels
          </p>
        </div>
        <ul className="space-y-3 p-4">
          {levelSummaries.map((level) => (
            <li key={level.levelId}>
              <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-medium text-[#1a4d42]/80 dark:text-[#1a4d42]/30">
                  {level.levelName}
                </span>
                <span className="tabular-nums text-[#1a4d42]/45">
                  {level.studentCount} students · {level.gradeCount} grades
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-none bg-[#e8f2ef] dark:bg-slate-800">
                <div
                  className="h-full rounded-none bg-[#246a59] transition-all"
                  style={{
                    width: `${Math.max(
                      10,
                      (level.studentCount / maxLevelStudents) * 100,
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-[10px] text-[#1a4d42]/45">
                {level.streamCount} stream{level.streamCount !== 1 ? "s" : ""} ·{" "}
                {level.subjectCount} subject{level.subjectCount !== 1 ? "s" : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <div className="overflow-hidden rounded-none border border-[#1a4d42]/12 bg-white shadow-none dark:border-white/10 dark:bg-[#0c1a17]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1a4d42]/10 px-4 py-3 dark:border-white/10">
            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-[#0a1f1a] dark:text-white">
                <GraduationCap className="h-3.5 w-3.5 text-[#246a59]" />
                Busiest classes
              </h3>
              <p className="mt-0.5 text-[11px] text-[#1a4d42]/45">
                Open any row — or use the grades panel
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs lg:hidden"
              onClick={onOpenGradePicker}
            >
              <Filter className="h-3.5 w-3.5" />
              Grades &amp; classes
            </Button>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {topGrades.map((row) => (
              <li key={row.gradeId}>
                <button
                  type="button"
                  onClick={() => onGradeSelect(row.gradeId, row.levelId)}
                  className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f8fbfa] dark:hover:bg-slate-800/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-[#246a59]/10 text-sm font-bold text-[#246a59]">
                    {abbreviateGradeShort(row.gradeName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#0a1f1a] group-hover:text-[#246a59] dark:text-white">
                      {row.displayName}
                    </span>
                    <span className="block text-[11px] text-[#1a4d42]/45">
                      {row.levelName}
                      {row.streamCount > 0
                        ? ` · ${row.streamCount} stream${row.streamCount !== 1 ? "s" : ""}`
                        : ""}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums text-[#1a4d42]/80 dark:text-slate-200">
                      <Users className="h-3 w-3 text-[#1a4d42]/45" />
                      {row.studentCount}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#1a4d42]/30 group-hover:text-[#246a59]" />
                  </span>
                </button>
                {row.streamCount > 0 ? (
                  <div className="flex flex-wrap gap-1.5 border-t border-slate-50 bg-[#f8fbfa] px-4 py-2 dark:border-white/10/60 dark:bg-[#071411]">
                    {config?.selectedLevels
                      .find((l) => l.id === row.levelId)
                      ?.gradeLevels?.find((g) => g.id === row.gradeId)
                      ?.streams?.map((stream) => (
                        <button
                          key={stream.id}
                          type="button"
                          onClick={() =>
                            onStreamSelect(stream.id, row.gradeId, row.levelId)
                          }
                          className="rounded-none bg-white px-2.5 py-1 text-[11px] font-medium text-[#1a4d42]/65 ring-1 ring-slate-200/80 transition-colors hover:bg-[#246a59] hover:text-white hover:ring-[#246a59] dark:bg-slate-800 dark:text-[#1a4d42]/30 dark:ring-slate-700"
                        >
                          {stream.name}
                        </button>
                      ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          {gradeRows.length > topGrades.length ? (
            <p className="border-t border-[#1a4d42]/10 px-4 py-2.5 text-center text-[11px] text-[#1a4d42]/45 dark:border-white/10">
              {gradeRows.length - topGrades.length} more grade
              {gradeRows.length - topGrades.length !== 1 ? "s" : ""} in the
              sidebar panel
            </p>
          ) : null}
        </div>

        {attention.length > 0 ? (
          <div className="rounded-none border border-amber-200/70 bg-amber-50/50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Needs a look
            </p>
            <ul className="mt-2 space-y-1.5">
              {attention.map((row) => (
                <li key={row.gradeId}>
                  <button
                    type="button"
                    onClick={() => onGradeSelect(row.gradeId, row.levelId)}
                    className="flex w-full items-center justify-between gap-2 text-left text-[11px] text-amber-800 hover:underline dark:text-amber-300"
                  >
                    <span>
                      {row.displayName} ({row.levelName})
                    </span>
                    <span>
                      {row.studentCount === 0 ? "No students" : "Review"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <Link
              href="/students?action=add"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#246a59] hover:underline"
            >
              Enroll students
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        ) : null}

        <div className="hidden rounded-none border border-dashed border-[#1a4d42]/12 bg-[#f8fbfa] px-4 py-3 text-[11px] text-[#1a4d42]/55 dark:border-white/15 dark:bg-[#071411] lg:block">
          <BookOpen className="mb-1 inline h-3.5 w-3.5 text-[#1a4d42]/45" />
          Use the <strong>grades panel</strong> on the left to jump to any class
          quickly.
        </div>
      </div>
    </div>
  );
}
