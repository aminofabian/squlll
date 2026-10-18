import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLANNER_TABS, type PlannerTab } from '../constants/plannerTabs'

export function PlannerTabs({
  tab,
  onChange,
  onNewScheme,
}: {
  tab: PlannerTab
  onChange: (tab: PlannerTab) => void
  onNewScheme: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border">
      <div role="tablist" className="-mb-px flex gap-4 overflow-x-auto [scrollbar-width:none]">
        {PLANNER_TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={tab === value}
            onClick={() => onChange(value)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 border-b-2 py-2 text-sm transition-colors',
              tab === value ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>
      <button type="button" onClick={onNewScheme} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10">
        <Plus className="size-3.5" /> New scheme
      </button>
    </div>
  )
}
