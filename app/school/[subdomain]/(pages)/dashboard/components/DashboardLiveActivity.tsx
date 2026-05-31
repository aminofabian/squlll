"use client";

import { Radio, Users, BookOpenCheck } from "lucide-react";
import { useTenantLiveStats } from "@/lib/realtime/useTenantLiveStats";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { cn } from "@/lib/utils";

interface DashboardLiveActivityProps {
  compact?: boolean;
}

export function DashboardLiveActivity({ compact = false }: DashboardLiveActivityProps) {
  const { stats, loading } = useTenantLiveStats();
  const { connected } = useRealtime();

  const teachersOnline = stats.onlineTeachers;
  const lessonsToday = stats.lessonsCompletedToday;

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 overflow-x-auto text-[11px] text-slate-600 dark:text-slate-300",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
        aria-label="Live activity"
      >
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-medium",
            connected
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
          )}
        >
          <Radio className="h-3 w-3" />
          {connected ? "Live" : "Offline"}
        </span>
        <span className="shrink-0 tabular-nums">
          {loading ? "…" : teachersOnline} online
        </span>
        <span className="shrink-0 text-slate-300 dark:text-slate-600">·</span>
        <span className="shrink-0 tabular-nums">
          {loading ? "…" : lessonsToday} lessons today
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-2.5 py-2 text-xs",
        connected
          ? "border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/15"
          : "border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/40",
      )}
    >
      <div className="flex items-center gap-1.5">
        <Radio
          className={cn(
            "h-3.5 w-3.5",
            connected ? "text-emerald-600" : "text-slate-400",
          )}
        />
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {connected ? "Connected" : "Reconnecting"}
        </span>
      </div>
      <span className="text-slate-300 dark:text-slate-600">·</span>
      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
        <Users className="h-3.5 w-3.5 text-slate-400" />
        <span>{loading ? "…" : teachersOnline} teachers online</span>
      </div>
      <span className="hidden text-slate-300 dark:text-slate-600 sm:inline">·</span>
      <div className="hidden items-center gap-1 text-slate-600 dark:text-slate-300 sm:flex">
        <BookOpenCheck className="h-3.5 w-3.5 text-slate-400" />
        <span>{loading ? "…" : lessonsToday} lessons today</span>
      </div>
    </div>
  );
}
