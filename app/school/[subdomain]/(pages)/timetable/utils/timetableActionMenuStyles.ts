import { cn } from "@/lib/utils";

/** Compact action menu styling for timetable toolbar dropdowns */
export const ttMenu = {
  content: cn(
    "w-48 rounded-none border-[#1a4d42]/15 bg-white p-1.5 shadow-[3px_3px_0_0_rgba(10,31,26,0.06)]",
    "dark:border-white/10 dark:bg-[#0c1a17]",
  ),
  item: cn(
    "h-8 gap-2 rounded-none px-2.5 text-[13px] font-normal text-[#1a4d42]/70",
    "focus:bg-[#f3f7f5] focus:text-[#0a1f1a]",
    "dark:text-white/60 dark:focus:bg-white/5 dark:focus:text-white",
    "[&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-[#1a4d42]/40",
  ),
  itemWarn: "text-amber-800 focus:text-amber-900 dark:text-amber-200",
  itemDestructive: cn(
    "text-red-600 focus:bg-red-50 focus:text-red-700",
    "dark:text-red-400 dark:focus:bg-red-950/40 dark:focus:text-red-300",
    "[&_svg]:text-red-500 dark:[&_svg]:text-red-400",
  ),
  label: "px-2.5 py-1 text-[11px] font-medium text-[#1a4d42]/45",
  separator: "my-1 bg-[#1a4d42]/10 dark:bg-white/10",
} as const;
