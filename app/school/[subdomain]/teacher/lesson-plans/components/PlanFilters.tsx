import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PLAN_FILTERS, type PlanFilter } from '../constants/planFilters'

export function PlanFilters({
  filter,
  counts,
  query,
  onFilterChange,
  onQueryChange,
}: {
  filter: PlanFilter
  counts: Record<PlanFilter, number>
  query: string
  onFilterChange: (filter: PlanFilter) => void
  onQueryChange: (query: string) => void
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-1.5">
        {PLAN_FILTERS.map((option) => {
          const active = filter === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:border-primary/40',
              )}
            >
              {option.label}
              <span className={cn('rounded-full px-1.5 text-[10px] tabular-nums', active ? 'bg-white/20' : 'bg-muted')}>
                {counts[option.value]}
              </span>
            </button>
          )
        })}
      </div>
      <div className="relative sm:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search topic, class or strand" className="rounded-xl pl-9" />
      </div>
    </div>
  )
}
