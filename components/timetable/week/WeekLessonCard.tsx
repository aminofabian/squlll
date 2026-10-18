"use client";

import type { CSSProperties } from "react";
import { Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LessonCardState } from "@/lib/timetable/weekView/getLessonCardState";

const MAX_PROGRESS_PERCENT = 100;

const CARD_STATE_CLASSES: Record<LessonCardState, string> = {
  scheduled:
    "bg-[color-mix(in_srgb,var(--accent)_11%,white)] ring-[color-mix(in_srgb,var(--accent)_32%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_17%,white)] dark:bg-[color-mix(in_srgb,var(--accent)_16%,#0c1a17)]",
  next: "bg-[#fff6e3] ring-[#b8893f] hover:bg-[#fdefd2] dark:bg-[#c49a52]/15",
  current: "bg-[#0a2620] text-white ring-[#0a2620] dark:bg-[#123b31]",
  completed:
    "bg-[#f1f0ea] ring-[#1a4d42]/12 hover:bg-[#ebeae2] dark:bg-white/[0.04] dark:ring-white/10",
  cancelled:
    "bg-[repeating-linear-gradient(135deg,#fbf1ef_0,#fbf1ef_6px,#f5e3e0_6px,#f5e3e0_12px)] ring-rose-300/70 dark:bg-rose-950/20 dark:ring-rose-900/40",
};

const TITLE_STATE_CLASSES: Record<LessonCardState, string> = {
  scheduled: "text-[#0a1f1a] dark:text-white",
  next: "text-[#0a1f1a] dark:text-white",
  current: "text-[#fbf8ef]",
  completed: "text-[#1a4d42]/80 dark:text-white/65",
  cancelled: "text-rose-900 line-through decoration-rose-500/70 dark:text-rose-200/80",
};

const STATE_LABELS: Record<LessonCardState, string> = {
  scheduled: "",
  next: "up next",
  current: "happening now",
  completed: "completed",
  cancelled: "cancelled",
};

type WeekLessonCardProps = {
  title: string;
  detail: string;
  room: string;
  accent: string;
  state: LessonCardState;
  isDoubleBlock: boolean;
  progressPercent: number;
  onSelect: () => void;
};

export function WeekLessonCard({
  title,
  detail,
  room,
  accent,
  state,
  isDoubleBlock,
  progressPercent,
  onSelect,
}: WeekLessonCardProps) {
  const accessibleLabel = [title, detail, room && `room ${room}`, STATE_LABELS[state]]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={accessibleLabel}
      style={{ "--accent": accent } as CSSProperties}
      className={cn(
        "group/lesson relative flex h-full w-full flex-col overflow-hidden rounded-md py-1.5 pl-3.5 pr-1.5 text-left ring-1 transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8893f]",
        CARD_STATE_CLASSES[state],
      )}
    >
      <AccentRail state={state} />
      <div className="flex items-start justify-between gap-1.5">
        <p className={cn("truncate text-[12.5px] font-semibold leading-tight tracking-[-0.01em]", TITLE_STATE_CLASSES[state])}>
          {title}
        </p>
        <StateBadge state={state} />
      </div>
      <LessonMeta detail={detail} room={room} state={state} />
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
        "absolute inset-y-1.5 left-1 w-[3px] rounded-full",
        state === "current" && "bg-gradient-to-b from-[#f0dfb8] to-[#c49a52]",
        state === "next" && "bg-[#b8893f]",
        state === "completed" && "bg-[var(--accent)] opacity-40",
        state === "cancelled" && "bg-rose-400",
        state === "scheduled" && "bg-[var(--accent)]",
      )}
    />
  );
}

function LessonMeta({ detail, room, state }: { detail: string; room: string; state: LessonCardState }) {
  const isCurrent = state === "current";
  if (!detail && !room) return null;

  return (
    <div
      className={cn(
        "mt-auto flex min-w-0 items-center gap-2 overflow-hidden pt-1 text-[11px] font-medium leading-tight",
        isCurrent ? "text-white/80" : "text-[#1a4d42] dark:text-white/75",
      )}
    >
      {detail ? <span className="min-w-0 truncate">{detail}</span> : null}
      {room ? (
        <span className={cn("inline-flex shrink-0 items-center gap-0.5", isCurrent ? "text-white/70" : "text-[#1a4d42]/80 dark:text-white/65")}>
          <MapPin className="h-3 w-3" aria-hidden />
          {room}
        </span>
      ) : null}
    </div>
  );
}

function StateBadge({ state }: { state: LessonCardState }) {
  if (state === "current") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-[#c49a52]/25 px-1 py-[2px] text-[10px] font-bold uppercase tracking-[0.12em] text-[#f0dfb8]">
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
      <span className="shrink-0 rounded-sm bg-[#8a6427] px-1 py-[2px] text-[10px] font-bold uppercase tracking-[0.12em] text-white">
        Next
      </span>
    );
  }
  if (state === "completed") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
        <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden />
      </span>
    );
  }
  if (state === "cancelled") {
    return (
      <span className="shrink-0 rounded-sm bg-rose-100 px-1 py-[2px] text-[10px] font-bold uppercase tracking-[0.1em] text-rose-800">
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
        "mt-1 inline-flex w-fit items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.12em]",
        state === "current" ? "text-[#f0dfb8]/85" : "text-[#1a4d42]/75 dark:text-white/60",
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
