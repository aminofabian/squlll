"use client"

import type { ReactNode } from "react"
import { ArrowLeft, Loader2, RefreshCw, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { tp } from "@/lib/portal-tokens"

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
    <div
      className={cn(
        "mx-auto w-full px-5 pb-24 pt-6 sm:px-8 sm:pt-9 lg:px-0 lg:pb-14 lg:pt-0",
        wide ? "max-w-[1180px]" : "max-w-4xl",
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Page title block with optional back control and trailing actions. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  onBack,
  backLabel = "Back",
  actions,
}: {
  eyebrow?: string
  title: string
  subtitle?: ReactNode
  onBack?: () => void
  backLabel?: string
  actions?: ReactNode
}) {
  return (
    <header className="tp-reveal mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div className="min-w-0 max-w-2xl">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className={cn(tp.backLink, "mb-3")}
            aria-label={backLabel}
          >
            <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            {backLabel}
          </button>
        ) : null}
        {eyebrow ? <p className={tp.eyebrow}>{eyebrow}</p> : null}
        <h1 className={onBack ? tp.titleSm : tp.title}>{title}</h1>
        {subtitle ? (
          <div className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground text-pretty">
            {subtitle}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
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
    <section className={cn(tp.card, "tp-reveal overflow-hidden", className)}>
      {title || actions ? (
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {Icon ? (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/45 text-primary">
                <Icon className="size-[17px]" strokeWidth={1.7} />
              </span>
            ) : null}
            <div className="min-w-0 space-y-0.5">
              {title ? (
                <h2 className="truncate text-[13.5px] font-semibold text-foreground">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
      <div className={cn(padded && "p-5 sm:p-6", bodyClassName)}>{children}</div>
    </section>
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
    <div className={cn(tp.card, "px-5 py-5 sm:px-6")}>
      <div className="flex items-center gap-1.5 text-muted-foreground/80">
        {Icon ? <Icon className="size-3.5" strokeWidth={1.7} /> : null}
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>
      <p className="mt-2 font-display text-[1.9rem] leading-none tracking-[-0.02em] text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-1.5 truncate text-[11.5px] text-muted-foreground/85">{hint}</p>
      ) : null}
    </div>
  )
}

const PILL_TONES = {
  neutral: "bg-muted text-muted-foreground",
  success:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  danger: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  info: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  accent: "bg-primary/[0.08] text-primary",
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
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-semibold",
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
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center sm:py-16",
        className,
      )}
    >
      {Icon ? (
        <span className="flex size-11 items-center justify-center rounded-full border border-border/80 bg-muted/50 text-muted-foreground">
          <Icon className="size-5" strokeWidth={1.6} />
        </span>
      ) : null}
      <div className="space-y-1.5">
        <p className="text-[15px] font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-[13px] leading-relaxed text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
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
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center sm:py-16",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-full",
          variant === "error"
            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
            : "bg-primary/[0.08] text-primary",
        )}
      >
        {variant === "error" ? (
          <RefreshCw className="size-5" strokeWidth={1.7} />
        ) : (
          <Loader2 className="size-5 animate-spin" strokeWidth={1.7} />
        )}
      </span>
      <div className="space-y-1.5">
        <p className="text-[15px] font-semibold text-foreground">
          {title ?? (variant === "error" ? "Something went wrong" : "Loading…")}
        </p>
        {description ? (
          <p className="mx-auto max-w-sm text-[13px] leading-relaxed text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      {variant === "error" && onRetry ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-2 h-9 rounded-full border-border/80 px-4 text-[12.5px] font-semibold"
        >
          Try again
        </Button>
      ) : null}
    </div>
  )
}
