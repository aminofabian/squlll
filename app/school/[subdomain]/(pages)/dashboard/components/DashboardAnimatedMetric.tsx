"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface DashboardAnimatedMetricProps {
  label: string;
  value: number | string;
  suffix?: string;
  accent?: "default" | "live" | "success" | "warm";
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const accentStyles = {
  default: "from-slate-50 to-white border-slate-200/80 dark:from-slate-900/60 dark:to-slate-900/30 dark:border-slate-700/80",
  live: "from-emerald-50/90 to-white border-emerald-200/70 dark:from-emerald-950/30 dark:to-slate-900/30 dark:border-emerald-800/50",
  success: "from-[#0073ea]/8 to-white border-[#0073ea]/20 dark:from-[#0073ea]/15 dark:to-slate-900/30",
  warm: "from-amber-50/80 to-white border-amber-200/60 dark:from-amber-950/20 dark:to-slate-900/30",
};

export function DashboardAnimatedMetric({
  label,
  value,
  suffix,
  accent = "default",
  loading,
  className,
  children,
}: DashboardAnimatedMetricProps) {
  const [pulse, setPulse] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (loading || prev.current === value) return;
    prev.current = value;
    setPulse(true);
    const t = window.setTimeout(() => setPulse(false), 700);
    return () => window.clearTimeout(t);
  }, [value, loading]);

  const display =
    typeof value === "number" ? value.toLocaleString("en-KE") : value;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-br px-3 py-2.5 transition-shadow duration-500",
        accentStyles[accent],
        pulse && "ring-2 ring-[#0073ea]/25 shadow-md",
        className,
      )}
    >
      {pulse ? (
        <span
          className="pointer-events-none absolute inset-0 animate-pulse bg-[#0073ea]/5"
          aria-hidden
        />
      ) : null}
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      {loading ? (
        <div className="mt-1.5 h-7 w-16 animate-pulse rounded bg-slate-200/80 dark:bg-slate-700" />
      ) : children ? (
        <div className="mt-1">{children}</div>
      ) : (
        <p className="mt-0.5 text-xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
          {display}
          {suffix ? (
            <span className="ml-0.5 text-sm font-semibold text-slate-400">
              {suffix}
            </span>
          ) : null}
        </p>
      )}
    </div>
  );
}
