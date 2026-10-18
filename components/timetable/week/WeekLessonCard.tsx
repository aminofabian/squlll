"use client";

import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LessonCardState } from "@/lib/timetable/weekView/getLessonCardState";
import { WeekGroupBadge } from "./WeekGroupBadge";

const MAX_PROGRESS_PERCENT = 100;

const CARD_STATE_CLASSES: Record<LessonCardState, string> = {
  scheduled: "text-[#111a16] bg-[var(--surface)] hover:brightness-[0.97]",
  next: "text-[#111a16] bg-[var(--surface)] ring-2 ring-[#111a17] dark:ring-white",
  current: "bg-[#111a17] text-white dark:bg-white dark:text-[#111a17]",
  completed: "text-[#111a16] bg-[var(--surface)] opacity-60 hover:opacity-80",
  cancelled: "text-[#111a16] bg-[repeating-linear-gradient(135deg,#f3f4f1_0,#f3f4f1_6px,#e9ebe6_6px,#e9ebe6_12px)]",
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
  badge: string;
  accent: string;
  surface: string;
  state: LessonCardState;
  /** "Double period · 11:25–12:45", or null for single periods. */
  doubleLabel: string | null;
  progressPercent: number;
  isDimmed: boolean;
  onSelect: () => void;
};

export function WeekLessonCard(props: WeekLessonCardProps) {
  const { title, detail, state, doubleLabel } = props;
  const isCurrent = state === "current";
  const accessibleLabel = [title, detail, props.room && `room ${props.room}`, doubleLabel, STATE_LABELS[state]]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      onClick={props.onSelect}
      aria-label={accessibleLabel}
      style={{ "--surface": props.surface } as CSSProperties}
      className={cn(
        "relative flex h-full w-full items-start gap-2 overflow-hidden rounded-lg px-2 py-1.5 text-left transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111a17]",
        CARD_STATE_CLASSES[state],
        props.isDimmed && "opacity-25 saturate-50",
      )}
    >
      <WeekGroupBadge letter={props.badge} accent={props.accent} />
      <span className="flex min-w-0 flex-1 flex-col self-stretch">
        <span className="flex items-center gap-1">
          <span className={cn("truncate text-[12.5px] font-bold leading-tight", state === "cancelled" && "line-through")}>{title}</span>
          <StateBadge state={state} />
        </span>
        {detail ? (
          <span className={cn("truncate text-[11px] leading-tight", isCurrent ? "opacity-80" : "text-[#34413b]")}>{detail}</span>
        ) : null}
        {doubleLabel ? (
          <span className={cn("mt-auto pt-1 text-[11px] font-semibold leading-tight", isCurrent ? "opacity-90" : "text-[#3a2a0a]")}>{doubleLabel}</span>
        ) : null}
      </span>
      {isCurrent ? <LiveProgress percent={props.progressPercent} /> : null}
    </button>
  );
}

function StateBadge({ state }: { state: LessonCardState }) {
  if (state === "next") {
    return <span className="ml-auto shrink-0 rounded bg-[#111a17] px-1.5 py-[1px] text-[10px] font-bold uppercase tracking-[0.06em] text-white">Next</span>;
  }
  if (state === "current") {
    return <span className="ml-auto shrink-0 rounded bg-emerald-500 px-1.5 py-[1px] text-[10px] font-bold uppercase tracking-[0.06em] text-white">Now</span>;
  }
  if (state === "completed") {
    return (
      <span className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#111a17] text-white">
        <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden />
      </span>
    );
  }
  if (state === "cancelled") {
    return <span className="ml-auto shrink-0 rounded bg-rose-100 px-1.5 py-[1px] text-[10px] font-bold uppercase text-rose-800">Off</span>;
  }
  return null;
}

function LiveProgress({ percent }: { percent: number }) {
  const width = Math.min(Math.max(percent, 0), MAX_PROGRESS_PERCENT);
  return (
    <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
      <span className="block h-full bg-emerald-400 transition-[width] duration-1000 ease-linear" style={{ width: `${width}%` }} />
    </span>
  );
}
