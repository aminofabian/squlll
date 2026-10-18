import type { TimetableDay, TimetableSlot } from "@/lib/timetable/types";

const MINUTES_PER_HOUR = 60;

export type TeachingWeekSummary = {
  teachingMinutes: number;
  teachingTimeLabel: string;
  distinctClasses: number;
};

function toMinutes(time: string): number | null {
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * MINUTES_PER_HOUR + minutes;
}

function slotDuration(slot: TimetableSlot | undefined): number {
  if (!slot?.startTime || !slot.endTime) return 0;
  const start = toMinutes(slot.startTime);
  const end = toMinutes(slot.endTime);
  if (start == null || end == null || end <= start) return 0;
  return end - start;
}

function formatTeachingTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  if (hours === 0) return `${minutes}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

/** Contact time and number of distinct classes across the teacher's week. */
export function summarizeTeachingWeek(
  days: TimetableDay[],
  timeSlots: TimetableSlot[],
): TeachingWeekSummary {
  let teachingMinutes = 0;
  const classKeys = new Set<string>();

  for (const day of days) {
    day.cells.forEach((cell, slotIndex) => {
      if (cell?.type !== "lesson" || !cell.lesson) return;
      teachingMinutes += slotDuration(timeSlots[slotIndex]);
      classKeys.add(`${cell.lesson.grade.id}:${cell.lesson.stream ?? ""}`);
    });
  }

  return {
    teachingMinutes,
    teachingTimeLabel: formatTeachingTime(teachingMinutes),
    distinctClasses: classKeys.size,
  };
}
