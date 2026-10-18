"use client";

export function WeekLegend({
  weekRangeLabel,
  totalLessons,
  completedLessons,
  viewType,
}: {
  weekRangeLabel: string;
  totalLessons: number;
  completedLessons: number;
  viewType: string;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[#1a4d42]/10 px-4 py-3 dark:border-white/10">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a07a3a]">
          Week of {weekRangeLabel}
        </p>
        <h2 className="mt-0.5 font-display text-[20px] tracking-tight text-[#0a1f1a] dark:text-white">
          Your week at a glance
        </h2>
      </div>
      <p className="text-[10px] font-medium text-[#1a4d42]/50 dark:text-white/40">
        {completedLessons}/{totalLessons} {viewType === "student" ? "done" : "taught"}
      </p>
    </header>
  );
}
