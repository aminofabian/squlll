"use client";

import type { ReactNode } from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared presentational primitives for the secondary school pages
 * (Attendances, Curriculum, School Years, Reports, Analytics, Enrollment).
 *
 * These mirror the styling already used across the school dashboard
 * (see `app/school/[subdomain]/(pages)/grading/page.tsx`) so new pages stay
 * visually consistent without re-declaring the same Tailwind strings.
 */

export const panel =
  "border border-[#1a4d42]/12 bg-white shadow-[3px_3px_0_0_rgba(10,31,26,0.05)] dark:border-white/10 dark:bg-[#0c1a17]";

export const fieldShell =
  "h-10 rounded-none border border-[#1a4d42]/15 bg-white text-sm shadow-none placeholder:text-[#1a4d42]/40 focus-visible:border-[#246a59]/50 focus-visible:ring-1 focus-visible:ring-[#246a59]/25 dark:border-white/15 dark:bg-[#071411] dark:placeholder:text-white/40";

export const selectShell =
  "h-10 rounded-none border border-[#1a4d42]/15 bg-white text-sm shadow-none focus:ring-1 focus:ring-[#246a59]/25 dark:border-white/15 dark:bg-[#071411]";

export const labelClass = "text-xs font-medium text-[#0a1f1a] dark:text-white/80";

export const thClass =
  "py-2 pr-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45";

export const primaryButtonClass =
  "h-9 rounded-none bg-[#0a1f1a] text-xs text-white shadow-none hover:bg-[#246a59]";

export const outlineButtonClass =
  "h-9 rounded-none border-[#1a4d42]/15 bg-white text-xs text-[#0a1f1a] shadow-none hover:border-[#246a59]/40 hover:bg-[#f8fbfa] dark:border-white/15 dark:bg-[#0c1a17] dark:text-white";

interface SchoolPageProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Scrollable page scaffold with the standard school header. */
export function SchoolPage({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: SchoolPageProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f3f7f5] dark:bg-[#071411]">
      <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#1a4d42]/12 pb-4 dark:border-white/10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#246a59]">
              {eyebrow}
            </p>
            <h1 className="font-display text-2xl tracking-tight text-[#0a1f1a] dark:text-white">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-[#1a4d42]/55 dark:text-white/45">
                {subtitle}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap gap-2">{actions}</div>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

interface SchoolPanelProps {
  icon?: LucideIcon;
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Bordered section panel with an optional titled header row. */
export function SchoolPanel({
  icon: Icon,
  title,
  actions,
  children,
  className,
}: SchoolPanelProps) {
  return (
    <section className={cn(panel, className)}>
      {title ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1a4d42]/10 px-4 py-3 dark:border-white/10 sm:px-5">
          <div className="flex items-center gap-2">
            {Icon ? <Icon className="h-4 w-4 text-[#246a59]" /> : null}
            <h2 className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
              {title}
            </h2>
          </div>
          {actions}
        </div>
      ) : null}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function SchoolLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#1a4d42]/55 dark:text-white/45">
      <Loader2 className="h-5 w-5 animate-spin text-[#246a59]" />
      {label}
    </div>
  );
}

interface SchoolEmptyProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export function SchoolEmpty({
  icon: Icon,
  title,
  description,
}: SchoolEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      {Icon ? <Icon className="h-7 w-7 text-[#1a4d42]/30" /> : null}
      <p className="text-sm font-medium text-[#0a1f1a] dark:text-white">
        {title}
      </p>
      {description ? (
        <p className="max-w-md text-sm text-[#1a4d42]/55 dark:text-white/45">
          {description}
        </p>
      ) : null}
    </div>
  );
}

/** Small stat tile used by the Analytics / Enrollment overviews. */
export function SchoolStat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className={cn(panel, "p-4")}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45 dark:text-white/40">
          {label}
        </p>
        {Icon ? <Icon className="h-4 w-4 text-[#246a59]" /> : null}
      </div>
      <p className="mt-2 font-display text-2xl tracking-tight text-[#0a1f1a] dark:text-white">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-xs text-[#1a4d42]/55 dark:text-white/45">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
