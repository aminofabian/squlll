'use client'

import { GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatGradeDisplayName } from '@/lib/utils/grade-display'

interface SessionGradeFilterProps {
  grades: Array<{ id: string; name: string }>
  value: string
  onChange: (gradeId: string) => void
  className?: string
}

export function SessionGradeFilter({
  grades,
  value,
  onChange,
  className,
}: SessionGradeFilterProps) {
  if (grades.length === 0) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <GraduationCap className="h-3.5 w-3.5" />
        Grade
      </span>
      <button
        type="button"
        onClick={() => onChange('all')}
        className={cn(
          'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
          value === 'all'
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
        )}
      >
        All grades
      </button>
      {grades.map((grade) => (
        <button
          key={grade.id}
          type="button"
          onClick={() => onChange(grade.id)}
          className={cn(
            'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
            value === grade.id
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
          )}
        >
          {formatGradeDisplayName(grade.name)}
        </button>
      ))}
    </div>
  )
}
