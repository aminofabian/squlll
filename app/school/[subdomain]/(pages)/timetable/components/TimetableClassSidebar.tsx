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
      <span className="rounded-none bg-[#e8f2ef] px-0.5 font-semibold text-[#0a1f1a] dark:bg-white/10 dark:text-white">
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
      <div className={cn("border-b px-2.5 py-2", tt.border.hair)}>
        <p className={cn(tt.text.caption, tt.ink.muted, "mb-1.5")}>
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
      <ul className="flex-1 space-y-px overflow-y-auto p-1.5" role="listbox" aria-label="Classes">
        {onSelectAllClasses ? (
          <li role="option" aria-selected={selectedGradeId === null}>
            <button
              type="button"
              onClick={onSelectAllClasses}
              className={cn(
                tt.text.body,
                tt.focus,
                "mb-0.5 w-full rounded-none px-2.5 py-2.5 text-left font-medium tracking-tight transition-colors",
                selectedGradeId === null
                  ? "bg-[#0a1f1a] text-white dark:bg-[#246a59]"
                  : cn(tt.ink.base, "hover:bg-[#e8f2ef] dark:hover:bg-white/5"),
              )}
            >
              All classes
              <span
                className={cn(
                  tt.text.micro,
                  tt.numeral,
                  "mt-0.5 block font-normal",
                  selectedGradeId === null
                    ? "text-white/70"
                    : tt.ink.faint,
                )}
              >
                {allGradesCount} class{allGradesCount === 1 ? "" : "es"}
              </span>
            </button>
          </li>
        ) : null}
        {grades.length === 0 ? (
          <li className="px-2 py-8 text-center">
            <p className={cn(tt.text.small, tt.ink.base, "font-medium")}>
              No classes found
            </p>
            {searchTerm.trim() && (
              <button
                type="button"
                className={cn(
                  tt.text.small,
                  tt.ink.muted,
                  tt.focus,
                  "mt-2 font-medium underline-offset-2 hover:underline",
                )}
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
                    tt.text.body,
                    tt.focus,
                    "w-full rounded-none px-2.5 py-2.5 text-left font-medium tracking-tight transition-colors",
                    active
                      ? "bg-[#0a1f1a] text-white dark:bg-[#246a59]"
                      : cn(tt.ink.base, "hover:bg-[#e8f2ef] dark:hover:bg-white/5"),
                    isPinned &&
                      !active &&
                      "ring-1 ring-[#246a59]/30 dark:ring-[#246a59]/60",
                  )}
                >
                  {isPinned && (
                    <span
                      className={cn(
                        tt.text.micro,
                        tt.ink.faint,
                        "mb-0.5 block font-semibold uppercase tracking-wide",
                      )}
                    >
                      Current class
                    </span>
                  )}
                  <GradeListLabel label={label} query={searchTerm} />
                  {g.name && label !== g.name && (
                    <span
                      className={cn(
                        tt.text.micro,
                        "mt-0.5 block font-normal",
                        active ? "text-white/70" : tt.ink.faint,
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
