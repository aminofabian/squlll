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
