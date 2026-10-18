"use client";

import type { ReactNode } from "react";
import type { HeroMetric } from "@/lib/timetable/weekView/buildHeroMetrics";
import { WEEK_CARD_CLASS } from "./weekCardClass";

type WeekMobileHeaderProps = {
  eyebrow: string;
  greeting: string;
  subtitle: string;
  metrics: HeroMetric[];
  actions?: ReactNode;
};

export function WeekMobileHeader({ eyebrow, greeting, subtitle, metrics, actions }: WeekMobileHeaderProps) {
  return (
    <header>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#5b6862] dark:text-white/60">{eyebrow}</p>
          <h1 className="mt-1 text-[24px] font-bold leading-tight tracking-[-0.02em] text-[#111a16] dark:text-white">{greeting}</h1>
          <p className="mt-0.5 text-[12.5px] leading-snug text-[#4a5751] dark:text-white/65">{subtitle}</p>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
      </div>
      <dl className={`${WEEK_CARD_CLASS} mt-3 grid grid-cols-3 divide-x divide-[#e3e7e1] py-2.5 text-center dark:divide-white/10`}>
        {metrics.map((metric) => (
          <div key={metric.label} className="flex flex-col-reverse leading-tight">
            <dt className="text-[11px] text-[#5b6862] dark:text-white/60">{metric.label}</dt>
            <dd className="text-[18px] font-bold tabular-nums text-[#111a16] dark:text-white">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
