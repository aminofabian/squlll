import type { LucideIcon } from 'lucide-react'

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  progress,
  attention,
}: {
  label: string
  value: string | number
  hint: string
  icon: LucideIcon
  progress?: number
  attention?: boolean
}) {
  return (
    <div className="bg-card px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
        {attention && <span className="size-1.5 rounded-full bg-amber-500" aria-label="Needs attention" />}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      {progress === undefined ? (
        <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
      ) : (
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground">{hint}</span>
        </div>
      )}
    </div>
  )
}
