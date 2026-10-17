import type { Grade, TimetableEntry, TimeSlot } from "@/lib/types/timetable";
import { resolveCanonicalGradeId } from "./resolveGradeForSchoolConfig";

/** Unique teaching period numbers (1-based), sorted ascending. */
export function dedupePeriodNumbers(
  sources: Array<number[] | undefined>,
): number[] {
  const set = new Set<number>();
  for (const list of sources) {
    for (const n of list ?? []) {
      if (typeof n === "number" && n >= 1) set.add(n);
    }
  }
  return Array.from(set).sort((a, b) => a - b);
}

/** Teaching periods per day — not raw timeSlots.length (that counts every day template row). */
export function getPeriodsPerDay(options: {
  periodNumbers?: number[];
  timeSlots?: TimeSlot[];
  lessonPeriodsPerDay?: number;
}): number {
  const fromSlots = new Set(
    (options.timeSlots ?? [])
      .map((s) => s.periodNumber)
      .filter((n): n is number => typeof n === "number" && n >= 1),
  );
  if (fromSlots.size > 0) return fromSlots.size;

  const fromList = dedupePeriodNumbers([options.periodNumbers]);
  if (fromList.length > 0) return fromList.length;

  if (options.lessonPeriodsPerDay && options.lessonPeriodsPerDay > 0) {
    return options.lessonPeriodsPerDay;
  }

  return 0;
}

/** Grades with streams count as one unit per stream; otherwise one per grade. */
export function countGradeStreamUnits(grades: Grade[]): number {
  return grades.reduce(
    (sum, grade) => sum + (grade.streams?.length ? grade.streams.length : 1),
    0,
  );
}

export function slotsPerClassWeek(
  periodsPerDay: number,
  daysPerWeek: number,
): number {
  if (periodsPerDay <= 0 || daysPerWeek <= 0) return 0;
  return periodsPerDay * daysPerWeek;
}

/** Longer than this is a week total that leaked into "periods per day". */
export const MAX_PERIODS_PER_DAY = 16;

function sanePeriodsPerDay(value: number | undefined): number {
  if (typeof value !== "number" || value < 1 || value > MAX_PERIODS_PER_DAY) {
    return 0;
  }
  return Math.floor(value);
}

function uniqueSlotPeriods(
  timeSlots: Array<{ periodNumber?: number }> | undefined,
): number {
  const periods = new Set<number>();
  for (const slot of timeSlots ?? []) {
    if (typeof slot.periodNumber === "number" && slot.periodNumber >= 1) {
      periods.add(slot.periodNumber);
    }
  }
  return periods.size;
}

/**
 * Slots one class can sit in this week: lessons per day × school days.
 * Ten lessons a day from Monday to Friday is 50, not 10.
 */
export function classWeeklySlotCount(options: {
  timeSlots?: Array<{ periodNumber?: number }>;
  periodNumbers?: number[];
  lessonPeriodsPerDay?: number;
  daysPerWeek: number;
  templatePeriodCounts?: number[];
}): number {
  const fromSlots = uniqueSlotPeriods(options.timeSlots);
  const listed = dedupePeriodNumbers([options.periodNumbers]);
  const fromList =
    listed.length > 0 && listed.length <= MAX_PERIODS_PER_DAY
      ? listed.length
      : 0;
  const fromTemplates = Math.max(
    0,
    ...(options.templatePeriodCounts ?? []).map((count) =>
      sanePeriodsPerDay(count),
    ),
  );
  const periodsPerDay = Math.max(
    fromSlots,
    fromList,
    sanePeriodsPerDay(options.lessonPeriodsPerDay),
    fromTemplates,
  );
  return slotsPerClassWeek(periodsPerDay, options.daysPerWeek);
}

export function entryOccupancyKey(
  entry: TimetableEntry,
  grades: Grade[],
  timeSlots: TimeSlot[],
): string | null {
  const gradeId = resolveCanonicalGradeId(entry.gradeId, grades);
  const period =
    entry.periodNumber ??
    timeSlots.find((ts) => ts.id === entry.timeSlotId)?.periodNumber;
  if (!period || !entry.dayOfWeek) return null;
  return `${gradeId}:${entry.streamId ?? ""}:${entry.dayOfWeek}:${period}`;
}

export function countFilledSlots(
  entries: TimetableEntry[],
  grades: Grade[],
  timeSlots: TimeSlot[],
): number {
  const keys = new Set<string>();
  for (const entry of entries) {
    const key = entryOccupancyKey(entry, grades, timeSlots);
    if (key) keys.add(key);
  }
  return keys.size;
}

export function countFilledSlotsForGrade(
  entries: TimetableEntry[],
  gradeId: string,
  streamId: string | null | undefined,
  grades: Grade[],
  timeSlots: TimeSlot[],
): number {
  const keys = new Set<string>();
  for (const entry of entries) {
    const canonical = resolveCanonicalGradeId(entry.gradeId, grades);
    if (canonical !== gradeId) continue;
    if (streamId) {
      if (entry.streamId !== streamId) continue;
    } else if (entry.streamId) {
      continue;
    }
    const key = entryOccupancyKey(entry, grades, timeSlots);
    if (key) keys.add(key);
  }
  return keys.size;
}
