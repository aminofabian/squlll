"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";

interface TimetableProgressStripProps {
  hasScheduleStructure: boolean;
  hasAnyLessons: boolean;
  conflictCount: number;
  onSetupSchoolDay: () => void;
  onAddFirstLesson: () => void;
  onHighlightProblems: () => void;
}

const steps = [
  { key: "times", label: "School day" },
  { key: "lessons", label: "Lessons" },
  { key: "clashes", label: "Clashes" },
] as const;

export function TimetableProgressStrip({
  hasScheduleStructure,
  hasAnyLessons,
  conflictCount,
  onSetupSchoolDay,
  onAddFirstLesson,
  onHighlightProblems,
}: TimetableProgressStripProps) {
  const done = {
    times: hasScheduleStructure,
    lessons: hasAnyLessons,
    clashes: hasAnyLessons && conflictCount === 0,
  };

  if (done.times && done.lessons && done.clashes) return null;

  return (
    <div
      className={cn(
        tt.panelMuted,
        "flex flex-col gap-3 px-3 py-2.5 sm:flex-row sm:items-center",
      )}
    >
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
      </ol>

      <div className="flex flex-wrap gap-2 sm:ml-auto">
        {!done.times && (
          <Button
            size="sm"
            className="h-8 bg-zinc-900 text-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            onClick={onSetupSchoolDay}
          >
            Set up school day
          </Button>
        )}
        {done.times && !done.lessons && (
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onAddFirstLesson}>
            Add first lesson
          </Button>
        )}
        {done.lessons && !done.clashes && conflictCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-red-200 text-xs text-red-700"
            onClick={onHighlightProblems}
          >
            Show {conflictCount} clash{conflictCount !== 1 ? "es" : ""}
          </Button>
        )}
      </div>
    </div>
  );
}
