'use client'

import * as React from 'react'
import { format, addDays, startOfToday } from 'date-fns'
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Sparkles,
  X,
} from 'lucide-react'
import type { Matcher } from 'react-day-picker'
import { dateMatchModifiers } from 'react-day-picker'

import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  onboardingCalendarClassNames,
  parseIsoDate,
  toIsoDate,
  buildDisabledMatchers,
} from '@/app/school/components/onboarding/onboarding-calendar'

export { parseIsoDate, toIsoDate, buildDisabledMatchers }

function jsDayToExamDay(date: Date): number {
  const js = date.getDay()
  return js === 0 ? 7 : js
}

function buildAllowedWeekdayMatcher(allowedWeekdays?: number[]): Matcher | undefined {
  if (!allowedWeekdays?.length) return undefined
  const allowed = new Set(allowedWeekdays)
  return (date) => !allowed.has(jsDayToExamDay(date))
}

export interface StyledDatePickerProps {
  value?: string
  onChange: (value: string) => void
  label?: string
  hint?: string
  placeholder?: string
  minDate?: string
  maxDate?: string
  /** 1 = Mon … 7 = Sun — disables other weekdays in the calendar */
  allowedWeekdays?: number[]
  disabled?: boolean
  clearable?: boolean
  showQuickPicks?: boolean
  size?: 'sm' | 'default'
  /** Single-line trigger for toolbars and compact forms */
  variant?: 'default' | 'inline'
  id?: string
  name?: string
  className?: string
  align?: 'start' | 'center' | 'end'
}

export function StyledDatePicker({
  value = '',
  onChange,
  label,
  hint,
  placeholder = 'Pick a date',
  minDate,
  maxDate,
  allowedWeekdays,
  disabled = false,
  clearable = true,
  showQuickPicks = true,
  size = 'default',
  variant = 'default',
  id,
  name,
  className,
  align = 'start',
}: StyledDatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = parseIsoDate(value)

  const disabledMatchers = React.useMemo(() => {
    const matchers = buildDisabledMatchers(minDate, maxDate)
    const weekdayMatcher = buildAllowedWeekdayMatcher(allowedWeekdays)
    if (weekdayMatcher) matchers.push(weekdayMatcher)
    return matchers
  }, [minDate, maxDate, allowedWeekdays])

  const isDateDisabled = React.useCallback(
    (date: Date) =>
      disabledMatchers.length > 0 &&
      dateMatchModifiers(date, disabledMatchers),
    [disabledMatchers],
  )

  const pickDate = (date: Date | undefined) => {
    if (!date) return
    onChange(toIsoDate(date))
    setOpen(false)
  }

  const clear = (event: React.MouseEvent) => {
    event.stopPropagation()
    onChange('')
  }

  const quickPicks = React.useMemo(() => {
    if (!showQuickPicks) return []
    const today = startOfToday()
    const candidates = [
      { label: 'Today', date: today },
      { label: 'Tomorrow', date: addDays(today, 1) },
      { label: 'In 1 week', date: addDays(today, 7) },
    ]
    return candidates.filter(({ date }) => !isDateDisabled(date))
  }, [showQuickPicks, isDateDisabled])

  const isInline = variant === 'inline'
  const triggerHeight = isInline ? 'h-8' : size === 'sm' ? 'h-9' : 'h-11'

  return (
    <div className={cn(variant === 'default' && 'space-y-1.5', className)}>
      {label ? (
        <Label
          htmlFor={id}
          className={cn(
            'text-slate-600 dark:text-slate-400',
            isInline ? 'text-[10px] font-medium uppercase tracking-wide' : 'text-xs',
          )}
        >
          {label}
        </Label>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            id={id}
            name={name}
            type="button"
            disabled={disabled}
            className={cn(
              'group flex w-full items-center text-left transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/30',
              'disabled:cursor-not-allowed disabled:opacity-50',
              isInline
                ? cn(
                    'gap-1.5 rounded-lg border border-slate-200 bg-white px-2 shadow-none',
                    'hover:border-[#246a59]/35 dark:border-slate-700 dark:bg-slate-900',
                    selected && 'border-[#246a59]/30',
                  )
                : cn(
                    'gap-2.5 rounded-xl border bg-gradient-to-r px-2.5 shadow-sm',
                    'border-slate-200/90 from-white to-slate-50/80',
                    'hover:border-[#246a59]/35 hover:shadow-md hover:shadow-[#246a59]/5',
                    'dark:border-slate-700 dark:from-slate-900 dark:to-slate-900/80',
                    selected
                      ? 'border-[#246a59]/25 ring-1 ring-[#246a59]/10'
                      : 'border-dashed',
                  ),
              triggerHeight,
            )}
          >
            <span
              className={cn(
                'flex shrink-0 items-center justify-center rounded-md',
                isInline
                  ? 'h-5 w-5 text-[#246a59]'
                  : cn(
                      size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
                      'rounded-lg',
                      selected
                        ? 'bg-[#246a59] text-white shadow-sm'
                        : 'bg-[#246a59]/10 text-[#246a59]',
                    ),
              )}
            >
              <CalendarIcon
                className={
                  isInline ? 'h-3 w-3' : size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
                }
              />
            </span>

            <span className="min-w-0 flex-1">
              {selected ? (
                isInline ? (
                  <span className="block truncate text-xs font-medium text-slate-800 dark:text-slate-100">
                    {format(selected, 'd MMM yyyy')}
                  </span>
                ) : (
                  <>
                    <span className="block truncate text-[10px] font-semibold uppercase tracking-wider text-[#246a59]">
                      {format(selected, 'EEEE')}
                    </span>
                    <span
                      className={cn(
                        'block truncate font-semibold text-slate-900 dark:text-slate-100',
                        size === 'sm' ? 'text-xs' : 'text-sm',
                      )}
                    >
                      {format(selected, 'd MMM yyyy')}
                    </span>
                  </>
                )
              ) : (
                <span
                  className={cn(
                    'block truncate text-slate-400',
                    isInline || size === 'sm' ? 'text-xs' : 'text-sm',
                  )}
                >
                  {placeholder}
                </span>
              )}
            </span>

            <span className="flex shrink-0 items-center gap-0.5">
              {clearable && selected && !disabled ? (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Clear date"
                  className="rounded-md p-1 text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-800"
                  onClick={clear}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onChange('')
                    }
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              ) : null}
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-slate-400 transition-transform',
                  open && 'rotate-180',
                )}
              />
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align={align}
          className="w-auto overflow-hidden rounded-xl border-slate-200/80 p-0 shadow-lg dark:border-slate-700"
          sideOffset={6}
        >
          <div className="border-b border-slate-100 bg-gradient-to-br from-[#f3faf8] via-white to-slate-50 px-3 py-2 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {label ?? 'Select date'}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-100">
                  <Sparkles className="h-3 w-3 shrink-0 text-[#246a59]" />
                  <span className="truncate">
                    {selected
                      ? format(selected, 'EEE, d MMM yyyy')
                      : 'Choose a day'}
                  </span>
                </p>
              </div>
              {minDate || maxDate ? (
                <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-500 shadow-sm dark:bg-slate-800">
                  {minDate && maxDate
                    ? `${format(parseIsoDate(minDate)!, 'd MMM')} – ${format(parseIsoDate(maxDate)!, 'd MMM')}`
                    : minDate
                      ? `From ${format(parseIsoDate(minDate)!, 'd MMM')}`
                      : `Until ${format(parseIsoDate(maxDate!)!, 'd MMM')}`}
                </span>
              ) : null}
            </div>
          </div>

          <Calendar
            mode="single"
            selected={selected}
            onSelect={pickDate}
            disabled={disabledMatchers.length ? disabledMatchers : undefined}
            defaultMonth={selected ?? parseIsoDate(minDate) ?? new Date()}
            showOutsideDays
            className="bg-white p-1 dark:bg-slate-900"
            classNames={onboardingCalendarClassNames}
          />

          {quickPicks.length > 0 ? (
            <div className="flex flex-wrap gap-1 border-t border-slate-100 bg-slate-50/80 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-900/60">
              {quickPicks.map(({ label: pickLabel, date }) => (
                <button
                  key={pickLabel}
                  type="button"
                  onClick={() => pickDate(date)}
                  className={cn(
                    'rounded-md border border-slate-200/80 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 transition-colors',
                    'hover:border-[#246a59]/30 hover:bg-[#246a59]/5 hover:text-[#246a59]',
                    'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
                    value === toIsoDate(date) &&
                      'border-[#246a59]/40 bg-[#246a59]/10 text-[#246a59]',
                  )}
                >
                  {pickLabel}
                </button>
              ))}
            </div>
          ) : null}
        </PopoverContent>
      </Popover>

      {hint ? (
        <p className="text-[11px] text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}
