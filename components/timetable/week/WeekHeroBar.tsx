"use client";

import type { ReactNode } from "react";
import type { HeroMetric } from "@/lib/timetable/weekView/buildHeroMetrics";
import { WEEK_CARD_CLASS } from "./weekCardClass";

type WeekHeroBarProps = {
  eyebrow: string;
  greeting: string;
  subtitle: string;
  metrics: HeroMetric[];
  actions?: ReactNode;
};

export function WeekHeroBar({ eyebrow, greeting, subtitle, metrics, actions }: WeekHeroBarProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b6862] dark:text-white/60">{eyebrow}</p>
        <h1 className="mt-1 truncate text-[30px] font-bold leading-tight tracking-[-0.02em] text-[#111a16] dark:text-white">
          {greeting}
        </h1>
        <p className="mt-0.5 text-[13px] text-[#4a5751] dark:text-white/65">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className={`${WEEK_CARD_CLASS} flex divide-x divide-[#e3e7e1] py-2 dark:divide-white/10`}>
          {metrics.map((metric) => (
            <div key={metric.label} className="px-4 leading-tight">
              <p className="text-[20px] font-bold tabular-nums text-[#111a16] dark:text-white">{metric.value}</p>
              <p className="text-[11px] text-[#5b6862] dark:text-white/60">{metric.label}</p>
            </div>
          ))}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
