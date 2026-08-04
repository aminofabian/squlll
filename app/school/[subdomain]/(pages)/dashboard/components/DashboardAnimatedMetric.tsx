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

const accentValue: Record<
  NonNullable<DashboardAnimatedMetricProps["accent"]>,
  string
> = {
  default: "text-[#0a1f1a] dark:text-white",
  live: "text-emerald-700 dark:text-emerald-300",
  success: "text-[#246a59] dark:text-emerald-300",
  warm: "text-amber-800 dark:text-amber-300",
};

function MetricEmptyCtaLink({ href, label, icon: Icon }: MetricEmptyCta) {
  return (
    <Link
      href={href}
      className={cn(
        "group mt-1 inline-flex max-w-full items-center gap-1 text-[11px] font-medium text-[#246a59]",
        "transition-colors hover:text-[#1a4d42] dark:text-emerald-300",
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} /> : null}
      <span className="truncate">{label}</span>
      <ChevronRight
        className="h-3.5 w-3.5 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5"
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
        "relative px-3 py-2.5 transition-[background-color] duration-500 sm:px-4",
        pulse && "bg-[#246a59]/[0.05]",
        className,
      )}
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/50 dark:text-white/40">
        {label}
      </p>
      {loading ? (
        <div className="mt-1.5 h-6 w-12 animate-pulse bg-[#1a4d42]/10 dark:bg-white/10" />
      ) : children ? (
        <div className="mt-1">{children}</div>
      ) : showEmptyCta ? (
        <MetricEmptyCtaLink {...emptyCta} />
      ) : (
        <p
          className={cn(
            "mt-1 font-display text-[1.35rem] tabular-nums tracking-tight leading-none sm:text-[1.5rem]",
            accentValue[accent],
          )}
        >
          {display}
          {suffix ? (
            <span className="ml-0.5 text-sm font-medium text-[#1a4d42]/40">
              {suffix}
            </span>
          ) : null}
        </p>
      )}
    </div>
  );
}
