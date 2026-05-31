import { cn } from "@/lib/utils";

/** Compact action menu styling for timetable toolbar dropdowns */
export const ttMenu = {
  content: cn(
    "w-44 rounded-lg border-slate-200/90 p-1 shadow-sm",
    "dark:border-slate-700 dark:bg-slate-900",
  ),
  item: cn(
    "h-7 gap-2 rounded-md px-2 text-xs font-normal text-slate-600",
    "focus:bg-slate-50 focus:text-slate-900",
    "dark:text-slate-300 dark:focus:bg-slate-800 dark:focus:text-slate-100",
    "[&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:text-slate-400",
  ),
  itemWarn: "text-amber-800 focus:text-amber-900 dark:text-amber-200",
  itemDestructive: cn(
    "text-red-600 focus:bg-red-50 focus:text-red-700",
    "dark:text-red-400 dark:focus:bg-red-950/40 dark:focus:text-red-300",
    "[&_svg]:text-red-500 dark:[&_svg]:text-red-400",
  ),
  label:
    "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400",
  separator: "my-0.5 bg-slate-100 dark:bg-slate-800",
} as const;
