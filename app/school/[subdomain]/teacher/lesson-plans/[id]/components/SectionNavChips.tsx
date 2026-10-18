import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EditorNavItem } from '../types'

export function SectionNavChips({
  items,
  activeId,
  onNavigate,
}: {
  items: EditorNavItem[]
  activeId: string
  onNavigate: (id: string) => void
}) {
  return (
    <nav
      aria-label="Lesson plan sections"
      className="app-print-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:hidden"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onNavigate(item.id)}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
            activeId === item.id
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-muted-foreground',
          )}
        >
          {item.complete ? <Check className="size-3" /> : <span className="tabular-nums">{item.step}</span>}
          {item.shortTitle}
        </button>
      ))}
    </nav>
  )
}
