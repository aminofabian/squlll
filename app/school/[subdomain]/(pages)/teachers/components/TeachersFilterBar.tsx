"use client";

import { cn } from "@/lib/utils";
import type { StaffFilter } from "../utils/teachers-utils";

interface TeachersFilterBarProps {
  filter: StaffFilter;
  onFilterChange: (filter: StaffFilter) => void;
  counts: { all: number; active: number; needsSetup: number };
}

const filters: { id: StaffFilter; label: string }[] = [
  { id: "all", label: "All staff" },
  { id: "active", label: "Active" },
  { id: "needs-setup", label: "Needs setup" },
];

export function TeachersFilterBar({
  filter,
  onFilterChange,
  counts,
}: TeachersFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map(({ id, label }) => {
        const count =
          id === "all" ? counts.all : id === "active" ? counts.active : counts.needsSetup;
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
  );
}
