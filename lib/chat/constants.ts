export const CHAT_LIMITS = {
  pageSize: 50,
  /** Consecutive messages from one sender within this window share a bubble group. */
  groupWindowMs: 5 * 60 * 1000,
  msPerDay: 24 * 60 * 60 * 1000,
  /** Distance from the bottom (px) still treated as "following the latest message". */
  stickToBottomThresholdPx: 96,
  maxComposerHeightPx: 160,
  unreadBadgeMax: 99,
} as const
