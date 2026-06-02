'use client'

import { Label } from '@/components/ui/label'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sortTermsForLetter } from '../../lib/sortTermsForLetter'
import { useMemo } from 'react'

export { sortTermsForLetter } from '../../lib/sortTermsForLetter'

interface LetterTermSelectorProps {
  terms: Array<{ id: string; name: string }>
  selectedIds: string[]
  onChange: (ids: string[]) => void
  error?: string
  showHelper?: boolean
  variant?: 'default' | 'planner' | 'compact'
}

export function LetterTermSelector({
  terms,
  selectedIds,
  onChange,
  error,
  showHelper = true,
  variant = 'default',
}: LetterTermSelectorProps) {
  const orderedTerms = useMemo(() => sortTermsForLetter(terms), [terms])

  if (orderedTerms.length === 0) return null

  if (orderedTerms.length === 1) {
    return (
      <p className="text-sm text-slate-600">
        Letter includes <strong>{orderedTerms[0].name}</strong>.
      </p>
    )
  }

  const allIds = orderedTerms.map((t) => t.id)
  const allSelected =
    allIds.length > 0 &&
    allIds.every((id) => selectedIds.includes(id)) &&
    selectedIds.length === allIds.length

  const selectAll = () => onChange(allIds)

  const onTermClick = (termId: string) => {
    if (allSelected) {
      onChange([termId])
      return
    }

    const set = new Set(selectedIds)
    if (set.has(termId)) {
      if (set.size <= 1) return
      set.delete(termId)
    } else {
      set.add(termId)
    }
    onChange(allIds.filter((id) => set.has(id)))
  }

  const planner = variant === 'planner'
  const compact = variant === 'compact'

  return (
    <div className={compact ? 'min-w-0' : 'space-y-2'}>
      {!planner && !compact ? (
        <Label className="text-xs font-medium text-slate-500">
          Terms on the letter
        </Label>
      ) : null}
      <div
        className={cn(
          'flex flex-wrap gap-1',
          compact && 'gap-1',
          planner
            ? 'rounded-xl bg-white p-1 ring-1 ring-slate-200/80 shadow-sm'
            : compact
              ? ''
              : 'rounded-xl bg-slate-100/80 p-1.5 ring-1 ring-slate-200/60',
        )}
        role="group"
        aria-label="Terms on the letter"
      >
        <button
          type="button"
          onClick={selectAll}
          aria-pressed={allSelected}
          title="Include every term on the parent letter"
          className={cn(
            'inline-flex items-center gap-1 font-medium transition-colors',
            compact
              ? 'h-7 rounded-md px-2 text-[11px]'
              : 'h-8 rounded-lg px-3 text-sm gap-1.5',
            allSelected
              ? 'bg-primary text-white shadow-sm'
              : compact
                ? 'border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
                : 'bg-white text-slate-700 ring-1 ring-slate-200/80 hover:bg-slate-50',
          )}
        >
          All terms
          {allSelected && !compact ? <Check className="h-3.5 w-3.5" /> : null}
        </button>
        {orderedTerms.map((term) => {
          const isSelected = selectedIds.includes(term.id)
          return (
            <button
              key={term.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onTermClick(term.id)}
              className={cn(
                'inline-flex items-center gap-1 font-medium transition-colors',
                compact
                  ? 'h-7 rounded-md px-2 text-[11px]'
                  : 'h-8 rounded-lg px-3 text-sm gap-1.5',
                isSelected
                  ? 'bg-primary text-white shadow-sm'
                  : compact
                    ? 'border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200/80 hover:bg-slate-50',
              )}
            >
              {term.name}
              {isSelected && !compact ? (
                <Check className="h-3.5 w-3.5" />
              ) : null}
            </button>
          )
        })}
      </div>
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : showHelper ? (
        <p className="text-xs text-slate-500">
          Use <strong>All terms</strong> for the full year, or pick one or more
          terms. Click another term to add or remove it from the letter.
        </p>
      ) : null}
    </div>
  )
}
