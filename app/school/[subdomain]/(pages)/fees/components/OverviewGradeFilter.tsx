"use client";

import { cn } from "@/lib/utils";

interface OverviewGradeFilterProps {
  grades: string[];
  value: string;
  onChange: (grade: string) => void;
  className?: string;
}

/** Compact grade chips for the overview — the balances page uses the full rail. */
export function OverviewGradeFilter({
  grades,
  value,
  onChange,
  className,
}: OverviewGradeFilterProps) {
  if (grades.length === 0) return null;

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1.5 overflow-x-auto rounded-xl border border-[#1a4d42]/12 bg-white px-2 py-1.5",
        className,
      )}
      role="group"
      aria-label="Filter overview by grade"
    >
      <span className="shrink-0 px-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
        Grade
      </span>
      <button
        type="button"
        onClick={() => onChange("all")}
        className={cn(
          "shrink-0 cursor-pointer select-none rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-[0.97]",
          value === "all"
            ? "bg-[#0a1f1a] text-white shadow-sm"
            : "text-[#1a4d42]/65 hover:bg-[#f3f7f5] hover:text-[#0a1f1a]",
        )}
      >
        All grades
      </button>
      {grades.map((grade) => (
        <button
          key={grade}
          type="button"
          onClick={() => onChange(grade)}
          className={cn(
            "shrink-0 cursor-pointer select-none rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-[0.97]",
            value === grade
              ? "bg-[#0a1f1a] text-white shadow-sm"
              : "text-[#1a4d42]/65 hover:bg-[#f3f7f5] hover:text-[#0a1f1a]",
          )}
        >
          {grade}
        </button>
      ))}
    </div>
  );
}
