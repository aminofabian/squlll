const DEFAULT_TZ = 'Africa/Nairobi'

export function formatYmdInTimezone(
  date: Date,
  timeZone: string = DEFAULT_TZ,
): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/** Monday YYYY-MM-DD for the week containing `date` in the school timezone. */
export function getWeekStartDate(
  date: Date = new Date(),
  timeZone: string = DEFAULT_TZ,
): string {
  const ymd = formatYmdInTimezone(date, timeZone)
  const [y, m, d] = ymd.split('-').map(Number)
  const utc = Date.UTC(y, m - 1, d)
  const dow = new Date(utc).getUTCDay()
  const daysFromMonday = (dow + 6) % 7
  const mondayUtc = utc - daysFromMonday * 86_400_000
  const monday = new Date(mondayUtc)
  const yy = monday.getUTCFullYear()
  const mm = String(monday.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(monday.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}
