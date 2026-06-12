'use client'

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  examIconTileClass,
  examTimetableDayStripClass,
  examTimetableDayStripHeaderClass,
  examTimetableDayTabsTrackClass,
} from './exam-session-ui'
import {
  formatDurationMinutes,
  formatExamDayHeader,
} from './exam-timetable.utils'

function ExamDayPill({
  weekday,
  label,
  active,
  count,
  durationLabel,
  onClick,
}: {
  weekday: string
  label: string
  active: boolean
  count: number
  durationLabel: string | null
  onClick: () => void
}) {
  const hasExams = count > 0 || Boolean(durationLabel)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative shrink-0 snap-start overflow-hidden text-center transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/40 focus-visible:ring-offset-2',
        active
          ? 'z-[1] min-w-[4.5rem] scale-[1.03] rounded-2xl px-2.5 py-1.5 shadow-lg shadow-[#246a59]/35 ring-1 ring-white/20 sm:min-w-[5rem] sm:px-3 sm:py-2'
          : cn(
              'min-w-[3.75rem] rounded-xl px-2 py-1 sm:min-w-[4.25rem] sm:px-2.5 sm:py-1.5',
              hasExams
                ? 'border border-slate-200/70 bg-white shadow-sm hover:-translate-y-0.5 hover:border-[#246a59]/35 hover:shadow-md dark:border-slate-700 dark:bg-slate-900'
                : 'border border-dashed border-slate-200/80 bg-slate-50/40 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-900',
            ),
      )}
    >
      {/* Active gradient shell */}
      {active ? (
        <>
          <span
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#2f8f7a] via-[#246a59] to-[#1a4c40]"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -right-3 -top-3 h-10 w-10 rounded-full bg-white/10 blur-sm"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
            aria-hidden
          />
        </>
      ) : hasExams ? (
        <>
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#246a59]/0 via-[#246a59]/60 to-[#0073ea]/40 opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute bottom-0 left-1.5 right-1.5 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent dark:via-slate-700"
            aria-hidden
          />
        </>
      ) : null}

      {/* Left accent rail */}
      <span
        className={cn(
          'pointer-events-none absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-r-full transition-all',
          active
            ? 'bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.4)]'
            : hasExams
              ? 'bg-gradient-to-b from-[#246a59] to-[#0073ea]/70 opacity-70 group-hover:opacity-100'
              : 'bg-slate-200/80 dark:bg-slate-700',
        )}
        aria-hidden
      />

      <div className="relative flex flex-col items-center pl-1">
        {/* Weekday badge */}
        <span
          className={cn(
            'rounded-md px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.12em] sm:text-[10px]',
            active
              ? 'bg-white/15 text-white/90 backdrop-blur-sm'
              : hasExams
                ? 'bg-[#246a59]/8 text-[#246a59] dark:bg-[#246a59]/15 dark:text-emerald-300'
                : 'text-slate-400',
          )}
        >
          {weekday}
        </span>

        {/* Date */}
        <span
          className={cn(
            'mt-0.5 text-[11px] font-bold leading-none tracking-tight sm:text-xs',
            active
              ? 'text-white'
              : hasExams
                ? 'text-slate-800 dark:text-slate-100'
                : 'text-slate-500 dark:text-slate-400',
          )}
        >
          {label}
        </span>

        {/* Stats row */}
        {hasExams ? (
          <div
            className={cn(
              'mt-1 flex flex-wrap items-center justify-center gap-1',
              active ? 'text-white/85' : 'text-slate-500',
            )}
          >
            {count > 0 ? (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[9px] font-semibold tabular-nums sm:text-[10px]',
                  active
                    ? 'bg-white/20 text-white'
                    : 'bg-[#246a59]/10 text-[#246a59] ring-1 ring-[#246a59]/10 dark:bg-[#246a59]/20 dark:text-emerald-300',
                )}
              >
                <span
                  className={cn(
                    'h-1 w-1 rounded-full',
                    active ? 'bg-emerald-200' : 'bg-[#246a59]',
                  )}
                />
                {count}
              </span>
            ) : null}
            {durationLabel ? (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-[9px] font-medium sm:text-[10px]',
                  active ? 'text-white/80' : 'text-slate-400',
                )}
              >
                <Clock className="h-2 w-2 shrink-0 opacity-70" />
                {durationLabel}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </button>
  )
}

export function ExamTimetableDayTabs({
  examDays,
  selectedDay,
  onSelectDay,
  countForDay,
  durationForDay,
  className,
  centered = true,
}: {
  examDays: string[]
  selectedDay: string
  onSelectDay: (day: string) => void
  countForDay?: (day: string) => number
  durationForDay?: (day: string) => number
  className?: string
  centered?: boolean
}) {
  if (examDays.length === 0) return null

  return (
    <div className={cn(examTimetableDayTabsTrackClass, className)}>
      {/* Subtle track texture */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(circle_at_50%_120%,rgba(36,106,89,0.06),transparent_55%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(36,106,89,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className={cn(
          'relative inline-flex min-w-min items-start gap-2 sm:gap-2.5',
          centered && 'mx-auto',
        )}
      >
        {examDays.map((day) => {
          const { weekday, label } = formatExamDayHeader(day)
          const count = countForDay?.(day) ?? 0
          const durationMins = durationForDay?.(day) ?? 0
          const durationLabel =
            durationMins > 0 ? formatDurationMinutes(durationMins) : null

          return (
            <ExamDayPill
              key={day}
              weekday={weekday}
              label={label}
              active={day === selectedDay}
              count={count}
              durationLabel={durationLabel}
              onClick={() => onSelectDay(day)}
            />
          )
        })}
      </div>
    </div>
  )
}

export function ExamTimetableDayToolbar({
  icon: Icon,
  title,
  subtitle,
  meta,
  examDays,
  selectedDay,
  onSelectDay,
  countForDay,
  durationForDay,
  className,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  meta?: ReactNode
  examDays: string[]
  selectedDay: string
  onSelectDay: (day: string) => void
  countForDay?: (day: string) => number
  durationForDay?: (day: string) => number
  className?: string
}) {
  if (examDays.length === 0) return null

  return (
    <div className={cn(examTimetableDayStripClass, className)}>
      <div className={examTimetableDayStripHeaderClass}>
        <div className="flex min-w-0 items-center gap-2">
          <div className={cn(examIconTileClass('teal'), 'h-8 w-8')}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 sm:text-sm">
              {title}
            </p>
            {subtitle ? (
              <p className="truncate text-[10px] text-slate-600 sm:text-[11px]">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {meta ? (
          <div className="flex flex-wrap items-center gap-1.5">{meta}</div>
        ) : null}
      </div>

      <ExamTimetableDayTabs
        examDays={examDays}
        selectedDay={selectedDay}
        onSelectDay={onSelectDay}
        countForDay={countForDay}
        durationForDay={durationForDay}
        centered
      />
    </div>
  )
}

export function ExamTimetableMetaChip({
  children,
  tone = 'muted',
}: {
  children: ReactNode
  tone?: 'muted' | 'teal'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tabular-nums',
        tone === 'teal'
          ? 'border-[#246a59]/20 bg-gradient-to-r from-[#246a59]/10 to-[#246a59]/5 text-[#246a59] shadow-sm dark:border-[#246a59]/30 dark:from-[#246a59]/20 dark:to-[#246a59]/10'
          : 'border-slate-200/80 bg-white text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
      )}
    >
      {children}
    </span>
  )
}
