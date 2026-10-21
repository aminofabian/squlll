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
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/70">{eyebrow}</p>
        <h1 className="mt-1.5 truncate font-display text-[2rem] leading-[1.05] tracking-[-0.015em] text-foreground">
          {greeting}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className={`${WEEK_CARD_CLASS} flex divide-x divide-border/70 py-2`}>
          {metrics.map((metric) => (
            <div key={metric.label} className="px-4 leading-tight">
              <p className="tp-num text-[1.2rem] font-semibold text-foreground">{metric.value}</p>
              <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground/80">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
