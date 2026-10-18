const NOON_HOUR = 12
const EVENING_HOUR = 17

export function getGreeting(now: Date): string {
  const hour = now.getHours()
  if (hour < NOON_HOUR) return 'Good morning'
  if (hour < EVENING_HOUR) return 'Good afternoon'
  return 'Good evening'
}
