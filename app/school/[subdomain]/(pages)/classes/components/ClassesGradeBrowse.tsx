"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";
import type { GradeLevel, SchoolConfiguration } from "@/lib/types/school-config";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  abbreviateGradeShort,
  getGradeSortOrder,
} from "@/lib/utils/grade-display";

interface LevelGroup {
  levelId: string;
  levelName: string;
  subjectCount: number;
  grades: Array<
    GradeLevel & {
      levelId: string;
    }
  >;
}

interface ClassesGradeBrowseProps {
  config: SchoolConfiguration | null;
  isLoading?: boolean;
  selectedGradeId?: string;
  selectedStreamId?: string;
  onGradeSelect?: (gradeId: string, levelId: string) => void;
  onStreamSelect?: (streamId: string, gradeId: string, levelId: string) => void;
}

function sortGrades<T extends { name: string }>(grades: T[]): T[] {
  return [...grades].sort(
    (a, b) => getGradeSortOrder(a.name) - getGradeSortOrder(b.name),
  );
}

export function ClassesGradeBrowse({
  config,
  isLoading,
  selectedGradeId = "",
  selectedStreamId = "",
  onGradeSelect,
  onStreamSelect,
}: ClassesGradeBrowseProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGradeId, setExpandedGradeId] = useState<string | null>(null);

  const levelGroups: LevelGroup[] = useMemo(() => {
    if (!config?.selectedLevels) return [];

    return config.selectedLevels
      .map((level) => ({
        levelId: level.id,
        levelName: level.name,
        subjectCount: level.subjects?.length ?? 0,
        grades: sortGrades(level.gradeLevels ?? []).map((grade) => ({
          ...grade,
          levelId: level.id,
        })),
      }))
      .filter((group) => group.grades.length > 0);
  }, [config?.selectedLevels]);

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return levelGroups;

    return levelGroups
      .map((group) => ({
        ...group,
        grades: group.grades.filter(
          (grade) =>
            grade.name.toLowerCase().includes(term) ||
            abbreviateGradeShort(grade.name).toLowerCase().includes(term) ||
            group.levelName.toLowerCase().includes(term) ||
            grade.streams?.some((stream) =>
              stream.name.toLowerCase().includes(term),
            ),
        ),
      }))
      .filter((group) => group.grades.length > 0);
  }, [levelGroups, searchTerm]);

  const activeGrade = useMemo(() => {
    const id = expandedGradeId || selectedGradeId;
    if (!id) return null;
    for (const group of levelGroups) {
      const grade = group.grades.find((item) => item.id === id);
      if (grade) return { ...grade, subjectCount: group.subjectCount };
    }
    return null;
  }, [expandedGradeId, selectedGradeId, levelGroups]);

  const handleGradeClick = (grade: LevelGroup["grades"][number]) => {
    const hasStreams = (grade.streams?.length ?? 0) > 0;

    if (hasStreams) {
      setExpandedGradeId((current) =>
        current === grade.id ? null : grade.id,
      );
      return;
    }

    setExpandedGradeId(null);
    onGradeSelect?.(grade.id, grade.levelId);
  };

  const handleStreamClick = (
    streamId: string,
    grade: LevelGroup["grades"][number],
  ) => {
    setExpandedGradeId(null);
    onStreamSelect?.(streamId, grade.id, grade.levelId);
    onGradeSelect?.(grade.id, grade.levelId);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 6 }).map((_, chipIndex) => (
                <div
                  key={chipIndex}
                  className="h-11 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (levelGroups.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center dark:border-slate-700">
        <p className="text-xs text-slate-500">No grades configured yet.</p>
        <p className="mt-1 text-[11px] text-slate-400">
          Complete school setup to add class levels.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search grades or streams…"
          className="h-8 border-slate-200/80 bg-slate-50/80 pl-8 pr-8 text-xs dark:border-slate-700 dark:bg-slate-800/40"
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {filteredGroups.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">
          No grades match &ldquo;{searchTerm}&rdquo;
        </p>
      ) : (
        filteredGroups.map((group) => (
          <div key={group.levelId} className="space-y-2">
            <div className="flex items-center justify-between gap-2 px-0.5">
              <h3 className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                {group.levelName}
              </h3>
              <span className="shrink-0 text-[10px] tabular-nums text-slate-400">
                {group.grades.length} grade{group.grades.length !== 1 ? "s" : ""}
                {group.subjectCount > 0
                  ? ` · ${group.subjectCount} subject${group.subjectCount !== 1 ? "s" : ""}`
                  : ""}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2 dark:border-slate-700/80 dark:bg-slate-800/20">
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
                {group.grades.map((grade) => {
                  const isExpanded = expandedGradeId === grade.id;
                  const isActive = selectedGradeId === grade.id || isExpanded;
                  const streamCount = grade.streams?.length ?? 0;

                  return (
                    <button
                      key={grade.id}
                      type="button"
                      onClick={() => handleGradeClick(grade)}
                      className={cn(
                        "relative flex min-h-[2.75rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-center transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]",
                        isActive
                          ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                          : "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200",
                      )}
                    >
                      <span className="text-[13px] font-semibold leading-none">
                        {abbreviateGradeShort(grade.name)}
                      </span>
                      <span
                        className={cn(
                          "flex items-center gap-0.5 text-[9px] leading-none",
                          isActive
                            ? "text-white/75 dark:text-slate-600"
                            : "text-slate-400",
                        )}
                      >
                        {streamCount > 0 ? (
                          <span>
                            {streamCount} stream{streamCount !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5">
                            <BookOpen className="h-2.5 w-2.5" />
                            {group.subjectCount || "No subjects"}
                          </span>
                        )}
                      </span>
                      {streamCount > 0 ? (
                        <span
                          className={cn(
                            "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold tabular-nums",
                            isActive
                              ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                              : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200",
                          )}
                        >
                          {streamCount}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))
      )}

      {activeGrade && (activeGrade.streams?.length ?? 0) > 0 ? (
        <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900/60">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Pick a stream in {abbreviateGradeShort(activeGrade.name)}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activeGrade.streams?.map((stream) => {
              const isSelected =
                selectedGradeId === activeGrade.id &&
                selectedStreamId === stream.id;

              return (
                <button
                  key={stream.id}
                  type="button"
                  onClick={() => handleStreamClick(stream.id, activeGrade)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    isSelected
                      ? "bg-[#0073ea] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
                  )}
                >
                  {stream.name}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              setExpandedGradeId(null);
              onGradeSelect?.(activeGrade.id, activeGrade.levelId);
            }}
            className="mt-2 text-[11px] font-medium text-[#0073ea] hover:underline"
          >
            Manage whole grade →
          </button>
        </div>
      ) : null}
    </div>
  );
}
