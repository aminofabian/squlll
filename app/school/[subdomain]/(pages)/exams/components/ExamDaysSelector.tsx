'use client'

import { cn } from '@/lib/utils'
import {
  EXAM_DAY_PRESETS,
  EXAM_WEEKDAY_OPTIONS,
  detectExamDayPreset,
  normalizeExamDaysOfWeek,
  type ExamDayPresetId,
} from '@/lib/exams/examDaysOfWeek'

interface ExamDaysSelectorProps {
  value: number[]
  onChange: (days: number[]) => void
  compact?: boolean
  /** Presets and day toggles on one row when space allows */
  inline?: boolean
}

export function ExamDaysSelector({
  value,
  onChange,
  compact = false,
  inline = false,
}: ExamDaysSelectorProps) {
  const normalized = normalizeExamDaysOfWeek(value)
  const preset = detectExamDayPreset(normalized)

  const applyPreset = (id: Exclude<ExamDayPresetId, 'custom'>) => {
    onChange([...EXAM_DAY_PRESETS[id].days])
  }

  const toggleDay = (day: number) => {
    const set = new Set(normalized)
    if (set.has(day)) {
      if (set.size <= 1) return
      set.delete(day)
    } else {
      set.add(day)
    }
    onChange(Array.from(set).sort((a, b) => a - b))
  }

  const presetButtonClass = (id: Exclude<ExamDayPresetId, 'custom'>) =>
    cn(
      'rounded-md border px-2 py-0.5 font-semibold transition-colors',
      inline || compact ? 'text-[11px]' : 'rounded-lg px-2.5 py-1.5 text-xs text-left',
      preset === id
        ? 'border-[#246a59] bg-[#246a59] text-white dark:border-[#246a59] dark:bg-[#246a59] dark:text-white'
        : 'border-slate-200 bg-white hover:border-[#246a59]/25 hover:bg-[#246a59]/5 dark:border-slate-700 dark:bg-slate-900',
    )

  const dayButtonClass = (active: boolean) =>
    cn(
      'rounded border font-medium transition-colors',
      inline
        ? 'min-w-[1.75rem] px-1 py-0.5 text-[10px] sm:min-w-[2rem] sm:px-1.5 sm:text-[11px]'
        : 'min-w-[2.5rem] px-2 py-1 text-xs',
      active
        ? 'border-[#246a59] bg-[#246a59]/10 text-[#246a59]'
        : 'border-slate-200 text-slate-400 hover:border-[#246a59]/25 dark:border-slate-700',
    )

  const dayShortLabels = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su']

  const presets = (
    <div className="flex flex-wrap gap-1">
      {(Object.keys(EXAM_DAY_PRESETS) as Exclude<ExamDayPresetId, 'custom'>[]).map(
        (id) => (
          <button
            key={id}
            type="button"
            onClick={() => applyPreset(id)}
            className={presetButtonClass(id)}
          >
            <span>{EXAM_DAY_PRESETS[id].label}</span>
            {!compact && !inline ? (
              <span
                className={cn(
                  'mt-0.5 block text-[10px]',
                  preset === id
                    ? 'text-white/70 dark:text-slate-600'
                    : 'text-slate-500',
                )}
              >
                {EXAM_DAY_PRESETS[id].description}
              </span>
            ) : null}
          </button>
        ),
      )}
    </div>
  )

  const dayToggles = (
    <div className={cn('flex gap-0.5', inline ? 'flex-nowrap' : 'flex-wrap')}>
      {EXAM_WEEKDAY_OPTIONS.map(({ value: day, label, full }) => {
        const active = normalized.includes(day)
        return (
          <button
            key={day}
            type="button"
            title={full}
            onClick={() => toggleDay(day)}
            className={dayButtonClass(active)}
          >
            {inline ? (
              <>
                <span className="sm:hidden">{dayShortLabels[day - 1]}</span>
                <span className="hidden sm:inline">{label}</span>
              </>
            ) : (
              label
            )}
          </button>
        )
      })}
    </div>
  )

  if (inline) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Quick select
          </span>
          {presets}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Exam days
          </span>
          {dayToggles}
          {preset === 'custom' ? (
            <span className="text-[10px] text-slate-400">Custom mix</span>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Quick select
        </p>
        <p className="mb-1.5 text-[11px] text-slate-500">
          Shortcuts update the day pills below. You can still toggle individual days.
        </p>
        {presets}
      </div>
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Exam days
        </p>
        {dayToggles}
        {preset === 'custom' ? (
          <p className="mt-1.5 text-[11px] text-slate-500">Custom day mix selected</p>
        ) : null}
      </div>
    </div>
  )
}
