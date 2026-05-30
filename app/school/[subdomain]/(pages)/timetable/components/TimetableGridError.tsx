"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";

interface TimetableGridErrorProps {
  /** Primary message shown in the error panel */
  title?: string;
  /** Detailed explanation */
  description?: string;
  /** Called when the user clicks Retry */
  onRetry?: () => void;
  /** Optional: compact mode for sidebar / inline use */
  compact?: boolean;
  className?: string;
}

export function TimetableGridError({
  title = "Failed to load timetable",
  description = "Something went wrong while loading the schedule. Check your connection and try again.",
  onRetry,
  compact = false,
  className,
}: TimetableGridErrorProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-red-200/70 bg-red-50/60 px-3 py-2 text-sm text-red-700",
          "dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400",
          className,
        )}
        role="alert"
      >
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">{title}</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-7 shrink-0 gap-1 px-2 text-xs text-red-600 hover:bg-red-100/80 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/40"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-red-200/80 bg-red-50/40 px-6 py-12 text-center",
        "dark:border-red-900/50 dark:bg-red-950/20",
        className,
      )}
      role="alert"
    >
      <div className="mb-3 rounded-full bg-red-100 p-3 dark:bg-red-900/40">
        <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
      </div>
      <h3 className={cn(tt.label, "mb-1 text-base font-semibold text-red-800 dark:text-red-300")}>
        {title}
      </h3>
      <p className="mb-4 max-w-md text-sm text-red-600/80 dark:text-red-400/70">
        {description}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="gap-2 border-red-200 text-red-700 hover:bg-red-100/80 hover:text-red-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/40"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}

/** Spinner shown inside an error component during auto-retry */
export function RetryingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs text-slate-500",
        className,
      )}
      role="status"
      aria-label="Retrying"
    >
      <RefreshCw className="h-3 w-3 animate-spin" />
      Retrying…
    </div>
  );
}
