import type { TimeSlot } from "@/lib/types/timetable";

/** Resolve the period row for a given day (1-based) and period number. */
export function getTimeSlotForDayAndPeriod(
  timeSlots: TimeSlot[],
  dayOfWeek: number,
  periodNumber: number,
): TimeSlot | undefined {
  const onDay = timeSlots.find(
    (s) => s.periodNumber === periodNumber && s.dayOfWeek === dayOfWeek,
  );
  if (onDay) return onDay;
  return timeSlots.find(
    (s) => s.periodNumber === periodNumber && !s.dayOfWeek,
  );
}

export function uniquePeriodNumbers(timeSlots: TimeSlot[]): number[] {
  const set = new Set<number>();
  for (const s of timeSlots) {
    if (typeof s.periodNumber === "number" && s.periodNumber >= 1) {
      set.add(s.periodNumber);
    }
  }
  return Array.from(set).sort((a, b) => a - b);
}
