import type { WeekDayDate } from "./getWeekDayDates";

/** "19 – 23 Oct", or "29 Sep – 3 Oct" when the week crosses a month. */
export function formatWeekRangeLabel(dates: WeekDayDate[]): string {
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (!first || !last) return "";

  if (first.monthShort === last.monthShort) {
    return `${first.dayOfMonth} – ${last.dayOfMonth} ${last.monthShort}`;
  }
  return `${first.dayOfMonth} ${first.monthShort} – ${last.dayOfMonth} ${last.monthShort}`;
}
