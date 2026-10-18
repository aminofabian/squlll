import { getCountdownParts } from "@/lib/timetable";

const pad = (value: number) => String(value).padStart(2, "0");

/** Short countdown: "2d 4h", "1h 05m", or "12m 08s". */
export function formatStartsIn(totalSeconds: number): string {
  const { days, hours, minutes, seconds } = getCountdownParts(totalSeconds);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${pad(minutes)}m`;
  return `${minutes}m ${pad(seconds)}s`;
}
