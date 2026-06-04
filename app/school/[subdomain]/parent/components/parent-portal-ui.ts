import { cn } from "@/lib/utils";

export const portalPanel =
  "overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900/50";

export const portalSectionLabel =
  "text-[11px] font-medium uppercase tracking-wide text-slate-400";

export const portalStatCard =
  "rounded-xl border border-slate-200/60 bg-white px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50";

export function portalChildPill(active: boolean) {
  return cn(
    "inline-flex shrink-0 items-center gap-2.5 rounded-full border px-3 py-1.5 text-left text-sm transition-colors",
    active
      ? "border-primary bg-primary text-white shadow-sm"
      : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  );
}

export const portalEmptyState =
  "rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/30";

export const portalSidebar =
  "flex h-full w-64 shrink-0 flex-col border-r border-slate-200/60 bg-white dark:border-slate-800 dark:bg-slate-950";

export function portalNavItem(active: boolean) {
  return cn(
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
    active
      ? "bg-primary font-medium text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60",
  );
}

export function portalNavIcon(active: boolean) {
  return cn(
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
    active
      ? "bg-white/20"
      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  );
}
