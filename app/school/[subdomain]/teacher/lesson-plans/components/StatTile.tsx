import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const TONES = {
  primary: { icon: 'bg-primary/10 text-primary', bar: 'bg-primary' },
  emerald: { icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', bar: 'bg-emerald-500' },
  amber: { icon: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300', bar: 'bg-amber-500' },
  sky: { icon: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300', bar: 'bg-sky-500' },
} as const

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  progress,
  attention,
}: {
  label: string
  value: string | number
  hint: string
  icon: LucideIcon
  tone: keyof typeof TONES
  progress?: number
  attention?: boolean
}) {
  return (
    <div className="relative rounded-2xl border border-border/70 bg-card p-4 shadow-md shadow-black/[0.03] transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <span className={cn('relative flex size-8 items-center justify-center rounded-xl', TONES[tone].icon)}>
          <Icon className="size-4" />
          {attention && (
            <span className="absolute -right-0.5 -top-0.5 flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
            </span>
          )}
        </span>
      </div>
      <p className="mt-1 text-3xl font-bold leading-none tabular-nums">{value}</p>
      {progress !== undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className={cn('h-full rounded-full transition-[width] duration-700', TONES[tone].bar)} style={{ width: `${progress}%` }} />
        </div>
      )}
      <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  )
}
