"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";

const PERCENT = 100;

type TeacherWeekLegendProps = {
  weekRangeLabel: string;
  totalLessons: number;
  completedLessons: number;
};

export function TeacherWeekLegend({
  weekRangeLabel,
  totalLessons,
  completedLessons,
}: TeacherWeekLegendProps) {
  const taughtPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * PERCENT) : 0;

  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1a4d42]/8 px-6 pb-4 pt-5 dark:border-white/8">
      <div>
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.26em] text-[#a07a3a] dark:text-[#d9c49a]/70">
          Week of {weekRangeLabel}
        </p>
        <h2 className="mt-1 font-display text-[26px] leading-none tracking-[-0.025em] text-[#0a1f1a] dark:text-white">
          Your week at a glance
        </h2>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <LegendItem swatch={<span className="h-2.5 w-2.5 rounded-[4px] bg-[#0a2620] ring-1 ring-[#c49a52]/50" />} label="Now" />
        <LegendItem swatch={<span className="h-2.5 w-2.5 rounded-[4px] bg-[#fffaf0] ring-2 ring-[#c49a52]/70" />} label="Up next" />
        <LegendItem
          swatch={
            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Check className="h-2 w-2" strokeWidth={4} />
            </span>
          }
          label="Taught"
        />
        <span className="hidden h-6 w-px bg-[#1a4d42]/10 xl:block dark:bg-white/10" aria-hidden />
        <TaughtMeter percent={taughtPercent} completed={completedLessons} total={totalLessons} />
      </div>
    </header>
  );
}

function LegendItem({ swatch, label }: { swatch: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-[#1a4d42]/60 dark:text-white/50">
      {swatch}
      {label}
    </span>
  );
}

function TaughtMeter({ percent, completed, total }: { percent: number; completed: number; total: number }) {
  return (
    <div className="hidden min-w-[132px] xl:block">
      <div className="flex items-baseline justify-between text-[10px] font-medium text-[#1a4d42]/55 dark:text-white/45">
        <span>Taught this week</span>
        <span className="tabular-nums text-[#0a1f1a] dark:text-white">
          {completed}/{total}
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#1a4d42]/8 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#246a59] to-[#c49a52] transition-[width] duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
