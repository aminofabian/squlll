const UTC_TIME_ZONE = 'UTC'

export function getCalendarParts(lessonDate: string, locale?: string) {
  const date = new Date(`${lessonDate}T12:00:00Z`)
  const format = (options: Intl.DateTimeFormatOptions) =>
    date.toLocaleDateString(locale, { ...options, timeZone: UTC_TIME_ZONE })
  return {
    day: date.getUTCDate(),
    month: format({ month: 'short' }),
    weekday: format({ weekday: 'long' }),
    longDate: format({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  }
}
