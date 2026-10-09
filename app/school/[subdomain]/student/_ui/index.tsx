"use client"

import type { ReactNode } from "react"
import { ArrowLeft, RefreshCw, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Shared building blocks for the student portal. Every page composes these so
 * spacing, type, colour and states stay identical across the whole portal.
 */

/** Page container — consistent width, padding and vertical rhythm. */
export function StudentPage({
  children,
  className,
  wide = false,
}: {
  children: ReactNode
  className?: string
  wide?: boolean
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/[0.04] via-background to-background">
      <div
        className={cn(
          "mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
          wide ? "max-w-6xl" : "max-w-4xl",
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}

/** Page title block with optional back control and trailing actions. */
export function PageHeader({
  title,
  subtitle,
  onBack,
  backLabel = "Back",
  actions,
}: {
  title: string
  subtitle?: ReactNode
  onBack?: () => void
  backLabel?: string
  actions?: ReactNode
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        {onBack ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            aria-label={backLabel}
            className="-ml-2 mt-0.5 gap-1.5 px-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : null}
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle ? (
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  )
}

/** Card with a titled header (icon chip + title + optional actions) and body. */
export function Section({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  bodyClassName,
  padded = true,
}: {
  title?: string
  description?: string
  icon?: LucideIcon
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  padded?: boolean
}) {
  return (
    <Card className={cn("gap-0 overflow-hidden py-0", className)}>
      {title || actions ? (
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {Icon ? (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-[18px] w-[18px]" />
              </span>
            ) : null}
            <div className="min-w-0 space-y-0.5">
              {title ? (
                <h2 className="truncate text-sm font-semibold text-foreground">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="text-xs text-muted-foreground">{description}</p>
              ) : null}
            </div>
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
      <div className={cn(padded && "p-5", bodyClassName)}>{children}</div>
    </Card>
  )
}

/** Metric tile for stat grids. */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: ReactNode
  hint?: string
  icon?: LucideIcon
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

const PILL_TONES = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
  danger: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200",
  accent: "bg-primary/10 text-primary",
} as const

export type PillTone = keyof typeof PILL_TONES

/** Small status pill. */
export function StatusPill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: PillTone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        PILL_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Empty state — icon chip, headline, optional supporting copy and action. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </span>
      ) : null}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

/** Loading / error state with a consistent spinner and retry affordance. */
export function StateMessage({
  variant = "loading",
  title,
  description,
  onRetry,
  className,
}: {
  variant?: "loading" | "error"
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full",
          variant === "error"
            ? "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300"
            : "bg-primary/10 text-primary",
        )}
      >
        <RefreshCw
          className={cn("h-6 w-6", variant === "loading" && "animate-spin")}
        />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {title ??
            (variant === "error" ? "Something went wrong" : "Loading…")}
        </p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {variant === "error" && onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}
