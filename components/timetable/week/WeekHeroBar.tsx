"use client";

import type { ReactNode } from "react";
import { WeekProgressRing } from "./WeekProgressRing";

const PERCENT = 100;

export type WeekHeroMetric = { label: string; value: string };

type WeekHeroBarProps = {
  eyebrow: string;
  greeting: string;
  subtitle: string;
  metrics: WeekHeroMetric[];
  completedLessons: number;
  totalLessons: number;
  completedLabel: string;
  actions?: ReactNode;
};

export function WeekHeroBar({
  eyebrow,
  greeting,
  subtitle,
  metrics,
  completedLessons,
  totalLessons,
  completedLabel,
  actions,
}: WeekHeroBarProps) {
  const completedPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * PERCENT) : 0;

  return (
    <header className="relative isolate flex items-center gap-6 overflow-hidden rounded-xl bg-[#0a2620] px-5 py-3 text-white">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(196,154,82,0.25),transparent_62%)]" />
      <div className="relative min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.26em] text-[#d9c49a]">
          <span className="h-1 w-1 rotate-45 bg-[#d9c49a]" aria-hidden />
          {eyebrow}
        </p>
        <h1 className="mt-0.5 truncate font-display text-[24px] leading-tight tracking-[-0.03em] text-[#fbf8ef]">
          {greeting}
          <span className="text-[#d9c49a]">.</span>
          <span className="ml-3 align-middle font-sans text-[11.5px] tracking-normal text-white/45">{subtitle}</span>
        </h1>
      </div>
      <dl className="relative hidden items-center divide-x divide-white/10 xl:flex">
        {metrics.map((metric) => (
          <div key={metric.label} className="px-4 leading-tight">
            <dt className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">{metric.label}</dt>
            <dd className="mt-0.5 font-display text-[20px] tracking-[-0.02em] text-[#fbf8ef]">{metric.value}</dd>
          </div>
        ))}
      </dl>
      <div className="relative flex items-center gap-2.5 border-l border-white/10 pl-5">
        <WeekProgressRing percent={completedPercent} />
        <div className="leading-tight">
          <p className="font-display text-[17px] text-[#fbf8ef]">
            {completedLessons}
            <span className="text-white/35">/{totalLessons}</span>
          </p>
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">{completedLabel}</p>
        </div>
      </div>
      {actions ? <div className="relative flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
