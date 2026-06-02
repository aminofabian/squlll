"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { studentsEnrollLink } from "./students-ui";

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
      <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-slate-100/35 dark:border-slate-800/60 dark:bg-slate-900/25">
        <div className="grid grid-cols-2 gap-px bg-slate-200/40 dark:bg-slate-800/60 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/60 px-4 py-3 dark:bg-slate-900/30">
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
            <Link href="/students?action=add" className={cn(studentsEnrollLink, "mt-2")}>
              Enroll student
              <ArrowRight className="h-3 w-3 text-white/70" />
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
      className="overflow-hidden rounded-xl border border-slate-200/50 bg-slate-100/35 dark:border-slate-800/60 dark:bg-slate-900/25"
      role="group"
      aria-label="Student statistics"
    >
      <div className="grid grid-cols-2 divide-x divide-y divide-slate-200/40 dark:divide-slate-800/50 lg:grid-cols-4">
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
