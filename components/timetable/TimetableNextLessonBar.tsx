"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { NextLessonInfo } from "@/lib/timetable/types";
import {
  getSubjectPaletteColor,
  normalizeSubjectName,
} from "@/lib/timetable/constants";
import { getCountdownParts, getSecondsUntil } from "@/lib/timetable";
import { formatGradeShort } from "./TeacherMobileWeekTable";

function CountdownBadge({ startsAt }: { startsAt: string }) {
  const [totalSeconds, setTotalSeconds] = useState(() =>
    getSecondsUntil(startsAt),
  );

  useEffect(() => {
    const tick = () => setTotalSeconds(getSecondsUntil(startsAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startsAt]);

  const parts = getCountdownParts(totalSeconds);
  const label =
    parts.days > 0
      ? `${parts.days}d ${parts.hours}h`
      : parts.hours > 0
        ? `${parts.hours}h ${parts.minutes}m`
        : `${parts.minutes}m`;

  return (
    <span className="shrink-0 font-mono text-[11px] font-semibold tabular-nums text-primary">
      {label}
    </span>
  );
}

function MetaLine({ items }: { items: string[] }) {
  const visible = items.filter(Boolean);

  if (visible.length === 0) return null;

  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
      {visible.map((value, index) => (
        <React.Fragment key={`${value}-${index}`}>
          {index > 0 ? (
            <span className="text-slate-300 dark:text-slate-600" aria-hidden>
              ·
            </span>
          ) : null}
          <span className="break-words">{value}</span>
        </React.Fragment>
      ))}
    </p>
  );
}

export type TimetableNextLessonBarProps = {
  viewType?: "student" | "teacher";
  nextLesson: NextLessonInfo | null;
  loading?: boolean;
  onRefresh?: () => void;
  className?: string;
};

export function TimetableNextLessonBar({
  viewType = "student",
  nextLesson,
  loading = false,
  onRefresh,
  className,
}: TimetableNextLessonBarProps) {
  const palette = nextLesson
    ? getSubjectPaletteColor(
        normalizeSubjectName(nextLesson.lesson.subject.name),
      )
    : null;

  const day = nextLesson?.dayLabel ?? "";
  const time = nextLesson?.time.replace(/\s*[-–—]\s*/g, "–") ?? "";

  const meta =
    viewType === "teacher"
      ? [
          formatGradeShort(
            nextLesson?.lesson.grade.displayName ?? "",
            nextLesson?.lesson.grade.name ?? "",
          ),
          day,
          time,
        ]
      : [nextLesson?.lesson.teacher.name ?? "", day, time];

  const emptyLabel =
    viewType === "teacher"
      ? "No upcoming classes this week"
      : "No upcoming lessons this week";

  return (
    <header
      className={cn(
        "flex w-full shrink-0 items-stretch border-b border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1">
        {loading ? (
          <div className="flex min-h-[58px] w-full items-stretch">
            <Skeleton className="w-0.5 shrink-0 rounded-none" />
            <div className="min-w-0 flex-1 space-y-2 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-2 w-12" />
                <Skeleton className="h-3 w-10" />
              </div>
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-2.5 w-3/5" />
            </div>
          </div>
        ) : nextLesson && palette ? (
          <div className="flex min-w-0 flex-1 items-stretch">
            <div
              className="w-0.5 shrink-0"
              style={{ backgroundColor: palette.accent }}
              aria-hidden
            />
            <div className="min-w-0 flex-1 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                  Up next
                </span>
                <CountdownBadge startsAt={nextLesson.startsAt} />
              </div>
              <p className="mt-1 break-words text-[13px] font-semibold leading-snug text-slate-900 dark:text-slate-100">
                {nextLesson.lesson.subject.name}
              </p>
              <MetaLine items={meta} />
            </div>
          </div>
        ) : (
          <div className="flex min-h-[58px] min-w-0 flex-1 items-center px-3 py-2.5">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {emptyLabel}
            </p>
          </div>
        )}
      </div>

      {onRefresh ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-auto min-h-[58px] w-11 shrink-0 rounded-none border-l border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:text-slate-300"
          onClick={onRefresh}
          aria-label="Refresh timetable"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      ) : null}
    </header>
  );
}

export function TimetableNextLessonBarSkeleton({
  viewType = "student",
}: {
  viewType?: "student" | "teacher";
}) {
  return (
    <TimetableNextLessonBar
      viewType={viewType}
      nextLesson={null}
      loading
      onRefresh={() => {}}
    />
  );
}
