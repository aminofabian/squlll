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
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
      {filters.map(({ id, label }) => {
        const count = countFor(id);
        const isActive = filter === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onFilterChange(id)}
            className={cn(
              "inline-flex items-center gap-1 rounded-none border px-2 py-0.5 text-[11px] transition-colors",
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

      {departments.length > 1 ? (
        <select
          id="department-filter"
          aria-label="Department"
          value={departmentFilter}
          onChange={(e) => onDepartmentFilterChange(e.target.value)}
          className="h-6 rounded-none border border-[#1a4d42]/15 bg-white px-1.5 text-[11px] text-[#0a1f1a] dark:border-white/15 dark:bg-[#0c1a17] dark:text-white"
        >
          <option value="all">All depts</option>
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}
