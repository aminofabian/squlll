"use client";

import type { DashboardGrowthPoint } from "@/lib/superadmin/types";
import { GrowthSkeleton } from "./DashboardSkeletons";

interface DashboardGrowthChartProps {
  growth: DashboardGrowthPoint[];
  periodLabel: string;
  loading?: boolean;
}

export function DashboardGrowthChart({
  growth,
  periodLabel,
  loading,
}: DashboardGrowthChartProps) {
  if (loading) {
    return <GrowthSkeleton />;
  }

  const maxGrowth = Math.max(...growth.map((point) => point.count), 1);

  if (growth.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/60 bg-white p-8 text-center shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          No growth data yet
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Schools will appear here as they are registered
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          School growth
        </h2>
        <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
          {periodLabel}
        </p>
      </div>
      <div className="space-y-4 p-5">
        {growth.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {item.month}
              </span>
              <span className="text-xs font-bold tabular-nums text-slate-800 dark:text-slate-200">
                {item.count}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary/70 via-primary to-primary-dark transition-all duration-700 ease-out"
                style={{ width: `${(item.count / maxGrowth) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
