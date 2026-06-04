/** Shared visual tokens for the fees module */
export const FEES_BRAND = {
  primary: "#246a59",
  primaryDark: "#1a4d42",
  primaryLight: "#e8f2ef",
  primaryMuted: "#d4e8e2",
  surface: "#f4f7f5",
  surfaceElevated: "#ffffff",
  ink: "#0f172a",
  inkMuted: "#64748b",
} as const;

export const FEES_DETAIL = {
  maxWidth: "max-w-3xl",
  /** Single fee structure slug page — room for structure + letter tooling */
  planPageWidth: "max-w-5xl",
  pageGap: "space-y-3",
  planPageGap: "space-y-3",
  cardRadius: "rounded-xl",
  shadow:
    "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(36,106,89,0.08)]",
  shadowSoft: "shadow-[0_1px_3px_rgba(15,23,42,0.06)]",
  stickyNav:
    "-mx-0.5 px-0.5 pb-1 backdrop-blur-md supports-[backdrop-filter]:bg-[#f4f7f5]/92",
} as const;

/** Shared responsive layout patterns for fees screens. */
export const FEES_LAYOUT = {
  page: "min-w-0 w-full max-w-full overflow-x-hidden",
  /** Prevent copy from clipping; allow wrapping instead of ellipsis. */
  textWrap: "break-words [overflow-wrap:anywhere]",
  panelHeader:
    "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
  panelActions:
    "flex w-full flex-col gap-2 min-[480px]:flex-row min-[480px]:flex-wrap sm:w-auto sm:justify-end",
  toolbarRow:
    "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
  toolbarButtons:
    "flex w-full flex-col gap-2 min-[400px]:grid min-[400px]:grid-cols-2 sm:flex sm:w-auto sm:shrink-0",
  chipStrip:
    "flex min-w-0 max-w-full flex-wrap gap-1.5 overflow-x-hidden",
  /** Tables stay inside the page width — no document-level horizontal scroll. */
  tableScroll: "min-w-0 max-w-full overflow-x-hidden",
  tableContained:
    "min-w-0 max-w-full overflow-x-hidden rounded-xl border border-slate-200/80",
  planScrollMt: "scroll-mt-28 max-md:scroll-mt-24 sm:scroll-mt-[11rem]",
  /** Room for pinned letter toolbar (+ mobile tab bar on small screens). */
  planPageBottom:
    "pb-[calc(10rem+env(safe-area-inset-bottom,0px))] lg:pb-[max(4rem,calc(4rem+env(safe-area-inset-bottom,0px)))]",
  /** Dock above school mobile bottom nav (4.75rem). */
  mobileDockBottom:
    "bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:bottom-0",
  planLetterDock:
    "fixed inset-x-0 z-[55] border-t border-slate-200/90 bg-white shadow-[0_-8px_32px_-8px_rgba(15,23,42,0.18)] backdrop-blur-md supports-[backdrop-filter]:bg-white/95",
  planHeaderActions:
    "flex w-full shrink-0 flex-row items-center gap-1.5 sm:w-auto",
  fixedBarSafe: "pb-[env(safe-area-inset-bottom,0px)]",
} as const;

/** Mobile-native (iOS/Android-style) patterns — use with max-md: via cn(). */
export const FEES_MOBILE = {
  shell: "max-md:gap-3 max-md:px-3 max-md:pb-3 max-md:pt-1",
  /** Fee structure slug page — soft canvas, floating cards. */
  planPageShell: "max-md:bg-[#eef2f1] max-md:px-3 max-md:pt-0",
  stack: "max-md:flex max-md:flex-col max-md:gap-3",
  chrome:
    "max-md:mb-0 max-md:rounded-none max-md:border-0 max-md:border-b max-md:border-slate-200/70 max-md:bg-white/95 max-md:shadow-none md:rounded-xl md:border md:border-slate-200/80 md:shadow-sm",
  largeTitle:
    "max-md:text-[1.625rem] max-md:font-bold max-md:leading-tight max-md:tracking-tight",
  sectionLabel:
    "max-md:px-1 max-md:text-[11px] max-md:font-semibold max-md:uppercase max-md:tracking-wider max-md:text-slate-500",
  segmentedTrack:
    "max-md:flex max-md:flex-wrap max-md:gap-1 max-md:overflow-visible max-md:rounded-2xl max-md:bg-slate-200/75 max-md:p-1",
  segmentedTab:
    "max-md:flex max-md:min-h-[3rem] max-md:min-w-0 max-md:flex-1 max-md:basis-[30%] max-md:flex-col max-md:items-center max-md:justify-center max-md:gap-0.5 max-md:rounded-[0.65rem] max-md:px-2 max-md:py-1.5 max-md:text-center max-md:text-[10px] max-md:font-semibold max-md:leading-snug max-md:transition-[background,box-shadow,color]",
  segmentedActive:
    "max-md:bg-white max-md:text-slate-900 max-md:shadow-[0_1px_4px_rgba(15,23,42,0.12)]",
  segmentedIdle: "max-md:text-slate-500 max-md:active:opacity-80",
  listGroup:
    "max-md:overflow-x-hidden max-md:rounded-2xl max-md:bg-white max-md:shadow-[0_2px_14px_rgba(15,23,42,0.07)]",
  listRow:
    "max-md:flex max-md:min-h-[3.25rem] max-md:w-full max-md:items-center max-md:gap-3 max-md:px-4 max-md:py-3 max-md:text-left max-md:transition-colors max-md:active:bg-slate-100/90",
  planDoc:
    "max-md:flex max-md:flex-col max-md:gap-3 max-md:bg-transparent max-md:shadow-none max-md:ring-0",
  planSection:
    "max-md:!mt-0 max-md:overflow-x-hidden max-md:rounded-2xl max-md:border-0 max-md:bg-white max-md:shadow-[0_2px_16px_rgba(15,23,42,0.08)] max-md:ring-0",
  planSectionHeader:
    "max-md:mb-3 max-md:flex max-md:flex-row max-md:items-center max-md:justify-between max-md:gap-2",
  planSectionTitle: "max-md:text-[15px] max-md:font-semibold max-md:tracking-tight",
  planStickyTop:
    "max-md:border-0 max-md:border-b max-md:border-slate-200/80 max-md:bg-white/90 max-md:shadow-none max-md:ring-0 max-md:backdrop-blur-xl max-md:supports-[backdrop-filter]:bg-white/82",
  card:
    "max-md:rounded-2xl max-md:border-0 max-md:bg-white max-md:shadow-[0_2px_14px_rgba(15,23,42,0.07)] max-md:overflow-x-hidden md:rounded-xl md:border md:border-slate-200/70 md:shadow-sm",
  planHeaderCard:
    "max-md:rounded-none max-md:border-0 max-md:shadow-none max-md:ring-0",
  planSegmented:
    "max-md:m-2 max-md:flex max-md:flex-wrap max-md:gap-1 max-md:overflow-visible max-md:rounded-2xl max-md:bg-slate-200/75 max-md:p-1",
  touchBtn: "max-md:h-11 max-md:rounded-xl",
  panelGhost:
    "max-md:!border-0 max-md:!bg-transparent max-md:!shadow-none",
} as const;

/** Consistent fees-module buttons (use with shadcn Button). */
export const FEES_BTN = {
  primary: "h-9 gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-dark",
  secondary:
    "h-9 gap-2 rounded-lg border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50",
  ghost:
    "h-9 gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  icon: "h-9 w-9 shrink-0 rounded-lg border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50",
} as const;
