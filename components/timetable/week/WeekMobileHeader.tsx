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
          <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.16em] text-primary/70">{eyebrow}</p>
          <h1 className="mt-1 font-display text-[1.7rem] leading-[1.05] tracking-[-0.015em] text-foreground">{greeting}</h1>
          <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground">{subtitle}</p>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
      </div>
      <dl className={`${WEEK_CARD_CLASS} mt-3 grid grid-cols-3 divide-x divide-border/70 py-3 text-center`}>
        {metrics.map((metric) => (
          <div key={metric.label} className="flex flex-col-reverse leading-tight">
            <dt className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground/80">
              {metric.label}
            </dt>
            <dd className="tp-num text-[1.1rem] font-semibold text-foreground">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
