"use client";

import { cn } from "@/lib/utils";
import type { ParentFilter } from "../utils/parents-utils";
import { parentsFilterPill, parentsSelect } from "./parents-ui";

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
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
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

      {grades.length > 0 ? (
        <select
          id="grade-filter"
          aria-label="Child grade"
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
      ) : null}
    </div>
  );
}
