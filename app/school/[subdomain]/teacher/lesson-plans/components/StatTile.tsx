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
    <div className="bg-card px-5 py-5 sm:px-6">
      <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
        <Icon className="size-3.5" strokeWidth={1.7} />
        {label}
        {attention && (
          <span className="ml-0.5 size-1.5 rounded-full bg-amber-500" aria-label="Needs attention" />
        )}
      </p>
      <p className="tp-num mt-2 text-[1.55rem] font-semibold leading-none tracking-[-0.02em] text-foreground">
        {value}
      </p>
      {progress === undefined ? (
        <p className="mt-1.5 truncate text-[11.5px] text-muted-foreground/85">{hint}</p>
      ) : (
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground">{hint}</span>
        </div>
      )}
    </div>
  )
}
