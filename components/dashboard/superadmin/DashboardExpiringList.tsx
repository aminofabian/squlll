"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DashboardExpiringItem } from "@/lib/superadmin/types";
import { PanelSkeleton } from "./DashboardSkeletons";

interface DashboardExpiringListProps {
  expiring: DashboardExpiringItem[];
  loading?: boolean;
}

export function DashboardExpiringList({
  expiring,
  loading,
}: DashboardExpiringListProps) {
  if (loading) {
    return <PanelSkeleton rows={3} />;
  }

  if (expiring.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/60 bg-white p-10 text-center shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
          <CalendarDays className="h-6 w-6 text-emerald-500" />
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          All subscriptions healthy
        </p>
        <p className="mt-1 text-xs text-slate-400">
          No subscriptions expiring in the next 30 days
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Needs attention
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Subscriptions expiring within 30 days
          </p>
        </div>
        <Link
          href="/dashboard/subscriptions"
          className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {expiring.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
          >
            <div
              className={cn(
                "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl",
                item.daysLeft <= 7
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-amber-100 dark:bg-amber-900/30",
              )}
            >
              <CalendarDays
                className={cn(
                  "h-4 w-4",
                  item.daysLeft <= 7 ? "text-red-600" : "text-amber-600",
                )}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-snug text-slate-700 dark:text-slate-300">
                {item.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                {item.plan} · Expires {item.expires}
              </p>
            </div>
            <Badge
              variant={item.daysLeft <= 7 ? "destructive" : "secondary"}
              className="flex-shrink-0 px-2.5 text-[10px] font-semibold uppercase"
            >
              {item.daysLeft}d
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
