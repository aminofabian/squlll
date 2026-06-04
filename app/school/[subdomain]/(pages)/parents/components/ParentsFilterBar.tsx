"use client";

import { cn } from "@/lib/utils";
import type { ParentFilter } from "../utils/parents-utils";
import { parentsFilterPill, parentsSelect, parentsSectionLabel } from "./parents-ui";

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
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className={cn(parentsSectionLabel, "mb-2")}>Status</p>
        <div className="flex flex-wrap items-center gap-2">
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
                    isActive ? "opacity-80" : "text-slate-400",
                  )}
                >
                  {countFor(id)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {grades.length > 0 ? (
        <div className="flex shrink-0 flex-col gap-1.5 sm:items-end">
          <label htmlFor="grade-filter" className={parentsSectionLabel}>
            Child grade
          </label>
          <select
            id="grade-filter"
            value={gradeFilter}
            onChange={(e) => onGradeFilterChange(e.target.value)}
            className={parentsSelect}
          >
            <option value="all">All grades</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
