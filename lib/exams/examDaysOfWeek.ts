/** 1 = Monday … 7 = Sunday (Kenyan school convention). */

export const DEFAULT_EXAM_DAYS_OF_WEEK = [1, 2, 3, 4, 5] as const

export const EXAM_WEEKDAY_OPTIONS = [
  { value: 1, label: 'Mon', full: 'Monday' },
  { value: 2, label: 'Tue', full: 'Tuesday' },
  { value: 3, label: 'Wed', full: 'Wednesday' },
  { value: 4, label: 'Thu', full: 'Thursday' },
  { value: 5, label: 'Fri', full: 'Friday' },
  { value: 6, label: 'Sat', full: 'Saturday' },
  { value: 7, label: 'Sun', full: 'Sunday' },
] as const

export type ExamDayPresetId = 'weekdays' | 'mon_sat' | 'all' | 'custom'

export const EXAM_DAY_PRESETS: Record<
  Exclude<ExamDayPresetId, 'custom'>,
  { label: string; description: string; days: number[] }
> = {
  weekdays: {
    label: 'Mon–Fri',
    description: 'Weekdays only — no weekend exams',
    days: [1, 2, 3, 4, 5],
  },
  mon_sat: {
    label: 'Mon–Sat',
    description: 'Include Saturday, skip Sunday',
    days: [1, 2, 3, 4, 5, 6],
  },
  all: {
    label: 'All week',
    description: 'Monday through Sunday',
    days: [1, 2, 3, 4, 5, 6, 7],
  },
}

export function isoDateToExamDay(isoDate: string): number {
  const js = new Date(`${isoDate}T12:00:00`).getDay()
  return js === 0 ? 7 : js
}

export function normalizeExamDaysOfWeek(
  days?: number[] | null,
): number[] {
  if (!days?.length) return [...DEFAULT_EXAM_DAYS_OF_WEEK]
  return [...new Set(days)].filter((d) => d >= 1 && d <= 7).sort((a, b) => a - b)
}

export function detectExamDayPreset(days: number[]): ExamDayPresetId {
  const sorted = [...days].sort((a, b) => a - b).join(',')
  for (const [id, preset] of Object.entries(EXAM_DAY_PRESETS)) {
    if (preset.days.join(',') === sorted) return id as ExamDayPresetId
  }
  return 'custom'
}

export function formatExamDaysLabel(days: number[]): string {
  const normalized = normalizeExamDaysOfWeek(days)
  const preset = detectExamDayPreset(normalized)
  if (preset !== 'custom') return EXAM_DAY_PRESETS[preset].label
  return normalized
    .map((d) => EXAM_WEEKDAY_OPTIONS.find((o) => o.value === d)?.label ?? String(d))
    .join(', ')
}

export function isExamDayAllowed(isoDate: string, examDaysOfWeek: number[]): boolean {
  return normalizeExamDaysOfWeek(examDaysOfWeek).includes(isoDateToExamDay(isoDate))
}
