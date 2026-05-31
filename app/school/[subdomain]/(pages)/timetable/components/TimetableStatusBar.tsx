"use client";

import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";
import { TimetableLastUpdated } from "./TimetableLastUpdated";
import {
  TimetableTeacherWorkload,
} from "./TimetableTeacherWorkload";
import type { TeacherWeeklyLesson } from "../hooks/useTimetableData";

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
  teacherLessons?: TeacherWeeklyLesson[];
  highlightTeacherId?: string | null;
  onTeacherClick?: (teacherId: string) => void;
}

const steps = [
  { key: "times", label: "Lesson times" },
  { key: "lessons", label: "Lessons added" },
  { key: "clashes", label: "No clashes" },
] as const;

function MetricTile({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  onClick,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "danger" | "primary";
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <span
        className={cn(
          "mt-1 flex items-center justify-center gap-1 text-sm font-semibold tabular-nums leading-none",
          tone === "success" && "text-emerald-600 dark:text-emerald-400",
          tone === "danger" && "text-red-600 dark:text-red-400",
          tone === "primary" && "text-primary",
          (!tone || tone === "default") && "text-slate-900 dark:text-slate-100",
        )}
      >
        {Icon ? (
          <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" strokeWidth={2} />
        ) : null}
        {value}
      </span>
      {hint ? (
        <span className="mt-1 text-[10px] leading-none text-slate-400 dark:text-slate-500">
          {hint}
        </span>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-col items-center px-2 py-3 text-center transition-colors active:bg-slate-50 dark:active:bg-slate-800/50"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex min-w-0 flex-col items-center px-2 py-3 text-center">
      {content}
    </div>
  );
}

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
  teacherLessons = [],
  highlightTeacherId,
  onTeacherClick,
}: TimetableStatusBarProps) {
  const done = {
    times: hasScheduleStructure,
    lessons: hasAnyLessons,
    clashes: hasAnyLessons && conflictCount === 0,
  };

  const showProgress = !(done.times && done.lessons && done.clashes);
  const showClassContext = !!classLabel;
  const showTeacherWorkload = teacherLessons.length > 0;

  if (!showProgress && !showClassContext && !showTeacherWorkload) return null;

  const fillPct =
    totalSlots > 0
      ? Math.min(100, Math.round((filledSlots / totalSlots) * 100))
      : 0;

  const setupProgress = showProgress ? (
    <ol className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800 lg:gap-3 lg:border-0 lg:px-0 lg:py-0">
      {steps.map((step) => {
        const isDone =
          step.key === "times"
            ? done.times
            : step.key === "lessons"
              ? done.lessons
              : done.clashes;
        return (
          <li
            key={step.key}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1",
              isDone
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
            )}
          >
            {isDone ? (
              <CheckCircle2 className="h-3 w-3 shrink-0" />
            ) : (
              <Circle className="h-3 w-3 shrink-0 opacity-50" />
            )}
            <span className="text-[11px] font-medium">{step.label}</span>
          </li>
        );
      })}
      {done.times && !done.lessons && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={onAddFirstLesson}
        >
          Add first lesson
        </Button>
      )}
      {done.lessons && !done.clashes && conflictCount > 0 && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 border-red-200 text-xs text-red-700"
          onClick={onHighlightProblems}
        >
          Show {conflictCount} clash{conflictCount !== 1 ? "es" : ""}
        </Button>
      )}
    </ol>
  ) : null;

  const classContextMobile = showClassContext ? (
    <div
      className={cn(
        "overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)]",
        "dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)]",
        "lg:hidden",
      )}
    >
      {setupProgress}

      <div className="border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Summary
        </p>
        <p className="mt-1 text-[17px] font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-50">
          {classLabel}
          {streamName ? (
            <span className="ml-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              · {streamName}
            </span>
          ) : null}
        </p>
        <div className="mt-2">
          <TimetableLastUpdated isoTimestamp={lastUpdatedIso} />
        </div>
      </div>

      <div
        className={cn(
          "grid divide-x divide-slate-100 dark:divide-slate-800",
          totalSlots > 0 ? "grid-cols-3" : "grid-cols-2",
        )}
      >
        {totalSlots > 0 && (
          <MetricTile
            label="Slots filled"
            value={`${filledSlots}/${totalSlots}`}
            hint={`${fillPct}% full`}
            icon={Layers}
            tone={fillPct >= 100 ? "primary" : "default"}
          />
        )}
        <MetricTile
          label="Lessons"
          value={totalLessons}
          hint="scheduled"
          icon={BookOpen}
        />
        <MetricTile
          label="Periods"
          value={periodCount}
          hint="per day"
          icon={Clock}
        />
      </div>

      <div
        className={cn(
          "flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800",
          conflictCount > 0 ? "bg-red-50/50 dark:bg-red-950/20" : "bg-emerald-50/40 dark:bg-emerald-950/15",
        )}
      >
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
            Schedule clashes
          </p>
          <p
            className={cn(
              "mt-0.5 text-sm font-semibold",
              conflictCount > 0
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400",
            )}
          >
            {conflictCount > 0
              ? `${conflictCount} clash${conflictCount !== 1 ? "es" : ""} found`
              : "No clashes found"}
          </p>
        </div>
        {conflictCount > 0 ? (
          <button
            type="button"
            onClick={onHighlightProblems}
            className={cn(
              "shrink-0 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700",
              "transition-colors active:bg-red-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300",
            )}
          >
            Show clashes
          </button>
        ) : (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
            aria-hidden
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
          </span>
        )}
      </div>

      {showTeacherWorkload ? (
        <TimetableTeacherWorkload
          teachers={teacherLessons}
          highlightTeacherId={highlightTeacherId}
          onTeacherClick={onTeacherClick}
          className="border-t border-slate-100 dark:border-slate-800"
        />
      ) : null}
    </div>
  ) : null;

  const classContextDesktop = showClassContext ? (
    <div
      className={cn(
        "hidden min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5 lg:flex",
        showProgress &&
          "lg:border-l lg:border-zinc-200/80 lg:pl-4 dark:lg:border-zinc-700",
      )}
    >
      <div className="min-w-0">
        <p className={tt.label}>Summary</p>
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
          <div
            className="min-w-[4.5rem]"
            title={`${filledSlots} of ${totalSlots} time slots filled`}
          >
            <p className={tt.label}>Slots filled</p>
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
          <p className={tt.label}>Periods per day</p>
          <p className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            <Clock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            {periodCount}
          </p>
        </div>
        <div className="min-w-[4.5rem]">
          <p className={tt.label}>Schedule clashes</p>
          {conflictCount > 0 ? (
            <button
              type="button"
              onClick={onHighlightProblems}
              className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold tabular-nums text-red-600 dark:text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {conflictCount}
            </button>
          ) : (
            <p className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 opacity-70" />
              None
            </p>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      {classContextMobile}

      {(showProgress || classContextDesktop) && (
        <div
          className={cn(
            "hidden flex-col gap-4 rounded-xl border border-slate-200/80 bg-slate-50/50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/40 lg:flex lg:flex-row lg:items-center lg:justify-between",
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
          {classContextDesktop}
        </div>
      )}

      {showTeacherWorkload ? (
        <div
          className={cn(
            "hidden overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)]",
            "dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)]",
            "lg:block",
          )}
        >
          <TimetableTeacherWorkload
            teachers={teacherLessons}
            highlightTeacherId={highlightTeacherId}
            onTeacherClick={onTeacherClick}
          />
        </div>
      ) : null}
    </div>
  );
}
