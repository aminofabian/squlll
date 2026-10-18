import { formatStartsIn } from "./formatStartsIn";

const SECONDS_PER_HOUR = 3600;
const COUNTDOWN_HORIZON_HOURS = 12;
const TIME_RANGE_SEPARATOR = /\s*[–—-]\s*/;

export type NextLessonStart = {
  caption: string;
  value: string;
  isCountdown: boolean;
};

/**
 * Live countdown while the lesson is close ("Starts in 18m 05s");
 * a calendar phrase once it's further out ("Tomorrow, 11:25").
 */
export function describeNextLessonStart(
  secondsUntil: number,
  timeRange: string,
  dayLabel?: string | null,
): NextLessonStart {
  const isClose = !dayLabel && secondsUntil < COUNTDOWN_HORIZON_HOURS * SECONDS_PER_HOUR;
  if (isClose) {
    return { caption: "Starts in", value: formatStartsIn(secondsUntil), isCountdown: true };
  }
  const startClock = timeRange.split(TIME_RANGE_SEPARATOR)[0]?.trim() ?? timeRange;
  return {
    caption: "Starts",
    value: `${dayLabel ?? "Later today"}, ${startClock}`,
    isCountdown: false,
  };
}
