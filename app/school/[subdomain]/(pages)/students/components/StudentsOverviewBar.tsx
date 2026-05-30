"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface StudentsOverviewBarProps {
  total: number;
  active: number;
  inactive: number;
  gradeCount: number;
  isLoading?: boolean;
}

export function StudentsOverviewBar({
  total,
  active,
  inactive,
  gradeCount,
  isLoading,
}: StudentsOverviewBarProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40">
        <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white px-4 py-3 dark:bg-slate-900/40">
              <div className="h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="mt-2 h-4 w-12 animate-pulse rounded bg-slate-50 dark:bg-slate-800/60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cells = [
    {
      label: "Enrolled",
      content:
        total > 0 ? (
          <p className="mt-1 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
            {total}
          </p>
        ) : (
          <div className="mt-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No students enrolled yet.
            </p>
            <Link
              href="/students?action=add"
              className="mt-1 inline-flex text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Add students →
            </Link>
          </div>
        ),
    },
    {
      label: "Active",
      value: String(active),
      muted: active === 0,
    },
    {
      label: "Inactive",
      value: String(inactive),
      muted: inactive === 0,
    },
    {
      label: "Grades",
      value: String(gradeCount),
      muted: false,
    },
  ];

  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40"
      role="group"
      aria-label="Student statistics"
    >
      <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 dark:divide-slate-800 lg:grid-cols-4">
        {cells.map((cell) => (
          <div key={cell.label} className="px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {cell.label}
            </p>
            {"content" in cell && cell.content ? (
              cell.content
            ) : (
              <p
                className={cn(
                  "mt-1 text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100",
                  cell.muted && "text-slate-400",
                )}
              >
                {cell.value}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
