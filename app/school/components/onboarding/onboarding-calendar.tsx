'use client'

import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import type { Matcher } from 'react-day-picker'

import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

export const onboardingCalendarClassNames = {
  months: 'flex flex-col',
  month: 'gap-3',
  caption: 'flex justify-center pt-1 relative items-center',
  caption_label: 'text-sm font-semibold text-slate-800 dark:text-slate-100',
  nav: 'flex items-center gap-1',
  nav_button: cn(
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200',
    'bg-white text-slate-600 hover:bg-[#246a59]/10 hover:text-[#246a59] hover:border-[#246a59]/30',
    'dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-[#246a59]/20',
  ),
  nav_button_previous: 'absolute left-0',
  nav_button_next: 'absolute right-0',
  table: 'w-full border-collapse',
  head_row: 'flex',
  head_cell: 'text-slate-400 w-9 font-medium text-[0.7rem] uppercase tracking-wide',
  row: 'flex w-full mt-1',
  cell: cn(
    'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
    '[&:has([aria-selected])]:bg-[#246a59]/10 [&:has([aria-selected])]:rounded-lg',
  ),
  day: cn(
    'h-9 w-9 p-0 font-medium rounded-lg text-slate-700 dark:text-slate-200',
    'hover:bg-[#246a59]/15 hover:text-[#1a4d42] dark:hover:text-[#246a59]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/40',
    'aria-selected:opacity-100',
  ),
  day_selected:
    'bg-[#246a59] text-white hover:bg-[#1a4d42] hover:text-white focus:bg-[#246a59] focus:text-white rounded-lg',
  day_today: 'bg-[#246a59]/10 text-[#246a59] font-semibold ring-1 ring-[#246a59]/25 rounded-lg',
  day_outside: 'text-slate-300 aria-selected:text-slate-300 dark:text-slate-600',
  day_disabled: 'text-slate-300 opacity-40 cursor-not-allowed hover:bg-transparent',
  day_hidden: 'invisible',
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
      className="p-3 bg-white dark:bg-slate-900"
      classNames={onboardingCalendarClassNames}
    />
  )
}

export function CalendarPopoverHeader({ label, value }: { label: string; value?: Date }) {
  return (
    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-[#f8fbfb] to-white dark:from-slate-900 dark:to-slate-900">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5 flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-[#246a59]" />
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
