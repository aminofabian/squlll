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
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative mx-auto flex size-16 items-center justify-center rounded-full bg-primary/5 ring-8 ring-primary/[0.03]">
        <span className="flex size-11 items-center justify-center rounded-full bg-card text-primary shadow-sm ring-1 ring-border">
          <Icon className="size-5" />
        </span>
      </div>
      <h3 className="relative mt-4 text-sm font-semibold">{title}</h3>
      <p className="relative mx-auto mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      {action && <div className="relative mt-4">{action}</div>}
    </div>
  )
}
