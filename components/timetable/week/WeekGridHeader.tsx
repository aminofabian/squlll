"use client";

const PERCENT = 100;

type WeekGridHeaderProps = {
  weekRangeLabel: string;
  completedLessons: number;
  totalLessons: number;
  completedLabel: string;
};

export function WeekGridHeader({ weekRangeLabel, completedLessons, totalLessons, completedLabel }: WeekGridHeaderProps) {
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * PERCENT) : 0;

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 pb-2 pt-3.5">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[#111a16] dark:text-white">Week at a glance</h2>
        <p className="text-[12px] text-[#5b6862] dark:text-white/60">{weekRangeLabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11.5px] text-[#5b6862] dark:text-white/60">{completedLabel} this week</span>
        <span aria-hidden className="h-1.5 w-28 overflow-hidden rounded-full bg-[#e6e9e4] dark:bg-white/10">
          <span className="block h-full rounded-full bg-[#111a17] transition-[width] duration-700 dark:bg-white" style={{ width: `${percent}%` }} />
        </span>
        <span className="text-[12px] font-bold tabular-nums text-[#111a16] dark:text-white">
          {completedLessons} / {totalLessons}
        </span>
      </div>
    </header>
  );
}
