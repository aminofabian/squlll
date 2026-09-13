"use client";

import type { ReactNode } from "react";
import { AlertCircle, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";

type TimetableMobileActionStripProps = {
  onAddLessons?: () => void;
  onAutoGenerate?: () => void;
  showConflicts: boolean;
  conflictCount: number;
  onToggleConflicts: () => void;
  moreMenu: ReactNode;
  className?: string;
};

/** Slim blended action row — sits under the class header on mobile grade view. */
export function TimetableMobileActionStrip({
  onAddLessons,
  onAutoGenerate,
  showConflicts,
  conflictCount,
  onToggleConflicts,
  moreMenu,
  className,
}: TimetableMobileActionStripProps) {
  return (
    <div
      className={cn(
        "flex items-stretch border-t border-b bg-white px-2 lg:hidden dark:bg-[#0c1a17]",
        tt.border.hair,
        className,
      )}
    >
      {onAddLessons ? (
        <>
          <button
            type="button"
            onClick={onAddLessons}
            className={cn(
              tt.text.body,
              tt.focus,
              tt.ink.base,
              "flex min-w-0 flex-1 items-center justify-center gap-2 py-4 font-medium transition-colors active:bg-[#e8f2ef] dark:active:bg-white/5",
            )}
          >
            <Plus className="h-4 w-4 opacity-80" strokeWidth={1.75} />
            Add lessons
          </button>
          <div
            className="w-px shrink-0 bg-[#e8f2ef] dark:bg-white/10"
            aria-hidden
          />
        </>
      ) : null}

      {onAutoGenerate ? (
        <>
          <button
            type="button"
            onClick={onAutoGenerate}
            className={cn(
              tt.text.body,
              tt.focus,
              "flex min-w-0 flex-1 items-center justify-center gap-2 py-4 font-medium text-[#246a59] transition-colors active:bg-[#246a59]/10",
            )}
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            Auto-fill timetable
          </button>
          <div
            className="w-px shrink-0 bg-[#e8f2ef] dark:bg-white/10"
            aria-hidden
          />
        </>
      ) : null}

      <button
        type="button"
        onClick={onToggleConflicts}
        aria-pressed={showConflicts}
        className={cn(
          tt.text.body,
          tt.focus,
          "flex min-w-0 flex-1 items-center justify-center gap-2 py-4 font-medium transition-colors",
          showConflicts
            ? conflictCount > 0
              ? "bg-red-600 text-white dark:bg-red-500"
              : "bg-[#0a1f1a] text-white dark:bg-[#246a59]"
            : conflictCount > 0
              ? "text-red-600 active:bg-red-50 dark:text-red-400 dark:active:bg-red-950/40"
              : cn(tt.ink.base, "active:bg-[#e8f2ef] dark:active:bg-white/5"),
        )}
      >
        <AlertCircle className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
        {showConflicts
          ? "Hide issues"
          : conflictCount > 0
            ? `${conflictCount} issue${conflictCount === 1 ? "" : "s"}`
            : "No issues"}
      </button>

      <div
        className="w-px shrink-0 bg-[#e8f2ef] dark:bg-white/10"
        aria-hidden
      />

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
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b bg-white px-5 py-4 lg:hidden dark:bg-[#0c1a17]",
        tt.border.hair,
      )}
    >
      <h1 className={cn(tt.text.title, tt.ink.strong)}>Timetable</h1>
      <div className="flex items-center gap-2">
        {trailing}
        <button
          type="button"
          onClick={onOpenClasses}
          className={cn(
            tt.text.body,
            tt.focus,
            "font-medium text-primary active:opacity-60",
          )}
        >
          Classes
        </button>
      </div>
    </div>
  );
}
