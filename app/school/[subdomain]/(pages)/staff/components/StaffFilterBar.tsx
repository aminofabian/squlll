"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StaffFilter } from "../utils/staff-utils";
import { staffFilterPill, staffSelect } from "./staff-ui";

interface StaffFilterBarProps {
  filter: StaffFilter;
  onFilterChange: (filter: StaffFilter) => void;
  counts: {
    all: number;
    active: number;
    inactive: number;
    incomplete: number;
  };
  departments: string[];
  departmentFilter: string;
  onDepartmentFilterChange: (department: string) => void;
  roles: string[];
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
}

const filters: { id: StaffFilter; label: string }[] = [
  { id: "all", label: "All staff" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "incomplete", label: "Incomplete" },
];

export function StaffFilterBar({
  filter,
  onFilterChange,
  counts,
  departments,
  departmentFilter,
  onDepartmentFilterChange,
  roles,
  roleFilter,
  onRoleFilterChange,
}: StaffFilterBarProps) {
  const countFor = (id: StaffFilter) => {
    switch (id) {
      case "all":
        return counts.all;
      case "active":
        return counts.active;
      case "inactive":
        return counts.inactive;
      case "incomplete":
        return counts.incomplete;
      default:
        return 0;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {filters.map(({ id, label }) => {
          const isActive = filter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onFilterChange(id)}
              className={staffFilterPill(isActive)}
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

      <div className="flex flex-wrap items-center gap-3">
        {departments.length > 0 ? (
          <div className="flex items-center gap-2">
            <label htmlFor="staff-dept-filter" className="text-xs text-slate-400">
              Department
            </label>
            <div className="relative">
              <select
                id="staff-dept-filter"
                value={departmentFilter}
                onChange={(e) => onDepartmentFilterChange(e.target.value)}
                className={staffSelect}
              >
                <option value="all">All departments</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
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

        {roles.length > 0 ? (
          <div className="flex items-center gap-2">
            <label htmlFor="staff-role-filter" className="text-xs text-slate-400">
              Role
            </label>
            <div className="relative">
              <select
                id="staff-role-filter"
                value={roleFilter}
                onChange={(e) => onRoleFilterChange(e.target.value)}
                className={staffSelect}
              >
                <option value="all">All roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.replace(/_/g, " ")}
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
    </div>
  );
}
