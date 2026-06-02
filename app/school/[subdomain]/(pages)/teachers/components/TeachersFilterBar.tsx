"use client";

import { cn } from "@/lib/utils";
import type { StaffFilter } from "../utils/teachers-utils";

interface TeachersFilterBarProps {
  filter: StaffFilter;
  onFilterChange: (filter: StaffFilter) => void;
  counts: {
    all: number;
    active: number;
    needsSetup: number;
    incomplete: number;
  };
  departments: string[];
  departmentFilter: string;
  onDepartmentFilterChange: (department: string) => void;
}

const filters: { id: StaffFilter; label: string }[] = [
  { id: "all", label: "All staff" },
  { id: "active", label: "Active" },
  { id: "needs-setup", label: "Needs setup" },
  { id: "incomplete", label: "Incomplete profile" },
];

export function TeachersFilterBar({
  filter,
  onFilterChange,
  counts,
  departments,
  departmentFilter,
  onDepartmentFilterChange,
}: TeachersFilterBarProps) {
  const countFor = (id: StaffFilter) => {
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
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map(({ id, label }) => {
          const count = countFor(id);
          const isActive = filter === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onFilterChange(id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                isActive
                  ? "border-slate-800 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-100 dark:text-slate-900"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
              )}
            >
              {label}
              <span
                className={cn(
                  "tabular-nums",
                  isActive ? "opacity-80" : "text-slate-400",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {departments.length > 1 ? (
        <div className="flex items-center gap-2">
          <label
            htmlFor="department-filter"
            className="text-xs text-slate-400"
          >
            Department
          </label>
          <select
            id="department-filter"
            value={departmentFilter}
            onChange={(e) => onDepartmentFilterChange(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="all">All departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
