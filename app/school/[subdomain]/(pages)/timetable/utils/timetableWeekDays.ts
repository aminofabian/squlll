import { SCHOOL_DAYS } from "@/lib/constants/breakTypes";

export const TIMETABLE_DAY_LABELS = [
  ...SCHOOL_DAYS,
  "Saturday",
  "Sunday",
] as const;

export function inferDaysPerWeek(sources: {
  timeSlots?: Array<{ dayOfWeek?: number }>;
  entries?: Array<{ dayOfWeek: number }>;
  breaks?: Array<{ dayOfWeek?: number }>;
}): number {
  let maxDay = 5;
  const bump = (d?: number | null) => {
    if (typeof d === "number" && d >= 1 && d <= 7) {
      maxDay = Math.max(maxDay, d);
    }
  };
  sources.timeSlots?.forEach((s) => bump(s.dayOfWeek));
  sources.entries?.forEach((e) => bump(e.dayOfWeek));
  sources.breaks?.forEach((b) => bump(b.dayOfWeek));
  return Math.min(7, Math.max(1, maxDay));
}

export function dayLabelsForCount(daysPerWeek: number): string[] {
  const n = Math.min(7, Math.max(1, daysPerWeek));
  return TIMETABLE_DAY_LABELS.slice(0, n);
}

/** Resolve visible school days from live timetable data (preferred over totalDays). */
export function resolveTimetableWeekDays(sources: {
  timeSlots?: Array<{ dayOfWeek?: number }>;
  entries?: Array<{ dayOfWeek: number }>;
  breaks?: Array<{ dayOfWeek?: number }>;
  daysPerWeekFromApi?: number | null;
  fallback?: number;
}): { daysPerWeek: number; dayLabels: string[] } {
  const inferred = inferDaysPerWeek(sources);
  const fromApi =
    typeof sources.daysPerWeekFromApi === "number" &&
    sources.daysPerWeekFromApi >= 1
      ? sources.daysPerWeekFromApi
      : null;

  const hasSlotDays = (sources.timeSlots ?? []).some(
    (s) => typeof s.dayOfWeek === "number",
  );

  // Grade/stream slots reflect the actual bell schedule — don't let whole-school
  // template counts (totalDays) show Sat/Sun when this class only runs Mon–Fri.
  const daysPerWeek = hasSlotDays
    ? inferred
    : (fromApi ?? inferred ?? sources.fallback ?? 5);

  return {
    daysPerWeek,
    dayLabels: dayLabelsForCount(daysPerWeek),
  };
}
