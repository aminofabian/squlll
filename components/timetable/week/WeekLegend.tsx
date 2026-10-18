"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import type { WeekViewerType } from "@/lib/timetable/weekView/weekViewerType";

const PERCENT = 100;

type WeekLegendProps = {
  weekRangeLabel: string;
  totalLessons: number;
  completedLessons: number;
  viewType: WeekViewerType;
};

export function WeekLegend({
  weekRangeLabel,
  totalLessons,
  completedLessons,
  viewType,
}: WeekLegendProps) {
  const completedLabel = viewType === "teacher" ? "Taught" : "Done";
  const taughtPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * PERCENT) : 0;

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1a4d42]/8 px-4 py-2.5 dark:border-white/8">
      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-[19px] leading-none tracking-[-0.02em] text-[#0a1f1a] dark:text-white">
          Your week at a glance
        </h2>
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#a07a3a] dark:text-[#d9c49a]/70">
          {weekRangeLabel}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <LegendItem swatch={<span className="h-2.5 w-2.5 rounded-sm bg-[#0a2620]" />} label="Now" />
        <LegendItem swatch={<span className="h-2.5 w-2.5 rounded-sm border border-[#c49a52] bg-[#fffaf0]" />} label="Up next" />
        <LegendItem
          swatch={
            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Check className="h-2 w-2" strokeWidth={4} />
            </span>
          }
          label={completedLabel}
        />
        <span className="hidden h-5 w-px bg-[#1a4d42]/10 xl:block dark:bg-white/10" aria-hidden />
        <TaughtMeter label={`${completedLabel} this week`} percent={taughtPercent} completed={completedLessons} total={totalLessons} />
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

function TaughtMeter({ label, percent, completed, total }: { label: string; percent: number; completed: number; total: number }) {
  return (
    <div className="hidden min-w-[132px] xl:block">
      <div className="flex items-baseline justify-between text-[10px] font-medium text-[#1a4d42]/55 dark:text-white/45">
        <span>{label}</span>
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
