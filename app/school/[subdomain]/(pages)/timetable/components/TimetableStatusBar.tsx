"use client";

import { CheckCircle2, Circle, AlertCircle, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";
import { TimetableLastUpdated } from "./TimetableLastUpdated";

interface TimetableStatusBarProps {
  hasScheduleStructure: boolean;
  hasAnyLessons: boolean;
  conflictCount: number;
  onAddFirstLesson: () => void;
  onHighlightProblems: () => void;
  classLabel?: string;
  streamName?: string | null;
  filledSlots?: number;
  totalSlots?: number;
  totalLessons?: number;
  periodCount?: number;
  lastUpdatedIso?: string | null;
}

const steps = [
  { key: "times", label: "Lesson times" },
  { key: "lessons", label: "Lessons added" },
  { key: "clashes", label: "No clashes" },
] as const;

export function TimetableStatusBar({
  hasScheduleStructure,
  hasAnyLessons,
  conflictCount,
  onAddFirstLesson,
  onHighlightProblems,
  classLabel,
  streamName,
  filledSlots = 0,
  totalSlots = 0,
  totalLessons = 0,
  periodCount = 0,
  lastUpdatedIso,
}: TimetableStatusBarProps) {
  const done = {
    times: hasScheduleStructure,
    lessons: hasAnyLessons,
    clashes: hasAnyLessons && conflictCount === 0,
  };

  const showProgress = !(done.times && done.lessons && done.clashes);
  const showClassContext = !!classLabel;

  if (!showProgress && !showClassContext) return null;

  const fillPct =
    totalSlots > 0
      ? Math.min(100, Math.round((filledSlots / totalSlots) * 100))
      : 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-slate-50/50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/40 lg:flex-row lg:items-center lg:justify-between",
      )}
    >
      {showProgress && (
        <ol className="flex flex-wrap items-center gap-3">
          {steps.map((step) => {
            const isDone =
              step.key === "times"
                ? done.times
                : step.key === "lessons"
                  ? done.lessons
                  : done.clashes;
            return (
              <li key={step.key} className="flex items-center gap-1.5">
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="h-3.5 w-3.5 shrink-0 text-zinc-300 dark:text-zinc-600" />
                )}
                <span
                  className={cn(
                    "text-[12px] font-medium tracking-tight",
                    isDone
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-zinc-600 dark:text-zinc-400",
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
          {done.times && !done.lessons && (
            <Button
              size="sm"
              variant="outline"
              className="ml-1 h-7 text-xs"
              onClick={onAddFirstLesson}
            >
              Add first lesson
            </Button>
          )}
          {done.lessons && !done.clashes && conflictCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="ml-1 h-7 border-red-200 text-xs text-red-700"
              onClick={onHighlightProblems}
            >
              Show {conflictCount} clash{conflictCount !== 1 ? "es" : ""}
            </Button>
          )}
        </ol>
      )}

      {showClassContext && (
        <div
          className={cn(
            "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5",
            showProgress && "lg:border-l lg:border-zinc-200/80 lg:pl-4 dark:lg:border-zinc-700",
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
              <div className="min-w-[4.5rem]">
                <p className={tt.label}>Filled</p>
                <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {filledSlots}/{totalSlots} ({fillPct}%)
                </p>
              </div>
            )}
            <div className="min-w-[4.5rem]">
              <p className={tt.label}>Lessons</p>
              <p className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                <BookOpen className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                {totalLessons}
              </p>
            </div>
            <div className="min-w-[4.5rem]">
              <p className={tt.label}>Lessons per day</p>
              <p className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                <Clock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                {periodCount}
              </p>
            </div>
            <div className="min-w-[4.5rem]">
              <p className={tt.label}>Clashes</p>
              <p
                className={cn(
                  "mt-0.5 flex items-center gap-1 text-[13px] font-semibold tabular-nums",
                  conflictCount > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-500",
                )}
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                {conflictCount > 0 ? conflictCount : "None"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
