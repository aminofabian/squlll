"use client";

import type { CSSProperties } from "react";
import { Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimetableLesson } from "@/lib/timetable/types";
import { getLessonSubjectPalette } from "@/lib/timetable/constants";
import type { LessonCardState } from "../lib/getLessonCardState";

const MAX_PROGRESS_PERCENT = 100;

const CARD_STATE_CLASSES: Record<LessonCardState, string> = {
  scheduled:
    "bg-[color-mix(in_srgb,var(--subject)_6%,white)] ring-[color-mix(in_srgb,var(--subject)_18%,transparent)] hover:bg-[color-mix(in_srgb,var(--subject)_11%,white)] dark:bg-[color-mix(in_srgb,var(--subject)_12%,#0c1a17)]",
  next: "bg-[#fffaf0] ring-[#c49a52] hover:bg-[#fdf3e0] dark:bg-[#c49a52]/10",
  current:
    "bg-[#0a2620] text-white ring-[#0a2620] dark:bg-[#123b31]",
  completed:
    "bg-[#f4f3ed] ring-[#1a4d42]/8 hover:bg-[#efeee6] dark:bg-white/[0.03] dark:ring-white/8",
  cancelled:
    "bg-[repeating-linear-gradient(135deg,#fbf3f2_0,#fbf3f2_6px,#f6e8e6_6px,#f6e8e6_12px)] ring-rose-200/70 dark:bg-rose-950/20 dark:ring-rose-900/40",
};

const TITLE_STATE_CLASSES: Record<LessonCardState, string> = {
  scheduled: "text-[#0a1f1a] dark:text-white",
  next: "text-[#0a1f1a] dark:text-white",
  current: "text-[#fbf8ef]",
  completed: "text-[#1a4d42]/55 dark:text-white/45",
  cancelled: "text-rose-900/70 line-through decoration-rose-400/70 dark:text-rose-200/60",
};

const STATE_LABELS: Record<LessonCardState, string> = {
  scheduled: "",
  next: "up next",
  current: "happening now",
  completed: "taught",
  cancelled: "cancelled",
};

type TeacherWeekLessonCardProps = {
  lesson: TimetableLesson;
  state: LessonCardState;
  isDoubleBlock: boolean;
  progressPercent: number;
  onSelect: () => void;
};

export function TeacherWeekLessonCard({
  lesson,
  state,
  isDoubleBlock,
  progressPercent,
  onSelect,
}: TeacherWeekLessonCardProps) {
  const palette = getLessonSubjectPalette(lesson.subject);
  const classLabel = [lesson.grade.displayName || lesson.grade.name, lesson.stream]
    .filter(Boolean)
    .join(" · ");
  const accessibleLabel = [lesson.subject.name, classLabel, STATE_LABELS[state]]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={accessibleLabel}
      style={{ "--subject": palette.accent } as CSSProperties}
      className={cn(
        "group/lesson relative flex h-full w-full flex-col overflow-hidden rounded-md py-1.5 pl-3 pr-1.5 text-left ring-1 transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-[#c49a52]",
        CARD_STATE_CLASSES[state],
      )}
    >
      <AccentRail state={state} />
      <div className="flex items-start justify-between gap-1.5">
        <p
          className={cn(
            "truncate text-[11.5px] font-semibold leading-tight tracking-[-0.01em]",
            TITLE_STATE_CLASSES[state],
          )}
        >
          {lesson.subject.name}
        </p>
        <StateBadge state={state} />
      </div>
      <LessonMeta classLabel={classLabel} room={lesson.room} state={state} />
      {isDoubleBlock ? <DoubleTag state={state} /> : null}
      {state === "current" ? <LiveProgress percent={progressPercent} /> : null}
    </button>
  );
}

function AccentRail({ state }: { state: LessonCardState }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute inset-y-1.5 left-1 w-[2px] rounded-full",
        state === "current" && "bg-gradient-to-b from-[#f0dfb8] to-[#c49a52]",
        state === "next" && "bg-[#c49a52]",
        state === "completed" && "bg-[var(--subject)] opacity-30",
        state === "cancelled" && "bg-rose-300",
        state === "scheduled" && "bg-[var(--subject)]",
      )}
    />
  );
}

function LessonMeta({
  classLabel,
  room,
  state,
}: {
  classLabel: string;
  room: string;
  state: LessonCardState;
}) {
  const isCurrent = state === "current";
  return (
    <div className="mt-auto flex min-w-0 items-center gap-1.5 overflow-hidden pt-1">
      <span
        className={cn(
          "min-w-0 truncate rounded-sm px-1 py-[2px] text-[9.5px] font-semibold leading-none",
          isCurrent
            ? "bg-white/10 text-white/85"
            : "bg-[color-mix(in_srgb,var(--subject)_12%,transparent)] text-[#1a4d42]/80 dark:text-white/65",
        )}
      >
        {classLabel}
      </span>
      {room ? (
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-0.5 text-[9.5px] font-medium",
            isCurrent ? "text-white/55" : "text-[#1a4d42]/45 dark:text-white/40",
          )}
        >
          <MapPin className="h-2.5 w-2.5" aria-hidden />
          {room}
        </span>
      ) : null}
    </div>
  );
}

function StateBadge({ state }: { state: LessonCardState }) {
  if (state === "current") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-[#c49a52]/20 px-1 py-[2px] text-[8px] font-bold uppercase tracking-[0.14em] text-[#f0dfb8]">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f0dfb8] opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#f0dfb8]" />
        </span>
        Now
      </span>
    );
  }
  if (state === "next") {
    return (
      <span className="shrink-0 rounded-sm bg-[#c49a52] px-1 py-[2px] text-[8px] font-bold uppercase tracking-[0.14em] text-white">
        Next
      </span>
    );
  }
  if (state === "completed") {
    return (
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
        <Check className="h-2 w-2" strokeWidth={4} aria-hidden />
      </span>
    );
  }
  if (state === "cancelled") {
    return (
      <span className="shrink-0 rounded-sm bg-rose-100 px-1 py-[2px] text-[8px] font-bold uppercase tracking-[0.12em] text-rose-700">
        Off
      </span>
    );
  }
  return null;
}

function DoubleTag({ state }: { state: LessonCardState }) {
  return (
    <span
      className={cn(
        "mt-1 inline-flex w-fit items-center gap-1 text-[8.5px] font-semibold uppercase tracking-[0.16em]",
        state === "current" ? "text-[#f0dfb8]/70" : "text-[#1a4d42]/40 dark:text-white/35",
      )}
    >
      <span className="h-px w-3 bg-current" aria-hidden />
      Double period
    </span>
  );
}

function LiveProgress({ percent }: { percent: number }) {
  const width = Math.min(Math.max(percent, 0), MAX_PROGRESS_PERCENT);
  return (
    <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
      <span
        className="block h-full bg-gradient-to-r from-[#c49a52] to-[#f0dfb8] transition-[width] duration-1000 ease-linear"
        style={{ width: `${width}%` }}
      />
    </span>
  );
}
