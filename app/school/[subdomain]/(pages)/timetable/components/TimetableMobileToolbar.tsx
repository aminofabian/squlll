"use client";

import type { ReactNode } from "react";
import { Eye, EyeOff, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type TimetableMobileActionStripProps = {
  onAddLessons?: () => void;
  showConflicts: boolean;
  conflictCount: number;
  onToggleConflicts: () => void;
  moreMenu: ReactNode;
  className?: string;
};

/** Slim blended action row — sits under the class header on mobile grade view. */
export function TimetableMobileActionStrip({
  onAddLessons,
  showConflicts,
  conflictCount,
  onToggleConflicts,
  moreMenu,
  className,
}: TimetableMobileActionStripProps) {
  return (
    <div
      className={cn(
        "flex items-stretch border-t border-b border-slate-100/90 bg-white px-2 lg:hidden dark:border-slate-800/80 dark:bg-slate-950",
        className,
      )}
    >
      {onAddLessons ? (
        <>
          <button
            type="button"
            onClick={onAddLessons}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 py-4 text-[13px] font-medium text-slate-600 transition-colors active:bg-slate-50 dark:text-slate-400 dark:active:bg-slate-900"
          >
            <Plus className="h-4 w-4 opacity-80" strokeWidth={1.75} />
            Add
          </button>
          <div className="w-px shrink-0 bg-slate-100 dark:bg-slate-800" aria-hidden />
        </>
      ) : null}

      <button
        type="button"
        onClick={onToggleConflicts}
        className={cn(
          "flex min-w-0 flex-1 items-center justify-center gap-2 py-4 text-[13px] font-medium transition-colors active:bg-slate-50 dark:active:bg-slate-900",
          showConflicts
            ? "text-primary"
            : "text-slate-600 dark:text-slate-400",
        )}
      >
        {showConflicts ? (
          <EyeOff className="h-4 w-4 opacity-80" strokeWidth={1.75} />
        ) : (
          <Eye className="h-4 w-4 opacity-80" strokeWidth={1.75} />
        )}
        {conflictCount > 0 ? conflictCount : "Issues"}
      </button>

      <div className="w-px shrink-0 bg-slate-100 dark:bg-slate-800" aria-hidden />

      <div className="flex min-w-0 flex-1">{moreMenu}</div>
    </div>
  );
}

type TimetableMobileOverviewBarProps = {
  onOpenClasses: () => void;
  trailing?: ReactNode;
};

/** Minimal title row when viewing whole-school timetable on mobile. */
export function TimetableMobileOverviewBar({
  onOpenClasses,
  trailing,
}: TimetableMobileOverviewBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100/90 bg-white px-5 py-4 lg:hidden dark:border-slate-800/80 dark:bg-slate-950">
      <h1 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        Timetable
      </h1>
      <div className="flex items-center gap-2">
        {trailing}
        <button
          type="button"
          onClick={onOpenClasses}
          className="text-[13px] font-medium text-primary active:opacity-60"
        >
          Classes
        </button>
      </div>
    </div>
  );
}
