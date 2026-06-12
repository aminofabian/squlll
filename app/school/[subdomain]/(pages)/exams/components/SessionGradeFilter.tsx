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
        'overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-r from-white via-slate-50/40 to-white dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-2">
        <span className="mr-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <GraduationCap className="h-3 w-3 text-[#246a59]" />
          Class
        </span>
        <button
          type="button"
          onClick={() => onChange('all')}
          className={cn(
            'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all',
            value === 'all'
              ? 'bg-gradient-to-br from-[#2f8f7a] via-[#246a59] to-[#1a4c40] text-white shadow-sm shadow-[#246a59]/25'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
          )}
        >
          All
        </button>
        {grades.map((grade) => (
          <button
            key={grade.id}
            type="button"
            onClick={() => onChange(grade.id)}
            className={cn(
              'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all',
              value === grade.id
                ? 'bg-gradient-to-br from-[#2f8f7a] via-[#246a59] to-[#1a4c40] text-white shadow-sm shadow-[#246a59]/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
            )}
          >
            {formatGradeDisplayName(grade.name)}
          </button>
        ))}
      </div>
    </div>
  )
}
