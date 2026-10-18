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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-1">
        {PLAN_FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onFilterChange(option.value)}
            className={cn(
              'rounded-lg px-2.5 py-1 text-xs transition-colors',
              filter === option.value ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {option.label}
            <span className="ml-1 tabular-nums opacity-60">{counts[option.value]}</span>
          </button>
        ))}
      </div>
      <div className="relative sm:w-64">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search topic, class or strand" className="h-8 rounded-lg pl-8 text-sm" />
      </div>
    </div>
  )
}
