"use client";

import type { LucideIcon } from "lucide-react";
import { Coffee, Flag, PenLine, Sun, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BreakType, TimetableBreak } from "@/lib/timetable/types";

type BreakTheme = { Icon: LucideIcon; surface: string; ink: string; rule: string };

const BREAK_THEMES: Record<BreakType, BreakTheme> = {
  BREAK: {
    Icon: Coffee,
    surface: "bg-[#f1efe6] dark:bg-white/[0.04]",
    ink: "text-[#1a4d42]/60 dark:text-white/50",
    rule: "via-[#1a4d42]/15",
  },
  RECESS: {
    Icon: Sun,
    surface: "bg-[#eef2ea] dark:bg-emerald-950/20",
    ink: "text-[#246a59]/80 dark:text-emerald-200/60",
    rule: "via-[#246a59]/20",
  },
  LUNCH: {
    Icon: UtensilsCrossed,
    surface: "bg-[#f8efdc] dark:bg-[#c49a52]/10",
    ink: "text-[#8a6427] dark:text-[#e5cf9f]",
    rule: "via-[#c49a52]/35",
  },
  ASSEMBLY: {
    Icon: Flag,
    surface: "bg-[#e9efec] dark:bg-white/[0.05]",
    ink: "text-[#0a2620]/70 dark:text-white/60",
    rule: "via-[#0a2620]/20",
  },
  EXAM: {
    Icon: PenLine,
    surface: "bg-rose-50 dark:bg-rose-950/20",
    ink: "text-rose-800/80 dark:text-rose-200/70",
    rule: "via-rose-300/50",
  },
};

function toTitleCase(value: string): string {
  return value.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

type TeacherWeekBreakBandProps = {
  breakItem: TimetableBreak;
  /** Single-day chip instead of a full-width ruled band. */
  variant?: "band" | "chip";
};

export function TeacherWeekBreakBand({
  breakItem,
  variant = "band",
}: TeacherWeekBreakBandProps) {
  const theme = BREAK_THEMES[breakItem.type] ?? BREAK_THEMES.BREAK;
  const { Icon } = theme;
  const label = toTitleCase(breakItem.name || breakItem.type);
  const isBand = variant === "band";

  return (
    <div
      className={cn(
        "flex h-full min-h-[22px] items-center justify-center gap-2 rounded-md px-3",
        theme.surface,
        theme.ink,
      )}
    >
      {isBand ? <Rule className={theme.rule} direction="left" /> : null}
      <Icon className="h-3 w-3 shrink-0" aria-hidden />
      <span className="truncate text-[10px] font-semibold uppercase tracking-[0.2em]">
        {label}
      </span>
      <span className="shrink-0 text-[10px] font-medium tabular-nums opacity-70">
        {breakItem.durationMinutes} min
      </span>
      {isBand ? <Rule className={theme.rule} direction="right" /> : null}
    </div>
  );
}

function Rule({ className, direction }: { className: string; direction: "left" | "right" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "h-px max-w-[220px] flex-1 from-transparent to-transparent",
        direction === "left" ? "bg-gradient-to-r" : "bg-gradient-to-l",
        className,
      )}
    />
  );
}
