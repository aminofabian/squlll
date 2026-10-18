function trimLeadingZero(time: string): string {
  return time.replace(/^0(\d)/, "$1");
}

/** "8:00–8:40" */
export function formatTimeRange(startTime: string, endTime: string, separator = "–"): string {
  return `${trimLeadingZero(startTime)}${separator}${trimLeadingZero(endTime)}`;
}
