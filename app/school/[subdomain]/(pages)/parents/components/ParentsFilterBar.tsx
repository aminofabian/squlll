"use client";

import { cn } from "@/lib/utils";
import type { ParentFilter } from "../utils/parents-utils";
import { parentsFilterPill } from "./parents-ui";

interface ParentsFilterBarProps {
  filter: ParentFilter;
  onFilterChange: (filter: ParentFilter) => void;
  counts: {
    all: number;
    active: number;
    needsSetup: number;
    incomplete: number;
  };
  grades: string[];
  gradeFilter: string;
  onGradeFilterChange: (grade: string) => void;
  gradeCounts?: Record<string, number>;
}

const filters: { id: ParentFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "needs-setup", label: "Needs setup" },
  { id: "incomplete", label: "Incomplete" },
];

export function ParentsFilterBar({
  filter,
  onFilterChange,
  counts,
  grades,
  gradeFilter,
  onGradeFilterChange,
  gradeCounts = {},
}: ParentsFilterBarProps) {
  const countFor = (id: ParentFilter) => {
    switch (id) {
      case "all":
        return counts.all;
      case "active":
        return counts.active;
      case "needs-setup":
        return counts.needsSetup;
      case "incomplete":
        return counts.incomplete;
      default:
        return 0;
    }
  };

  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <div className="flex flex-wrap items-center gap-1">
        {filters.map(({ id, label }) => {
        const isActive = filter === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onFilterChange(id)}
            className={parentsFilterPill(isActive)}
          >
            {label}
            <span
              className={cn(
                "tabular-nums",
                isActive ? "opacity-80" : "text-[#1a4d42]/40",
              )}
            >
              {countFor(id)}
            </span>
          </button>
          );
        })}
      </div>

      {grades.length > 0 ? (
        <div className="flex min-w-0 flex-wrap items-center gap-1 border-t border-[#1a4d42]/10 pt-1.5 dark:border-white/10">
          <span className="mr-0.5 shrink-0 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/40 dark:text-white/35">
            Grade
          </span>
          <button
            type="button"
            onClick={() => onGradeFilterChange("all")}
            aria-pressed={gradeFilter === "all"}
            className={cn(
              "inline-flex items-center gap-1 rounded-none border px-2 py-0.5 text-[10.5px] font-medium transition-colors",
              gradeFilter === "all"
                ? "border-[#0a1f1a] bg-[#0a1f1a] text-white"
                : "border-[#1a4d42]/12 bg-white text-[#1a4d42]/70 hover:border-[#246a59]/35 hover:bg-[#246a59]/[0.06] dark:border-white/10 dark:bg-[#0c1a17] dark:text-white/55",
            )}
          >
            All
            <span className="tabular-nums opacity-70">{counts.all}</span>
          </button>
          {grades.map((grade) => {
            const active = gradeFilter === grade;
            return (
              <button
                key={grade}
                type="button"
                onClick={() => onGradeFilterChange(grade)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1 rounded-none border px-2 py-0.5 text-[10.5px] font-medium transition-colors",
                  active
                    ? "border-[#0a1f1a] bg-[#0a1f1a] text-white"
                    : "border-[#1a4d42]/12 bg-white text-[#1a4d42]/70 hover:border-[#246a59]/35 hover:bg-[#246a59]/[0.06] dark:border-white/10 dark:bg-[#0c1a17] dark:text-white/55",
                )}
              >
                {grade}
                {gradeCounts[grade] != null ? (
                  <span className="tabular-nums opacity-70">
                    {gradeCounts[grade]}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
