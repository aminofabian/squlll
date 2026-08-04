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
    <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-1.5">
        {filters.map(({ id, label }) => {
          const count = countFor(id);
          const isActive = filter === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onFilterChange(id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-none border px-2.5 py-1 text-xs transition-colors",
                isActive
                  ? "border-[#0a1f1a] bg-[#0a1f1a] text-white"
                  : "border-[#1a4d42]/12 bg-white text-[#1a4d42]/70 hover:border-[#246a59]/35 hover:bg-[#246a59]/[0.06] dark:border-white/10 dark:bg-[#0c1a17] dark:text-white/55",
              )}
            >
              {label}
              <span
                className={cn(
                  "tabular-nums",
                  isActive ? "opacity-80" : "text-[#1a4d42]/40",
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
            className="text-xs text-[#1a4d42]/45"
          >
            Department
          </label>
          <select
            id="department-filter"
            value={departmentFilter}
            onChange={(e) => onDepartmentFilterChange(e.target.value)}
            className="h-8 rounded-none border border-[#1a4d42]/15 bg-white px-2.5 text-xs text-[#0a1f1a] dark:border-white/15 dark:bg-[#0c1a17] dark:text-white"
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
