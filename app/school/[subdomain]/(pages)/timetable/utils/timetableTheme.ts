/**
 * Shared class fragments for the timetable admin UI.
 * Sharp edges throughout — no rounded corners. Forest-green ledger accent.
 */

export const tt = {
  pageBg: "bg-[#f3f7f5] dark:bg-[#071411]",
  panel:
    "rounded-none border border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#0c1a17]",
  panelMuted:
    "rounded-none border border-[#1a4d42]/12 bg-[#f8fbfa] dark:border-white/10 dark:bg-[#071411]",
  label:
    "text-[11px] font-medium uppercase tracking-[0.08em] text-[#1a4d42]/55 dark:text-white/45",
  body: "text-[13px] leading-snug text-[#0a1f1a]/80 dark:text-white/70",
  caption: "text-[12px] leading-relaxed text-[#1a4d42]/55 dark:text-white/45",
  heading:
    "text-[14px] font-semibold tracking-[-0.02em] text-[#0a1f1a] dark:text-white",
  /** Primary action — forest ink / green */
  accent: "#246a59",
  accentHover: "#1a4d42",
  accentSoft: "bg-[#246a59]/10 text-[#246a59]",
  accentBtn:
    "rounded-none bg-[#0a1f1a] text-white hover:bg-[#246a59] focus-visible:ring-[#246a59]/40",
  chip:
    "inline-flex items-center rounded-none border border-[#1a4d42]/15 bg-white px-2.5 py-1 text-[11px] font-medium text-[#1a4d42]/70 transition dark:border-white/15 dark:bg-[#071411] dark:text-white/60",
  chipOn:
    "border-[#0a1f1a] bg-[#0a1f1a] text-white dark:border-[#246a59] dark:bg-[#246a59] dark:text-white",
  chipDanger:
    "border-red-500/50 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300",
  chipWarn:
    "border-amber-500/50 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200",
  /** Small uppercase section eyebrow used inside panels */
  eyebrow:
    "text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1a4d42]/45 dark:text-white/40",
  /** Status tones — sharp rectangles, never pills */
  pill: {
    base: "inline-flex items-center gap-1.5 rounded-none px-2.5 py-1 text-[11px] font-semibold",
    neutral:
      "bg-[#e8f2ef] text-[#1a4d42]/70 dark:bg-white/10 dark:text-white/60",
    info: "bg-[#246a59]/10 text-[#246a59] dark:bg-[#246a59]/20 dark:text-[#7eb8a8]",
    success:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    warn: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    danger: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
} as const;
