'use client'

import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import type { Matcher } from 'react-day-picker'

import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

export const onboardingCalendarClassNames = {
  month_caption: 'relative flex h-8 w-full items-center justify-center',
  caption_label: 'text-sm font-semibold text-slate-800 dark:text-slate-100',
  button_previous: cn(
    'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200',
    'bg-white text-slate-600 hover:border-[#246a59]/30 hover:bg-[#246a59]/10 hover:text-[#246a59]',
    'dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-[#246a59]/20',
  ),
  button_next: cn(
    'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200',
    'bg-white text-slate-600 hover:border-[#246a59]/30 hover:bg-[#246a59]/10 hover:text-[#246a59]',
    'dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-[#246a59]/20',
  ),
  weekday:
    'w-9 pb-1 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-slate-400',
  day: 'relative p-0 text-center align-middle',
  day_button: cn(
    'h-8 w-8 rounded-md p-0 text-sm font-medium text-slate-700 dark:text-slate-200',
    'hover:bg-[#246a59]/15 hover:text-[#1a4d42] dark:hover:text-[#246a59]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/40',
  ),
  selected:
    '[&>button]:bg-[#246a59] [&>button]:text-white [&>button]:hover:bg-[#1a4d42] [&>button]:hover:text-white',
  today:
    '[&>button]:bg-[#246a59]/10 [&>button]:font-semibold [&>button]:text-[#246a59] [&>button]:ring-1 [&>button]:ring-[#246a59]/25',
  outside: '[&>button]:text-slate-400 [&>button]:opacity-70 dark:[&>button]:text-slate-500',
  disabled:
    '[&>button]:cursor-not-allowed [&>button]:text-slate-300 [&>button]:opacity-40 [&>button]:hover:bg-transparent',
  hidden: 'invisible',
}

type OnboardingCalendarProps = {
  selected?: Date
  onSelect: (date: Date | undefined) => void
  disabled?: Matcher | Matcher[]
  defaultMonth?: Date
}

export function OnboardingCalendar({
  selected,
  onSelect,
  disabled,
  defaultMonth,
}: OnboardingCalendarProps) {
  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      defaultMonth={defaultMonth ?? selected}
      showOutsideDays
      className="bg-white p-2 dark:bg-slate-900"
      classNames={onboardingCalendarClassNames}
    />
  )
}

export function CalendarPopoverHeader({ label, value }: { label: string; value?: Date }) {
  return (
    <div className="border-b border-slate-100 bg-gradient-to-r from-[#f8fbfb] to-white px-3 py-2 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100">
        <CalendarIcon className="h-3.5 w-3.5 text-[#246a59]" />
        {value ? format(value, 'EEEE, d MMMM yyyy') : 'Choose a date'}
      </p>
    </div>
  )
}

export function parseIsoDate(iso: string): Date | undefined {
  if (!iso) return undefined
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return undefined
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function toIsoDate(date: Date | undefined): string {
  if (!date) return ''
  return format(date, 'yyyy-MM-dd')
}

export function buildDisabledMatchers(min?: string, max?: string): Matcher[] {
  const matchers: Matcher[] = []
  const minDate = min ? parseIsoDate(min) : undefined
  const maxDate = max ? parseIsoDate(max) : undefined
  if (minDate) matchers.push({ before: minDate })
  if (maxDate) matchers.push({ after: maxDate })
  return matchers
}
