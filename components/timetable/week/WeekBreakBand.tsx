"use client";

import type { LucideIcon } from "lucide-react";
import { Coffee, Flag, PenLine, Sun, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BreakType, TimetableBreak } from "@/lib/timetable/types";

type BreakTheme = { Icon: LucideIcon; className: string };

const BREAK_THEMES: Record<BreakType, BreakTheme> = {
  BREAK: { Icon: Coffee, className: "bg-[#e9edea] text-[#34413b] dark:bg-white/[0.06] dark:text-white/75" },
  RECESS: { Icon: Sun, className: "bg-[#e9edea] text-[#34413b] dark:bg-white/[0.06] dark:text-white/75" },
  LUNCH: { Icon: UtensilsCrossed, className: "bg-[#fbe8c3] text-[#5e4410] dark:bg-amber-500/15 dark:text-amber-100" },
  ASSEMBLY: { Icon: Flag, className: "bg-[#e1e8f4] text-[#283a58] dark:bg-sky-500/15 dark:text-sky-100" },
  EXAM: { Icon: PenLine, className: "bg-[#f8dde2] text-[#7e1f33] dark:bg-rose-500/15 dark:text-rose-100" },
};

function toSentenceCase(value: string): string {
  const trimmed = value.trim().toLowerCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

type WeekBreakBandProps = {
  breakItem: TimetableBreak;
  /** Single-day chip instead of a full-width band. */
  variant?: "band" | "chip";
};

export function WeekBreakBand({ breakItem, variant = "band" }: WeekBreakBandProps) {
  const { Icon, className } = BREAK_THEMES[breakItem.type] ?? BREAK_THEMES.BREAK;
  const label = toSentenceCase(breakItem.name || breakItem.type);

  return (
    <div className={cn("flex h-full min-h-[22px] items-center justify-center gap-1.5 rounded-md px-2 text-[11.5px] font-medium", className)}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="truncate">
        {label}
        {variant === "band" ? ` · ${breakItem.durationMinutes} min` : ""}
      </span>
    </div>
  );
}
