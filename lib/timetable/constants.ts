/**
 * Timetable Constants
 *
 * Shared constants used across all timetable views.
 */

import type { BreakType } from './types';

// ─── Days ──────────────────────────────────────────────────────

export const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export const WEEK_DAYS_FULL = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

export const DAY_NAMES: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
};

export const DAY_SHORT_NAMES: Record<number, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
};

/** Map JavaScript getDay() (0=Sun) to our day-of-week (1=Mon) */
export function jsDayToDayOfWeek(jsDay: number): number | null {
  if (jsDay === 0 || jsDay === 6) return null; // Weekend
  return jsDay; // 1=Mon through 5=Fri
}

/** Map our day-of-week (1=Mon) to JavaScript getDay() */
export function dayOfWeekToJsDay(dayOfWeek: number): number {
  return dayOfWeek; // Identity for Monday-Friday
}

// ─── Break Types ───────────────────────────────────────────────

export const BREAK_TYPE_CONFIG: Record<BreakType, {
  label: string;
  icon: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}> = {
  RECESS: {
    label: 'Recess',
    icon: '🏃',
    bgClass: 'bg-green-50 dark:bg-green-950/20',
    borderClass: 'border-green-200 dark:border-green-800',
    textClass: 'text-green-700 dark:text-green-300',
  },
  LUNCH: {
    label: 'Lunch',
    icon: '🍽️',
    bgClass: 'bg-orange-50 dark:bg-orange-950/20',
    borderClass: 'border-orange-200 dark:border-orange-800',
    textClass: 'text-orange-700 dark:text-orange-300',
  },
  BREAK: {
    label: 'Break',
    icon: '☕',
    bgClass: 'bg-blue-50 dark:bg-blue-950/20',
    borderClass: 'border-blue-200 dark:border-blue-800',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  ASSEMBLY: {
    label: 'Assembly',
    icon: '🏫',
    bgClass: 'bg-purple-50 dark:bg-purple-950/20',
    borderClass: 'border-purple-200 dark:border-purple-800',
    textClass: 'text-purple-700 dark:text-purple-300',
  },
  EXAM: {
    label: 'Exam',
    icon: '📝',
    bgClass: 'bg-red-50 dark:bg-red-950/20',
    borderClass: 'border-red-200 dark:border-red-800',
    textClass: 'text-red-700 dark:text-red-300',
  },
};

// ─── Subject Colors ────────────────────────────────────────────

/** HSL-based subject color palette – consistent across all views */
export const SUBJECT_COLOR_PALETTE = [
  { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-l-blue-500', text: 'text-blue-700', accent: '#3B82F6' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-l-emerald-500', text: 'text-emerald-700', accent: '#10B981' },
  { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-l-amber-500', text: 'text-amber-700', accent: '#F59E0B' },
  { bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-l-violet-500', text: 'text-violet-700', accent: '#8B5CF6' },
  { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-l-rose-500', text: 'text-rose-700', accent: '#F43F5E' },
  { bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-l-cyan-500', text: 'text-cyan-700', accent: '#06B6D4' },
  { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-l-orange-500', text: 'text-orange-700', accent: '#F97316' },
  { bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-l-teal-500', text: 'text-teal-700', accent: '#14B8A6' },
  { bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-l-pink-500', text: 'text-pink-700', accent: '#EC4899' },
  { bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-l-indigo-500', text: 'text-indigo-700', accent: '#6366F1' },
];

/** Stable key so "Social Studies" and "social studies" share one colour. */
export function normalizeSubjectName(subjectName: string): string {
  return subjectName.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Deterministically assign a color to a subject based on its name.
 * Same subject always gets the same color across all views.
 */
export function getSubjectPaletteColor(subjectName: string) {
  const key = normalizeSubjectName(subjectName);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i);
    hash |= 0;
  }
  return SUBJECT_COLOR_PALETTE[Math.abs(hash) % SUBJECT_COLOR_PALETTE.length];
}

/** Resolve palette from stored accent or subject name. */
export function getLessonSubjectPalette(subject: { name: string; color?: string }) {
  if (subject.color) {
    const match = SUBJECT_COLOR_PALETTE.find((p) => p.accent === subject.color);
    if (match) return match;
  }
  return getSubjectPaletteColor(subject.name);
}

// ─── Status Colors ─────────────────────────────────────────────

export const STATUS_COLORS = {
  lesson: {
    bg: 'bg-primary/10',
    border: 'border-l-primary',
    text: 'text-primary',
    dot: 'bg-primary',
  },
  break: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-l-amber-400',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-400',
  },
  free: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    border: 'border-l-gray-300',
    text: 'text-gray-500',
    dot: 'bg-gray-300',
  },
  weekend: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    border: 'border-l-gray-200',
    text: 'text-gray-400',
    dot: 'bg-gray-200',
  },
  outside: {
    bg: 'bg-gray-50 dark:bg-gray-900',
    border: 'border-l-gray-200',
    text: 'text-gray-400',
    dot: 'bg-gray-200',
  },
} as const;

// ─── Time ──────────────────────────────────────────────────────

/** Default period duration in minutes */
export const DEFAULT_PERIOD_DURATION = 45;

/** Default break duration in minutes */
export const DEFAULT_BREAK_DURATION = 20;

/** Refresh interval for current time (ms) */
export const CURRENT_TIME_REFRESH_MS = 60_000; // 1 minute

// ─── Grid Layout ───────────────────────────────────────────────

/** Minimum height for lesson cells (px) */
export const MIN_CELL_HEIGHT = 60;

/** Time column width (px) */
export const TIME_COLUMN_WIDTH = 170;

/** Breakpoint for mobile view (px) */
export const MOBILE_BREAKPOINT = 768;
