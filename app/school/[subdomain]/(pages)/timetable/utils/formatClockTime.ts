/**
 * Format a clock string from the API ("08:00" or "08:00:00") as 12-hour time
 * with no seconds, e.g. "8:00 AM". Use this for every user-facing time so the
 * whole timetable module reads consistently.
 */
export function formatClockTime(value: string | null | undefined): string {
  if (!value) return "";
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return value;
  const hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
}
