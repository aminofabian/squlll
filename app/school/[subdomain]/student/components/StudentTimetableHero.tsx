"use client";

import { CalendarDays, GraduationCap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StudentTimetableHeroProps {
  formattedDate: string;
  gradeName: string;
  streamName?: string | null;
  termName?: string;
  completionPercent: number;
  completedCount: number;
  totalLessons: number;
  onRefresh?: () => void;
  compact?: boolean;
}

export function StudentTimetableHero({
  formattedDate,
  gradeName,
  streamName,
  termName,
  completionPercent,
  completedCount,
  totalLessons,
  onRefresh,
  compact = false,
}: StudentTimetableHeroProps) {
  const classLabel = streamName ? `${gradeName} · ${streamName}` : gradeName;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/90 bg-card shadow-[0_1px_2px_rgba(20,32,28,0.04),0_20px_44px_-34px_rgba(20,32,28,0.35)]",
        compact ? "px-4 py-3.5" : "px-5 py-5 sm:px-6",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          {!compact && (
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-primary/75">
                <GraduationCap className="h-3.5 w-3.5" />
                Student
              </span>
            </div>
          )}
          <h1
            className={cn(
              "tracking-tight text-foreground",
              compact
                ? "font-display text-[1.35rem] leading-tight"
                : "font-display text-[1.9rem] leading-[1.05] tracking-[-0.015em]",
            )}
          >
            My Timetable
          </h1>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {classLabel}
          </p>
          {!compact && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formattedDate}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
          {onRefresh ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={onRefresh}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          ) : null}

          {termName ? (
            <div className="flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              <span className="max-w-[120px] truncate sm:max-w-none">
                {termName}
              </span>
            </div>
          ) : null}

          {totalLessons > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 sm:gap-2.5 sm:px-3 sm:py-2">
              <div className="relative h-9 w-9 sm:h-10 sm:w-10">
                <svg className="h-9 w-9 -rotate-90 sm:h-10 sm:w-10" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    className="stroke-border"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    className="stroke-primary transition-[stroke-dasharray] duration-500"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(completionPercent / 100) * 94.2} 94.2`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-foreground sm:text-[10px]">
                  {completionPercent}%
                </span>
              </div>
              <div className="hidden leading-tight sm:block">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Completed
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {completedCount}
                  <span className="font-normal text-muted-foreground"> / {totalLessons}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
