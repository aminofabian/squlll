import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EditorNavItem } from '../types'

export function SectionNavRail({
  items,
  activeId,
  onNavigate,
  planningDone,
  planningTotal,
}: {
  items: EditorNavItem[]
  activeId: string
  onNavigate: (id: string) => void
  planningDone: number
  planningTotal: number
}) {
  const isReady = planningDone === planningTotal

  return (
    <nav aria-label="Lesson plan sections" className="rounded-3xl border border-border/70 bg-card p-3 shadow-sm">
      <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Lesson journey
      </p>
      <ol className="relative space-y-0.5 before:absolute before:bottom-5 before:left-[1.4rem] before:top-5 before:w-px before:bg-border">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                'relative flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors',
                activeId === item.id ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                  item.complete ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border bg-card',
                )}
              >
                {item.complete ? <Check className="size-3.5" /> : item.step}
              </span>
              {item.shortTitle}
            </button>
          </li>
        ))}
      </ol>
      <div className={cn('mt-3 rounded-2xl px-3 py-2.5 text-xs', isReady ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200' : 'bg-muted/60 text-muted-foreground')}>
        {isReady ? (
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="size-3.5" /> Ready to submit
          </span>
        ) : (
          `${planningDone} of ${planningTotal} planning steps done`
        )}
      </div>
    </nav>
  )
}
