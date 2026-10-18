const MINUTES_PER_HOUR = 60;

function toMinutes(time: string | undefined): number | null {
  const [hours, minutes] = (time ?? "").split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * MINUTES_PER_HOUR + minutes;
}

/** Length of a slot in minutes, or 0 when its times are missing or malformed. */
export function getSlotMinutes(startTime?: string, endTime?: string): number {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (start == null || end == null || end <= start) return 0;
  return end - start;
}
