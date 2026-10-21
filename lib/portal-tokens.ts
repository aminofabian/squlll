/**
 * Portal design tokens shared by the teacher and student portals.
 *
 * One type scale (Figtree for UI, Instrument Serif for page titles), one accent
 * (the school green), warm paper surfaces. Keep these strings as complete class
 * names so Tailwind can see them.
 */
export const tp = {
  // Page rhythm — generous, slightly wider on large screens.
  page: "mx-auto w-full max-w-[1180px] px-5 pb-24 pt-6 sm:px-8 sm:pt-9 lg:px-0 lg:pb-14 lg:pt-0",
  pageNarrow:
    "mx-auto w-full max-w-3xl px-5 pb-24 pt-6 sm:px-8 sm:pt-9 lg:px-0 lg:pb-14 lg:pt-0",
  stack: "flex flex-col gap-8 sm:gap-10",
  stackTight: "flex flex-col gap-5 sm:gap-6",

  // Type
  eyebrow:
    "text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/75 dark:text-primary-light/80",
  title:
    "mt-2 font-display text-[2.1rem] leading-[1.04] tracking-[-0.015em] text-foreground text-balance sm:text-[2.55rem]",
  titleSm:
    "font-display text-[1.55rem] leading-[1.1] tracking-[-0.01em] text-foreground text-balance sm:text-[1.8rem]",
  sectionTitle:
    "text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/85",
  lede: "mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground text-pretty",
  body: "text-sm leading-relaxed text-muted-foreground",
  meta: "text-[12px] leading-relaxed text-muted-foreground/85",

  // Surfaces
  card: "rounded-2xl border border-border/90 bg-card shadow-[0_1px_2px_rgba(20,32,28,0.04),0_20px_44px_-34px_rgba(20,32,28,0.35)]",
  cardQuiet:
    "rounded-2xl border border-border/70 bg-card/70 shadow-[0_1px_2px_rgba(20,32,28,0.03)]",
  cardPad: "p-5 sm:p-6",
  cardPadLoose: "p-6 sm:p-8",
  inset: "rounded-xl border border-border/80 bg-muted/35",

  // Controls
  primaryButton:
    "h-10 gap-2 rounded-full px-5 text-[13px] font-semibold shadow-sm shadow-primary/20",
  quietButton:
    "h-10 gap-2 rounded-full px-4 text-[13px] font-semibold text-muted-foreground hover:text-foreground",
  input:
    "h-10 rounded-xl border-border/90 bg-card text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/25",
  inputSoft:
    "h-10 rounded-xl border-transparent bg-muted/50 text-sm shadow-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary/25",

  // Small print / links
  link: "font-medium text-primary underline-offset-4 transition-colors hover:underline",
  backLink:
    "tp-focus group inline-flex items-center gap-1.5 rounded-full text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground",
} as const;

export type PortalTokens = typeof tp;
