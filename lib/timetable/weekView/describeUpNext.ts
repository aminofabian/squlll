import type { NextLessonInfo, TimetableSlot } from "@/lib/timetable/types";
import { DAY_SHORT_NAMES } from "@/lib/timetable/constants";
import { formatYmdInTimezone } from "@/lib/timetable/week";
import { MONTH_SHORT_NAMES } from "./monthShortNames";
import { formatTimeRange } from "./formatTimeRange";
import { getSlotMinutes } from "./getSlotMinutes";

const SPACED_DASH = " – ";

export type UpNextDescription = {
  /** "11:25 – 12:05" */
  timeRange: string;
  /** "Mon 19 Oct · Period 5 · 40 min" */
  detail: string;
};

function formatShortDate(iso: string): string {
  const [year, month, day] = formatYmdInTimezone(new Date(iso)).split("-").map(Number);
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${DAY_SHORT_NAMES[dayOfWeek] ?? ""} ${day} ${MONTH_SHORT_NAMES[month - 1]}`.trim();
}

/** Time and date lines for the "Up next" card, read from the lesson's slot. */
export function describeUpNext(next: NextLessonInfo, timeSlots: TimetableSlot[]): UpNextDescription {
  const slot = timeSlots.find((item) => item.periodNumber === next.lesson.periodNumber);
  const minutes = getSlotMinutes(slot?.startTime, slot?.endTime);
  const timeRange = slot ? formatTimeRange(slot.startTime, slot.endTime, SPACED_DASH) : next.time;
  const detail = [formatShortDate(next.startsAt), next.period, minutes > 0 ? `${minutes} min` : ""]
    .filter(Boolean)
    .join(" · ");
  return { timeRange, detail };
}
