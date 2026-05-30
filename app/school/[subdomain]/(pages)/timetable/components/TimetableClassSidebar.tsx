"use client";

import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";
import { highlightGradeSearchMatch } from "../utils/filterGradesBySearch";
import { GradeClassSearch } from "./GradeClassSearch";
import type { Ref } from "react";
import type { Grade } from "@/lib/types/timetable";

interface TimetableClassSidebarProps {
  grades: Grade[];
  allGradesCount: number;
  selectedGradeId: string | null;
  /** Shown at top when search would hide the active class */
  pinnedGradeId?: string | null;
  onSelectGrade: (gradeId: string) => void;
  onSelectAllClasses?: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchInputRef?: Ref<HTMLInputElement>;
}

function GradeListLabel({ label, query }: { label: string; query: string }) {
  const parts = highlightGradeSearchMatch(label, query);
  if (!parts) {
    return <span>{label}</span>;
  }
  return (
    <span>
      {parts.before}
      <span className="rounded-sm bg-zinc-200/90 px-0.5 font-semibold text-zinc-900 dark:bg-zinc-600 dark:text-zinc-50">
        {parts.match}
      </span>
      {parts.after}
    </span>
  );
}

export function TimetableClassSidebar({
  grades,
  allGradesCount,
  selectedGradeId,
  pinnedGradeId,
  onSelectGrade,
  onSelectAllClasses,
  searchTerm,
  onSearchChange,
  searchInputRef,
}: TimetableClassSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-100 px-3 py-3 dark:border-zinc-800">
        <p className={cn(tt.caption, "mb-2.5")}>
          Select a class to edit its weekly grid.
        </p>
        <GradeClassSearch
          ref={searchInputRef}
          value={searchTerm}
          onChange={onSearchChange}
          resultCount={grades.length}
          totalCount={allGradesCount}
        />
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto p-2" role="listbox" aria-label="Classes">
        {onSelectAllClasses ? (
          <li role="option" aria-selected={selectedGradeId === null}>
            <button
              type="button"
              onClick={onSelectAllClasses}
              className={cn(
                "mb-1 w-full rounded-lg px-3 py-2.5 text-left text-[13px] font-medium tracking-tight transition-colors",
                selectedGradeId === null
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
              )}
            >
              All classes
              <span
                className={cn(
                  "mt-0.5 block text-[11px] font-normal",
                  selectedGradeId === null
                    ? "text-zinc-300 dark:text-zinc-500"
                    : "text-zinc-400",
                )}
              >
                Whole-school timetable
              </span>
            </button>
          </li>
        ) : null}
        {grades.length === 0 ? (
          <li className="px-2 py-8 text-center">
            <p className="text-[12px] font-medium text-zinc-600 dark:text-zinc-300">
              No classes found
            </p>
            {searchTerm.trim() && (
              <button
                type="button"
                className="mt-2 text-[12px] font-medium text-zinc-500 underline-offset-2 hover:underline"
                onClick={() => onSearchChange("")}
              >
                Clear search
              </button>
            )}
          </li>
        ) : (
          grades.map((g) => {
            const label = g.displayName || g.name;
            const active = selectedGradeId === g.id;
            const isPinned = pinnedGradeId === g.id;
            return (
              <li key={g.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => onSelectGrade(g.id)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2.5 text-left text-[13px] font-medium tracking-tight transition-colors",
                    active
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                    isPinned && !active && "ring-1 ring-zinc-300 dark:ring-zinc-600",
                  )}
                >
                  {isPinned && (
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                      Current class
                    </span>
                  )}
                  <GradeListLabel label={label} query={searchTerm} />
                  {g.name && label !== g.name && (
                    <span
                      className={cn(
                        "mt-0.5 block text-[11px] font-normal",
                        active
                          ? "text-zinc-300 dark:text-zinc-500"
                          : "text-zinc-400",
                      )}
                    >
                      {g.name}
                    </span>
                  )}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
