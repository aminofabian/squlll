import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div className="flex items-center justify-between gap-2">
      <div role="tablist" className="inline-flex gap-1 overflow-x-auto rounded-2xl bg-muted/70 p-1 [scrollbar-width:none]">
        {PLANNER_TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={tab === value}
            onClick={() => onChange(value)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all',
              tab === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className={cn('size-4', tab === value && 'text-primary')} />
            {label}
          </button>
        ))}
      </div>
      <Button size="sm" variant="outline" className="shrink-0 rounded-xl" onClick={onNewScheme}>
        <Plus className="size-4" />
        <span className="hidden sm:inline">New scheme</span>
      </Button>
    </div>
  )
}
