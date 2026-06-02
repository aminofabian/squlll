"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentFilter } from "../utils/students-utils";
import {
  studentsFilterPill,
  studentsSelect,
} from "./students-ui";

interface StudentsFilterBarProps {
  filter: StudentFilter;
  onFilterChange: (filter: StudentFilter) => void;
  counts: {
    all: number;
    active: number;
    inactive: number;
    missingClass: number;
  };
  grades: string[];
  gradeFilter: string;
  onGradeFilterChange: (grade: string) => void;
}

const filters: { id: StudentFilter; label: string }[] = [
  { id: "all", label: "All students" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "missing-class", label: "No class" },
];

export function StudentsFilterBar({
  filter,
  onFilterChange,
  counts,
  grades,
  gradeFilter,
  onGradeFilterChange,
}: StudentsFilterBarProps) {
  const countFor = (id: StudentFilter) => {
    switch (id) {
      case "all":
        return counts.all;
      case "active":
        return counts.active;
      case "inactive":
        return counts.inactive;
      case "missing-class":
        return counts.missingClass;
      default:
        return 0;
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-1.5">
        {filters.map(({ id, label }) => {
          const isActive = filter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onFilterChange(id)}
              className={studentsFilterPill(isActive)}
            >
              {label}
              <span
                className={cn(
                  "tabular-nums",
                  isActive ? "opacity-75" : "text-slate-400",
                )}
              >
                {countFor(id)}
              </span>
            </button>
          );
        })}
      </div>

      {grades.length > 0 ? (
        <div className="flex items-center gap-2">
          <label htmlFor="student-grade-filter" className="text-xs text-slate-400">
            Grade
          </label>
          <div className="relative">
            <select
              id="student-grade-filter"
              value={gradeFilter}
              onChange={(e) => onGradeFilterChange(e.target.value)}
              className={studentsSelect}
            >
              <option value="all">All grades</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
