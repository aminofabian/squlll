"use client";

import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { studentsPanel } from "./students-ui";

interface GradeRow {
  grade: string;
  count: number;
  percent: number;
}

interface StudentsGradeMixProps {
  rows: GradeRow[];
  total: number;
  activeGrade?: string;
  onGradeSelect?: (grade: string) => void;
}

export function StudentsGradeMix({
  rows,
  total,
  activeGrade,
  onGradeSelect,
}: StudentsGradeMixProps) {
  const max = rows[0]?.count ?? 1;

  if (rows.length === 0) return null;

  return (
    <div className={cn(studentsPanel, "p-3 sm:p-3.5")}>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-[#0073ea]" />
          <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
            By grade
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onGradeSelect?.("all")}
          className={cn(
            "text-[10px] font-medium transition-colors",
            activeGrade === "all" || !activeGrade
              ? "text-[#0073ea]"
              : "text-slate-400 hover:text-[#0073ea]",
          )}
        >
          All ({total})
        </button>
      </div>

      <ul className="space-y-2">
        {rows.map((row) => {
          const isActive = activeGrade === row.grade;
          return (
            <li key={row.grade}>
              <button
                type="button"
                onClick={() => onGradeSelect?.(row.grade)}
                className="group w-full text-left"
              >
                <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                  <span
                    className={cn(
                      "truncate font-medium transition-colors",
                      isActive
                        ? "text-[#0073ea]"
                        : "text-slate-600 group-hover:text-slate-900 dark:text-slate-300",
                    )}
                  >
                    {row.grade}
                  </span>
                  <span className="shrink-0 tabular-nums text-slate-400">
                    {row.count} · {row.percent}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isActive ? "bg-[#0073ea]" : "bg-slate-300 group-hover:bg-[#0073ea]/60 dark:bg-slate-600",
                    )}
                    style={{
                      width: `${Math.max(10, (row.count / max) * 100)}%`,
                    }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
