/** Shared Tailwind class fragments for timetable admin UI */

export const tt = {
  pageBg:
    "bg-[#f6f7f9] dark:bg-zinc-950",
  panel:
    "rounded-2xl border border-zinc-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-zinc-800 dark:bg-zinc-900",
  panelMuted:
    "rounded-xl border border-zinc-200/80 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/50",
  label:
    "text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400",
  body: "text-[13px] text-zinc-700 dark:text-zinc-300",
  caption: "text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug",
} as const;
