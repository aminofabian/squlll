const ISO_DATE_LENGTH = 10

export function addDays(ymd: string, days: number): string {
  const date = new Date(`${ymd}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, ISO_DATE_LENGTH)
}
