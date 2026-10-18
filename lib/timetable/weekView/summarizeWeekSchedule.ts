import type { TimetableDay, TimetableSlot } from "@/lib/timetable/types";
import { formatDuration } from "./formatDuration";
import { getSlotMinutes } from "./getSlotMinutes";
import { getClassIdentity } from "./getClassIdentity";

export type WeekScheduleSummary = {
  contactMinutes: number;
  contactTimeLabel: string;
  distinctClasses: number;
};

/** Contact time and number of distinct classes across the teacher's week. */
export function summarizeWeekSchedule(
  days: TimetableDay[],
  timeSlots: TimetableSlot[],
): WeekScheduleSummary {
  let contactMinutes = 0;
  const classKeys = new Set<string>();

  for (const day of days) {
    day.cells.forEach((cell, slotIndex) => {
      if (cell?.type !== "lesson" || !cell.lesson) return;
      const slot = timeSlots[slotIndex];
      contactMinutes += getSlotMinutes(slot?.startTime, slot?.endTime);
      classKeys.add(getClassIdentity(cell.lesson).key);
    });
  }

  return {
    contactMinutes,
    contactTimeLabel: formatDuration(contactMinutes),
    distinctClasses: classKeys.size,
  };
}
