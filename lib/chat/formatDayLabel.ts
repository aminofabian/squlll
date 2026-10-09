import { CHAT_LIMITS } from './constants'

const WEEK_DAYS = 7

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function calendarDaysBetween(date: Date, now: Date): number {
  const diff = startOfLocalDay(now) - startOfLocalDay(date)
  return Math.round(diff / CHAT_LIMITS.msPerDay)
}

export function formatDayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const days = calendarDaysBetween(date, now)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return new Intl.DateTimeFormat(undefined, {
    weekday: days < WEEK_DAYS ? 'long' : undefined,
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  }).format(date)
}
