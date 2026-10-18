import React from 'react'
import type { LucideIcon } from 'lucide-react'

export function PlannerEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
      <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <h3 className="mt-3 text-sm font-medium">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
