"use client";

import type { ReactNode } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { tp } from "@/lib/portal-tokens";
import {
  CAMPAIGN_STATUS_META,
  CHANNEL_META,
  MESSAGE_STATUS_META,
} from "@/lib/school/communicationsHubUtils";
import type {
  CommCampaignStatus,
  CommChannel,
  CommStatus,
} from "@/lib/school/communicationsHubApi";

/**
 * Shared communications primitives. Every tab composes these so surfaces, type
 * and states stay one system across the whole workspace.
 */

export function PageSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 max-w-2xl">
          <h2 className="text-[13.5px] font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground text-pretty">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  loading = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "positive" | "warning" | "danger";
  loading?: boolean;
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-700 dark:text-emerald-300"
      : tone === "warning"
        ? "text-amber-700 dark:text-amber-300"
        : tone === "danger"
          ? "text-rose-700 dark:text-rose-300"
          : "text-foreground";

  return (
    <div className={cn(tp.card, "flex items-start justify-between gap-3 px-5 py-5")}>
      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
          {label}
        </p>
        <p
          className={cn(
            "mt-2 font-display text-[1.9rem] leading-none tracking-[-0.02em]",
            toneClass,
          )}
        >
          {loading ? (
            <span className="tp-skeleton inline-block h-7 w-12 rounded-md" />
          ) : (
            value
          )}
        </p>
        {hint ? (
          <p className="mt-1.5 truncate text-[11.5px] text-muted-foreground/85">{hint}</p>
        ) : null}
      </div>
      {Icon ? (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/45 text-primary">
          <Icon className="size-4" strokeWidth={1.7} />
        </span>
      ) : null}
    </div>
  );
}

export function ChannelPill({
  channel,
  className,
}: {
  channel: CommChannel;
  className?: string;
}) {
  const meta = CHANNEL_META[channel];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold",
        meta?.tone,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta?.dot)} />
      {meta?.label ?? channel}
    </span>
  );
}

export function CampaignStatusBadge({
  status,
}: {
  status: CommCampaignStatus;
}) {
  const meta = CAMPAIGN_STATUS_META[status] ?? CAMPAIGN_STATUS_META.DRAFT;
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full border px-2 text-[10.5px] font-semibold", meta.tone)}
    >
      {meta.label}
    </Badge>
  );
}

export function MessageStatusBadge({ status }: { status: CommStatus }) {
  const meta = MESSAGE_STATUS_META[status] ?? MESSAGE_STATUS_META.PENDING;
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full border px-2 text-[10.5px] font-semibold", meta.tone)}
    >
      {meta.label}
    </Badge>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn(tp.card, "flex flex-col items-center justify-center px-6 py-14 text-center")}>
      {Icon ? (
        <span className="mb-4 flex size-11 items-center justify-center rounded-full border border-border/80 bg-muted/50 text-muted-foreground">
          <Icon className="size-5" strokeWidth={1.6} />
        </span>
      ) : null}
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground text-pretty">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingPanel({ label = "Loading…" }: { label?: string }) {
  return (
    <div className={cn(tp.card, "space-y-4 px-5 py-6 sm:px-6")} aria-busy>
      <div className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        {label}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="tp-skeleton size-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="tp-skeleton h-3 w-1/3 rounded-full" />
              <div className="tp-skeleton h-2.5 w-1/5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InlineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200/80 bg-rose-50/70 px-4 py-3 text-[13px] text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
      <span className="text-pretty">{message}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="tp-focus rounded-full font-semibold underline underline-offset-4"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function ProgressBar({
  value,
  total,
  tone = "bg-primary",
}: {
  value: number;
  total: number;
  tone?: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all duration-500", tone)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
