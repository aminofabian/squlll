"use client";

import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CreditCard,
  Minus,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityType, DashboardStat } from "@/lib/superadmin/types";
import { ACTIVITY_STYLES } from "@/lib/superadmin/mapDashboardData";
import { StatCardSkeleton } from "./DashboardSkeletons";

function ActivityIcon({ type }: { type: ActivityType }) {
  const styles = ACTIVITY_STYLES[type] ?? ACTIVITY_STYLES.system;
  const className = cn("h-4 w-4", styles.icon);

  switch (type) {
    case "tenant":
      return <Building2 className={className} />;
    case "subscription":
      return <CreditCard className={className} />;
    case "user":
      return <Users className={className} />;
    case "plan":
      return <TrendingUp className={className} />;
    default:
      return <Activity className={className} />;
  }
}

function TrendBadge({
  trend,
}: {
  trend: NonNullable<DashboardStat["trend"]>;
}) {
  if (trend.direction === "up") {
    return (
      <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-950/40">
        <ArrowUpRight className="h-3 w-3" />
        {trend.value}
      </span>
    );
  }

  if (trend.direction === "down") {
    return (
      <span className="flex items-center gap-0.5 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-950/40">
        <ArrowDownRight className="h-3 w-3" />
        {trend.value}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <Minus className="h-3 w-3" />
      {trend.value}
    </span>
  );
}

interface DashboardStatCardsProps {
  stats: DashboardStat[];
  loading?: boolean;
}

export function DashboardStatCards({ stats, loading }: DashboardStatCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link
            key={stat.id}
            href={stat.href}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br p-5 shadow-sm transition-all duration-200 hover:border-slate-300/80 hover:shadow-md dark:border-slate-800/60 dark:from-slate-900 dark:to-slate-900/80 dark:hover:border-slate-700/80",
              stat.bgGradient,
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 shadow-sm backdrop-blur transition-transform duration-200 group-hover:scale-110 dark:bg-slate-800/80">
                <Icon className={cn("h-5 w-5", stat.color)} />
              </div>
              {stat.trend ? <TrendBadge trend={stat.trend} /> : null}
            </div>
            <p className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {stat.value}
            </p>
            {stat.helperText ? (
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                {stat.helperText}
              </p>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

export { ActivityIcon };

interface DashboardErrorBannerProps {
  message: string;
  onRetry: () => void;
  variant?: "error" | "warning";
}

export function DashboardErrorBanner({
  message,
  onRetry,
  variant = "error",
}: DashboardErrorBannerProps) {
  const isWarning = variant === "warning";

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-2xl border p-5 shadow-sm",
        isWarning
          ? "border-amber-200/60 bg-amber-50/80 dark:border-amber-800/40 dark:bg-amber-950/30"
          : "border-red-200/60 bg-red-50/80 dark:border-red-800/40 dark:bg-red-950/30",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl",
          isWarning
            ? "bg-amber-100 dark:bg-amber-900/40"
            : "bg-red-100 dark:bg-red-900/40",
        )}
      >
        <AlertCircle
          className={cn(
            "h-5 w-5",
            isWarning ? "text-amber-500" : "text-red-500",
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-semibold",
            isWarning
              ? "text-amber-800 dark:text-amber-300"
              : "text-red-800 dark:text-red-300",
          )}
        >
          {isWarning ? "Some data unavailable" : "Could not load dashboard"}
        </p>
        <p
          className={cn(
            "mt-0.5 text-xs",
            isWarning
              ? "text-amber-700 dark:text-amber-400"
              : "text-red-600 dark:text-red-400",
          )}
        >
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className={cn(
          "h-8 rounded-md border px-3 text-xs transition-colors",
          isWarning
            ? "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/50"
            : "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/50",
        )}
      >
        Try again
      </button>
    </div>
  );
}
