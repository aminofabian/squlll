export function formatWeekRange(startDate: string, endDate: string, locale?: string): string {
  const format = (ymd: string) =>
    new Date(`${ymd}T12:00:00Z`).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    })
  return `${format(startDate)} – ${format(endDate)}`
}
