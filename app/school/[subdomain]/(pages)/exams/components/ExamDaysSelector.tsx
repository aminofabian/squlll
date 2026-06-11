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
}

export function ExamDaysSelector({
  value,
  onChange,
  compact = false,
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

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(EXAM_DAY_PRESETS) as Exclude<ExamDayPresetId, 'custom'>[]).map(
          (id) => (
            <button
              key={id}
              type="button"
              onClick={() => applyPreset(id)}
              className={cn(
                'rounded-lg border px-2.5 py-1.5 text-left transition-colors',
                compact ? 'text-[11px]' : 'text-xs',
                preset === id
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900',
              )}
            >
              <span className="font-semibold">{EXAM_DAY_PRESETS[id].label}</span>
              {!compact ? (
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

      <div className="flex flex-wrap gap-1">
        {EXAM_WEEKDAY_OPTIONS.map(({ value: day, label }) => {
          const active = normalized.includes(day)
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={cn(
                'min-w-[2.5rem] rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-200 text-slate-400 hover:border-slate-300 dark:border-slate-700',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
