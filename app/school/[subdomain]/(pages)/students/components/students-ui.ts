import { cn } from "@/lib/utils";

export const studentsPanel =
  "overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900/50";

export const studentsTh =
  "px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400";

/** Soft container for filters, search chips, and action buttons */
export const studentsControlShell =
  "rounded-xl border border-slate-200/50 bg-slate-100/35 p-3 dark:border-slate-800/60 dark:bg-slate-900/25";

export const studentsSearchInput =
  "h-9 border-0 bg-slate-100/90 pl-8 pr-8 text-sm shadow-none ring-1 ring-inset ring-slate-200/50 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-300/70 dark:bg-slate-800/55 dark:ring-slate-700/60 dark:placeholder:text-slate-500 dark:focus-visible:ring-slate-600";

export const studentsSearchClearBtn =
  "absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-600 dark:hover:bg-slate-700/80 dark:hover:text-slate-300";

export function studentsFilterPill(active: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors",
    active
      ? "bg-[#0073ea] text-white shadow-sm shadow-[#0073ea]/20"
      : "bg-slate-200/45 text-slate-600 hover:bg-slate-200/75 dark:bg-slate-800/45 dark:text-slate-400 dark:hover:bg-slate-800/70",
  );
}

export const studentsSelect =
  "h-8 cursor-pointer appearance-none rounded-lg border-0 bg-slate-200/45 px-2.5 pr-7 text-xs text-slate-700 ring-1 ring-inset ring-slate-200/40 transition-colors hover:bg-slate-200/65 focus:outline-none focus:ring-2 focus:ring-slate-300/60 dark:bg-slate-800/55 dark:text-slate-200 dark:ring-slate-700/55 dark:hover:bg-slate-800/75";

export const studentsActionButton =
  "h-8 gap-1.5 border-0 bg-slate-200/45 text-xs font-normal text-slate-700 shadow-none ring-1 ring-inset ring-slate-200/40 hover:bg-slate-200/70 dark:bg-slate-800/55 dark:text-slate-200 dark:ring-slate-700/55 dark:hover:bg-slate-800/75";

export const studentsGhostButton =
  "h-7 w-full text-xs font-normal text-slate-500 hover:bg-slate-200/50 hover:text-slate-700 dark:hover:bg-slate-800/50 dark:hover:text-slate-300";

export const studentsIconButton =
  "h-8 w-8 p-0 text-slate-500 hover:bg-slate-200/50 hover:text-slate-700 dark:hover:bg-slate-800/50 dark:hover:text-slate-300";

export const studentsDirectoryMeta =
  "mb-3 shrink-0 rounded-lg bg-slate-100/50 px-3 py-2 dark:bg-slate-800/35";

export function studentsSidebarItem(selected: boolean, highlight?: boolean) {
  return cn(
    "w-full rounded-lg px-2.5 py-2 text-left transition-colors",
    selected
      ? "bg-white/90 ring-1 ring-slate-200/70 dark:bg-slate-900/80 dark:ring-slate-600/80"
      : "hover:bg-slate-200/40 dark:hover:bg-slate-800/45",
    highlight && !selected && "bg-amber-100/25 dark:bg-amber-950/15",
  );
}

export const studentsSearchChip =
  "inline-flex items-center gap-1 rounded-full bg-slate-200/50 px-2.5 py-0.5 text-slate-700 transition-colors hover:bg-slate-200/80 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800/70";

export const studentsControlDivider =
  "mt-3 border-t border-slate-200/45 pt-3 dark:border-slate-800/50";

/** Solid enroll links — school blue */
export const studentsEnrollLink =
  "inline-flex items-center gap-1 rounded-full bg-[#0073ea] px-2.5 py-1 text-xs font-medium text-white shadow-sm shadow-[#0073ea]/25 transition-colors hover:bg-[#0062c4] hover:text-white";

export const studentsEnrollLinkLg =
  "inline-flex items-center gap-1 rounded-full bg-[#0073ea] px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-[#0073ea]/25 transition-colors hover:bg-[#0062c4] hover:text-white";
