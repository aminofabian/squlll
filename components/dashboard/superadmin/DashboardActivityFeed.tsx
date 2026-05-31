"use client";

import Link from "next/link";
import { Activity, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardActivityItem } from "@/lib/superadmin/types";
import { ACTIVITY_STYLES } from "@/lib/superadmin/mapDashboardData";
import { ActivityIcon } from "./DashboardStatCards";
import { PanelSkeleton } from "./DashboardSkeletons";

interface DashboardActivityFeedProps {
  activity: DashboardActivityItem[];
  loading?: boolean;
}

export function DashboardActivityFeed({
  activity,
  loading,
}: DashboardActivityFeedProps) {
  if (loading) {
    return (
      <div className="lg:col-span-2">
        <PanelSkeleton rows={5} />
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/60 bg-white p-10 text-center shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80 lg:col-span-2">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <Activity className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          No recent activity
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Platform actions will appear here as schools and users are managed
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80 lg:col-span-2">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Recent activity
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Latest changes across the platform
          </p>
        </div>
        <Link
          href="/dashboard/logs"
          className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {activity.map((item) => {
          const styles =
            ACTIVITY_STYLES[item.type] ?? ACTIVITY_STYLES.system;
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
            >
              <div
                className={cn(
                  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl",
                  styles.iconBg,
                )}
              >
                <ActivityIcon type={item.type} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-snug text-slate-700 dark:text-slate-300">
                  {item.target}
                </p>
                <p className="mt-0.5 text-xs capitalize text-slate-400 dark:text-slate-500">
                  {item.action}
                </p>
              </div>
              <span className="flex-shrink-0 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {item.timestamp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
