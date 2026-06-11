"use client";

import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MetricEmptyCta {
  href: string;
  label: string;
  icon?: LucideIcon;
}

interface DashboardAnimatedMetricProps {
  label: string;
  value: number | string;
  suffix?: string;
  accent?: "default" | "live" | "success" | "warm";
  loading?: boolean;
  emptyCta?: MetricEmptyCta;
  className?: string;
  children?: React.ReactNode;
}

const accentStyles = {
  default: "from-slate-50 to-white border-slate-200/80 dark:from-slate-900/60 dark:to-slate-900/30 dark:border-slate-700/80",
  live: "from-emerald-50/90 to-white border-emerald-200/70 dark:from-emerald-950/30 dark:to-slate-900/30 dark:border-emerald-800/50",
  success: "from-[#0073ea]/8 to-white border-[#0073ea]/20 dark:from-[#0073ea]/15 dark:to-slate-900/30",
  warm: "from-amber-50/80 to-white border-amber-200/60 dark:from-amber-950/20 dark:to-slate-900/30",
};

const emptyCtaCardStyles =
  "border-dashed border-[#0073ea]/30 bg-gradient-to-br from-[#0073ea]/10 via-white to-[#0073ea]/5 shadow-sm dark:from-[#0073ea]/20 dark:via-slate-900/80 dark:to-[#0073ea]/10 dark:border-[#0073ea]/35";

function MetricEmptyCtaLink({ href, label, icon: Icon }: MetricEmptyCta) {
  return (
    <Link
      href={href}
      className={cn(
        "group mt-1.5 flex min-h-[2.25rem] w-full items-center gap-2 rounded-lg border border-[#0073ea]/20",
        "bg-[#0073ea]/[0.07] px-2 py-1.5 transition-all duration-200",
        "hover:border-[#0073ea]/35 hover:bg-[#0073ea]/12 hover:shadow-sm",
        "active:scale-[0.99] dark:bg-[#0073ea]/15 dark:hover:bg-[#0073ea]/22",
      )}
    >
      {Icon ? (
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
            "bg-[#0073ea]/12 text-[#0073ea] transition-colors",
            "group-hover:bg-[#0073ea]/20 dark:bg-[#0073ea]/25 dark:text-[#5ba3ff]",
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
      ) : null}
      <span className="min-w-0 flex-1 text-[11px] font-semibold leading-snug text-[#0073ea] dark:text-[#5ba3ff] sm:text-xs">
        {label}
      </span>
      <ChevronRight
        className="h-3.5 w-3.5 shrink-0 text-[#0073ea]/60 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0073ea] dark:text-[#5ba3ff]/70 dark:group-hover:text-[#5ba3ff]"
        aria-hidden
      />
    </Link>
  );
}

export function DashboardAnimatedMetric({
  label,
  value,
  suffix,
  accent = "default",
  loading,
  emptyCta,
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

  const showEmptyCta =
    !loading &&
    emptyCta &&
    typeof value === "number" &&
    value === 0 &&
    !children;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-br px-3 py-2.5 transition-shadow duration-500",
        showEmptyCta ? emptyCtaCardStyles : accentStyles[accent],
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
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-[0.14em]",
          showEmptyCta
            ? "text-[#0073ea]/70 dark:text-[#5ba3ff]/80"
            : "text-slate-400",
        )}
      >
        {label}
      </p>
      {loading ? (
        <div className="mt-1.5 h-7 w-16 animate-pulse rounded bg-slate-200/80 dark:bg-slate-700" />
      ) : children ? (
        <div className="mt-1">{children}</div>
      ) : showEmptyCta ? (
        <MetricEmptyCtaLink {...emptyCta} />
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
