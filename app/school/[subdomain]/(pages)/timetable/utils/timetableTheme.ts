/**
 * Shared class fragments for the timetable admin UI.
 * Sharp edges throughout — no rounded corners. Forest-green ledger accent.
 *
 * Design rules (keep to these — resist one-off values):
 *  1. Type comes from `tt.text`. No arbitrary px sizes outside this scale.
 *  2. Neutrals come from `tt.ink` (warm forest ink), not slate/zinc.
 *  3. Dividers/borders come from `tt.border`.
 *  4. Numbers that align in columns get `tt.numeral` (tabular-nums).
 *  5. Icon buttons use `tt.iconBtn`; interactive text uses `tt.focus`.
 */

const ink = {
  strong: "text-[#0a1f1a] dark:text-white",
  base: "text-[#1a4d42]/70 dark:text-white/60",
  muted: "text-[#1a4d42]/55 dark:text-white/45",
  faint: "text-[#1a4d42]/40 dark:text-white/35",
} as const;

const text = {
  /** Badges, legends, footnote numerals. */
  micro: "text-[10px] leading-none",
  /** Secondary captions and helper text. */
  caption: "text-[11px] leading-snug",
  /** Compact body / table rows. */
  small: "text-[12px] leading-snug",
  /** Default body copy. */
  body: "text-[13px] leading-snug",
  /** Panel + section titles. */
  title: "text-[14px] font-semibold leading-tight tracking-[-0.01em]",
  /** Page / drawer headlines. */
  display: "text-[17px] font-semibold leading-tight tracking-[-0.02em]",
  /** Big single-metric readouts. */
  metric: "text-[24px] font-semibold leading-none tracking-[-0.03em]",
} as const;

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

  /** Typographic scale — the only font sizes allowed in this module. */
  text,
  /** Warm forest-ink neutral text tokens (replaces ad-hoc slate/zinc). */
  ink,
  /** Column-aligned numbers. */
  numeral: "tabular-nums",
  /** Consistent keyboard focus affordance for interactive text/elements. */
  focus:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/35 focus-visible:ring-offset-0",
  /** Hairline dividers between rows/sections. */
  border: {
    hair: "border-[#1a4d42]/10 dark:border-white/10",
    soft: "border-[#1a4d42]/12 dark:border-white/10",
    row: "border-b border-[#1a4d42]/8 last:border-b-0 dark:border-white/8",
  },
  /** Shared icon-button treatment for panel headers and toolbars. */
  iconBtn:
    "inline-flex items-center justify-center text-[#1a4d42]/55 transition-colors hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:text-white/45 dark:hover:bg-white/5 dark:hover:text-white",
  /** Subtle hover for clickable list rows. */
  rowHover:
    "transition-colors hover:bg-[#f3f7f5] dark:hover:bg-white/[0.03]",
  /** Standard panel padding rhythm. */
  pad: {
    x: "px-4",
    section: "px-4 py-3.5 sm:px-5",
    compact: "px-3 py-3",
  },
} as const;
