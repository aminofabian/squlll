"use client";

interface StudentsSummaryProps {
  total: number;
  active: number;
  filtered: number;
  isLoading?: boolean;
  gradeFilter?: boolean;
}

export function StudentsSummary({
  total,
  active,
  filtered,
  isLoading,
  gradeFilter,
}: StudentsSummaryProps) {
  if (isLoading) {
    return (
      <p className="text-xs text-slate-400">
        <span className="inline-block h-3 w-48 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      </p>
    );
  }

  const parts = [
    `${total} student${total !== 1 ? "s" : ""}`,
    `${active} active`,
  ];

  if (gradeFilter && filtered !== total) {
    parts.push(`${filtered} in grade`);
  }

  return (
    <p
      className="text-xs text-slate-500 dark:text-slate-400"
      aria-label={`Student summary: ${parts.join(", ")}`}
    >
      <span className="font-medium text-slate-600 dark:text-slate-300">
        Summary
      </span>
      <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
      {parts.join(" · ")}
    </p>
  );
}
