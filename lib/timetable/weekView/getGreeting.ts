const AFTERNOON_STARTS_AT_HOUR = 12;
const EVENING_STARTS_AT_HOUR = 17;

function partOfDay(hour: number): string {
  if (hour < AFTERNOON_STARTS_AT_HOUR) return "morning";
  if (hour < EVENING_STARTS_AT_HOUR) return "afternoon";
  return "evening";
}

/** "Good morning, Jane" — falls back to a plain greeting without a name. */
export function getGreeting(hour: number, fullName?: string): string {
  const firstName = fullName?.trim().split(/\s+/)[0];
  const greeting = `Good ${partOfDay(hour)}`;
  return firstName ? `${greeting}, ${firstName}` : greeting;
}
