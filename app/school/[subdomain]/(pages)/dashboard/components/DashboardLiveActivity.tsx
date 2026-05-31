"use client";

import { Radio, Users, BookOpenCheck } from "lucide-react";
import { useTenantLiveStats } from "@/lib/realtime/useTenantLiveStats";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { cn } from "@/lib/utils";

export function DashboardLiveActivity() {
  const { stats, loading } = useTenantLiveStats();
  const { connected } = useRealtime();

  const teachersOnline = stats.onlineTeachers;
  const lessonsToday = stats.lessonsCompletedToday;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border px-4 py-3 text-sm",
        connected
          ? "border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
          : "border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/40",
      )}
    >
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
        <Radio
          className={cn(
            "h-4 w-4",
            connected ? "text-emerald-600" : "text-slate-400",
          )}
        />
        <span className="font-medium text-slate-800 dark:text-slate-100">
          Live
        </span>
        <span className="text-xs text-slate-500">
          {connected ? "Connected" : "Reconnecting…"}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
        <Users className="h-4 w-4 text-slate-400" />
        <span>
          {loading ? "…" : teachersOnline}{" "}
          {teachersOnline === 1 ? "teacher" : "teachers"} online
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
        <BookOpenCheck className="h-4 w-4 text-slate-400" />
        <span>
          {loading ? "…" : lessonsToday}{" "}
          {lessonsToday === 1 ? "lesson" : "lessons"} completed today
        </span>
      </div>

      {!loading && stats.onlineTotal > teachersOnline ? (
        <span className="text-xs text-slate-400">
          {stats.onlineTotal} users connected school-wide
        </span>
      ) : null}
    </div>
  );
}
