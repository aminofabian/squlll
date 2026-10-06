import { cn } from "@/lib/utils";

/** Shared panel styles — ledger / forest system */
export const classesPanel =
  "overflow-hidden rounded-none border border-[#1a4d42]/12 bg-white shadow-[3px_3px_0_0_rgba(10,31,26,0.05)] dark:border-white/10 dark:bg-[#0c1a17]";

export const classesPanelMuted =
  "rounded-none border border-[#1a4d42]/12 bg-[#f8fbfa] dark:border-white/10 dark:bg-[#071411]";

export const classesSectionHead =
  "border-b border-[#1a4d42]/10 bg-[#f8fbfa] text-left dark:border-white/10 dark:bg-[#071411]";

export const classesTh =
  "px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45";

export const classesActionButton =
  "h-8 gap-1.5 rounded-none border border-[#1a4d42]/15 bg-white text-xs font-normal text-[#1a4d42]/80 shadow-none hover:border-[#246a59]/40 hover:bg-[#f3f7f5] dark:border-white/15 dark:bg-[#0c1a17] dark:text-white/70";

export const classesPrimaryButton =
  "h-8 gap-1.5 rounded-none bg-[#0a1f1a] px-3 text-xs font-medium text-white shadow-none hover:bg-[#246a59]";

export const classesGhostButton =
  "h-7 rounded-none text-xs font-normal text-[#1a4d42]/55 hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:hover:bg-white/5 dark:hover:text-white";

export const classesIconButton =
  "h-8 w-8 rounded-none p-0 text-[#1a4d42]/50 hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:hover:bg-white/5 dark:hover:text-white";

export const classesSearchInput =
  "h-8 rounded-none border border-[#1a4d42]/15 bg-white pl-8 pr-8 text-sm shadow-none placeholder:text-[#1a4d42]/40 focus-visible:border-[#246a59]/50 focus-visible:ring-[#246a59]/20 dark:border-white/15 dark:bg-[#0c1a17]";

/* ---- Overview surface (campus pulse) -------------------------------- */

/** Page canvas */
export const classesCanvas =
  "flex min-h-full flex-col bg-[#f3f7f5] dark:bg-[#071411]";

/** Micro eyebrow label */
export const classesMicro =
  "text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1a4d42]/45 dark:text-white/45";

/** Plain card */
export const classesCard =
  "rounded-none border border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#0c1a17]";

/** Card that reacts to hover — lift + offset shadow */
export const classesCardHover =
  "transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-px hover:border-[#246a59]/35 hover:shadow-[3px_3px_0_0_rgba(10,31,26,0.08)] dark:hover:border-[#246a59]/45";

/** Dark ink hero panel */
export const classesInkPanel =
  "relative overflow-hidden rounded-none border border-[#0a1f1a] bg-[#0a1f1a] text-white shadow-[3px_3px_0_0_rgba(10,31,26,0.14)]";

/** Subtle dot-grid texture for hero panels */
export const classesDotGrid = {
  backgroundImage:
    "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)",
  backgroundSize: "22px 22px",
} as const;

/** Thin progress track used in cards */
export const classesTrack =
  "h-1 w-full overflow-hidden rounded-none bg-[#1a4d42]/10 dark:bg-white/10";

export function classesFilterPill(active: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-none border px-2.5 py-1 text-xs transition-colors",
    active
      ? "border-[#0a1f1a] bg-[#0a1f1a] text-white"
      : "border-[#1a4d42]/12 bg-white text-[#1a4d42]/70 hover:border-[#246a59]/35 hover:bg-[#246a59]/[0.06] dark:border-white/10 dark:bg-[#0c1a17] dark:text-white/55",
  );
}
