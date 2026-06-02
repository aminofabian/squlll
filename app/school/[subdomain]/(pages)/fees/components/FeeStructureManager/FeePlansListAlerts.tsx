"use client";

import { AlertCircle, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeePlansListStats } from "../../lib/feePlanStats";

const STATS_THRESHOLD = 6;

interface FeePlansListAlertsProps {
  stats: FeePlansListStats;
  className?: string;
}

export function FeePlansListAlerts({ stats, className }: FeePlansListAlertsProps) {
  const showStats = stats.totalPlans >= STATS_THRESHOLD;
  const showUnlinked = stats.unlinkedPlans > 0;

  if (!showStats && !showUnlinked) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {showUnlinked ? (
        <div
          className="flex items-start gap-2.5 rounded-lg border border-amber-200/90 bg-amber-50/80 px-3.5 py-2.5 text-sm text-amber-950"
          role="status"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p>
            <span className="font-medium">
              {stats.unlinkedPlans} plan{stats.unlinkedPlans === 1 ? "" : "s"}{" "}
              not linked to classes.
            </span>{" "}
            Open a plan and link grades before sending term invoices.
          </p>
        </div>
      ) : null}

      {showStats ? (
        <p className="text-xs text-slate-500 tabular-nums">
          <Link2 className="mr-1 inline h-3.5 w-3.5 -translate-y-px text-slate-400" />
          {stats.totalPlans} plans · {stats.activePlans} active ·{" "}
          {stats.linkedPlans} linked
          {stats.unlinkedPlans > 0
            ? ` · ${stats.unlinkedPlans} need linking`
            : ""}
        </p>
      ) : null}
    </div>
  );
}
