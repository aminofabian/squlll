"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  loading: boolean;
  lastUpdated?: Date;
  onRefresh: () => void;
}

function formatLastUpdated(date?: Date): string {
  if (!date) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DashboardHeader({
  loading,
  lastUpdated,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Overview of schools, subscriptions, and platform activity
        </p>
        {!loading && lastUpdated ? (
          <p className="text-[11px] text-slate-400">
            Last updated {formatLastUpdated(lastUpdated)}
          </p>
        ) : null}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={loading}
        className="h-9 gap-2 self-start border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
      >
        <RefreshCw
          className={cn("h-3.5 w-3.5", loading && "animate-spin")}
        />
        <span className="text-xs font-medium">
          {loading ? "Refreshing..." : "Refresh"}
        </span>
      </Button>
    </div>
  );
}
