import { getWeekStartDate } from "@/lib/timetable/week";

const MS_PER_DAY = 86_400_000;
const UTC = "UTC";
const SUNDAY = 0;
const MONDAY = 1;
const SATURDAY = 6;
const DAYS_TO_MONDAY_FROM_SATURDAY = 2;
const DAYS_TO_MONDAY_FROM_SUNDAY = 1;

export type FocusDayLabel = "Today" | "Tomorrow" | "Up next";

export type DisplayWeek = {
  weekStartYmd: string;
  /** Weekday to highlight: today, or Monday when it's the weekend. */
  focusDayOfWeek: number;
  focusLabel: FocusDayLabel;
  /** True on weekends, when the grid previews the coming week. */
  isUpcomingWeek: boolean;
};

/** Which week to show for a school-local date (`YYYY-MM-DD`), and which day in it matters most. */
export function getDisplayWeek(todayYmd: string): DisplayWeek {
  const [year, month, day] = todayYmd.split("-").map(Number);
  const todayUtc = Date.UTC(year, month - 1, day);
  const dayOfWeek = new Date(todayUtc).getUTCDay();

  if (dayOfWeek !== SATURDAY && dayOfWeek !== SUNDAY) {
    return {
      weekStartYmd: getWeekStartDate(new Date(todayUtc), UTC),
      focusDayOfWeek: dayOfWeek,
      focusLabel: "Today",
      isUpcomingWeek: false,
    };
  }

  const isSunday = dayOfWeek === SUNDAY;
  const daysToMonday = isSunday ? DAYS_TO_MONDAY_FROM_SUNDAY : DAYS_TO_MONDAY_FROM_SATURDAY;
  return {
    weekStartYmd: getWeekStartDate(new Date(todayUtc + daysToMonday * MS_PER_DAY), UTC),
    focusDayOfWeek: MONDAY,
    focusLabel: isSunday ? "Tomorrow" : "Up next",
    isUpcomingWeek: true,
  };
}
