"use client";

import type { ReactNode } from "react";
import { AlertCircle, BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";
import { TimetableLastUpdated } from "./TimetableLastUpdated";

interface TimetableClassContextBarProps {
  classLabel: string;
  streamName?: string | null;
  filledSlots: number;
  totalSlots: number;
  totalLessons: number;
  periodCount: number;
  conflictCount: number;
  lastUpdatedIso?: string | null;
}

function StatCell({
  label,
  value,
  icon: Icon,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-[4.5rem]">
      <p className={tt.label}>{label}</p>
      <p
        className={cn(
          "mt-0.5 flex items-center gap-1 text-[13px] font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100",
          valueClassName,
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />}
        {value}
      </p>
    </div>
  );
}

export function TimetableClassContextBar({
  classLabel,
  streamName,
  filledSlots,
  totalSlots,
  totalLessons,
  periodCount,
  conflictCount,
  lastUpdatedIso,
}: TimetableClassContextBarProps) {
  const pct =
    totalSlots > 0 ? Math.min(100, Math.round((filledSlots / totalSlots) * 100)) : 0;

  return (
    <div
      className={cn(
        tt.panelMuted,
        "flex flex-col gap-2 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
      )}
    >
      <div className="min-w-0">
        <p className={tt.label}>Editing</p>
        <p className="text-[14px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {classLabel}
          {streamName ? (
            <span className="font-medium text-zinc-500"> · {streamName}</span>
          ) : null}
        </p>
        <TimetableLastUpdated isoTimestamp={lastUpdatedIso} />
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-5">
        {totalSlots > 0 && (
          <StatCell
            label="Filled"
            value={`${filledSlots}/${totalSlots} (${pct}%)`}
          />
        )}
        <StatCell
          label="Lessons"
          value={totalLessons}
          icon={BookOpen}
        />
        <StatCell label="Periods" value={periodCount} icon={Clock} />
        <StatCell
          label="Clashes"
          value={conflictCount > 0 ? conflictCount : "None"}
          icon={AlertCircle}
          valueClassName={
            conflictCount > 0
              ? "text-red-600 dark:text-red-400"
              : "text-emerald-600 dark:text-emerald-500"
          }
        />
      </div>
    </div>
  );
}
