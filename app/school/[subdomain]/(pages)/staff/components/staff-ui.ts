import { cn } from "@/lib/utils";

export const staffPanel =
  "overflow-hidden border border-[#1a4d42]/12 bg-white shadow-[3px_3px_0_0_rgba(10,31,26,0.05)] dark:border-white/10 dark:bg-[#0c1a17]";

export const staffTh =
  "px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45";

export const staffControlShell =
  "border border-[#1a4d42]/12 bg-[#f3f7f5] p-2.5 dark:border-white/10 dark:bg-[#071411]";

export const staffSearchInput =
  "h-8 rounded-none border border-[#1a4d42]/15 bg-white pl-8 pr-8 text-sm shadow-none placeholder:text-[#1a4d42]/40 focus-visible:border-[#246a59]/50 focus-visible:ring-[#246a59]/20 dark:border-white/15 dark:bg-[#0c1a17] dark:placeholder:text-white/40";

export const staffSearchClearBtn =
  "absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-none text-[#1a4d42]/40 transition-colors hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:hover:bg-white/10 dark:hover:text-white";

export function staffFilterPill(active: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-none border px-2.5 py-1 text-xs transition-colors",
    active
      ? "border-[#0a1f1a] bg-[#0a1f1a] text-white"
      : "border-[#1a4d42]/12 bg-white text-[#1a4d42]/70 hover:border-[#246a59]/35 hover:bg-[#246a59]/[0.06] dark:border-white/10 dark:bg-[#0c1a17] dark:text-white/55",
  );
}

export const staffSelect =
  "h-8 cursor-pointer appearance-none rounded-none border border-[#1a4d42]/15 bg-white px-2.5 pr-7 text-xs text-[#0a1f1a] transition-colors hover:border-[#246a59]/40 focus:outline-none focus:ring-2 focus:ring-[#246a59]/20 dark:border-white/15 dark:bg-[#0c1a17] dark:text-white";

export const staffGhostButton =
  "h-7 w-full rounded-none text-xs font-normal text-[#1a4d42]/55 hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:hover:bg-white/5 dark:hover:text-white";

export const staffIconButton =
  "h-8 w-8 rounded-none p-0 text-[#1a4d42]/50 hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:hover:bg-white/5 dark:hover:text-white";

export const staffDirectoryMeta =
  "mb-2.5 shrink-0 border border-[#1a4d42]/10 bg-[#f8fbfa] px-2.5 py-2 dark:border-white/10 dark:bg-[#071411]";

export function staffSidebarItem(selected: boolean, highlight?: boolean) {
  return cn(
    "relative w-full rounded-none border border-transparent px-2 py-1.5 text-left transition-colors",
    selected
      ? "border-[#246a59]/25 bg-[#246a59]/10 dark:bg-[#246a59]/15"
      : "hover:border-[#1a4d42]/10 hover:bg-white dark:hover:bg-white/5",
    highlight && !selected && "bg-amber-50/60 dark:bg-amber-950/20",
  );
}

export const staffSearchChip =
  "inline-flex items-center gap-1 rounded-none border border-[#1a4d42]/12 bg-white px-2 py-0.5 text-[#1a4d42]/80 transition-colors hover:border-[#246a59]/35 dark:border-white/10 dark:bg-[#0c1a17] dark:text-white/70";

export const staffControlDivider =
  "mt-2.5 border-t border-[#1a4d42]/10 pt-2.5 dark:border-white/10";

export const staffAddLink =
  "inline-flex items-center gap-1 rounded-none bg-[#0a1f1a] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-[#246a59] hover:text-white";

export const staffAddLinkLg =
  "inline-flex items-center gap-1 rounded-none bg-[#0a1f1a] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#246a59] hover:text-white";
