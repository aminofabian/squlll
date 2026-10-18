import type { LucideIcon } from 'lucide-react'

export function FactTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-muted/50 px-3 py-2.5 ring-1 ring-inset ring-border/50">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
