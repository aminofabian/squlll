"use client";

import type { ReactNode } from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared layout tokens for the fees setup wizard */
export const WIZARD = {
  body: "space-y-3",
  intro: "text-xs leading-snug text-slate-600 sm:text-sm",
  panel: "overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-sm",
  summaryBand:
    "flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b px-3 py-2 text-xs",
  summaryBg: { backgroundColor: "#f0f9f4" } as const,
  section: "px-3 py-2.5",
  sectionBorder: "border-b border-slate-100",
  sectionLabel:
    "mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400",
  toolbar:
    "flex gap-2 border-t border-slate-100 bg-slate-50/70 px-3 py-2.5",
  tableHeader:
    "border-b border-slate-100 bg-slate-50/80 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500",
  chip: "inline-flex items-center gap-1 rounded border border-slate-200/80 bg-white px-1.5 py-0.5 font-medium text-slate-800",
} as const;

export type WizardChip = {
  key: string;
  label: string;
  meta?: string;
  required?: boolean;
  dotClassName?: string;
  onRemove?: () => void;
};

export function WizardStepIntro({ children }: { children: ReactNode }) {
  return <p className={WIZARD.intro}>{children}</p>;
}

export function WizardPanel({
  summary,
  children,
  footer,
  error,
  className,
}: {
  summary?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  error?: string | null;
  className?: string;
}) {
  return (
    <div className={cn(WIZARD.panel, className)}>
      {summary}
      {children}
      {error ? (
        <p className="border-t border-rose-100 bg-rose-50/50 px-3 py-1.5 text-[11px] text-rose-600">
          {error}
        </p>
      ) : null}
      {footer}
    </div>
  );
}

export function WizardSummaryBand({
  label,
  count,
  chips,
  action,
  emptyText,
}: {
  label: string;
  count?: number;
  chips: WizardChip[];
  action?: ReactNode;
  emptyText?: string;
}) {
  return (
    <div className={WIZARD.summaryBand} style={WIZARD.summaryBg}>
      <span className="shrink-0 font-medium text-slate-600">
        {label}
        {count != null ? ` (${count})` : ""}
      </span>
      <span className="hidden h-3 w-px bg-slate-300/80 sm:inline-block" />
      <div className="flex min-w-0 flex-1 flex-wrap gap-1">
        {chips.length === 0 && emptyText ? (
          <span className="text-amber-800">{emptyText}</span>
        ) : (
          chips.map((chip) => (
            <span key={chip.key} className={WIZARD.chip}>
              {chip.dotClassName ? (
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    chip.dotClassName,
                  )}
                />
              ) : null}
              {chip.label}
              {chip.meta ? (
                <span className="tabular-nums text-slate-500">{chip.meta}</span>
              ) : null}
              {chip.required ? (
                <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                  Req
                </span>
              ) : chip.onRemove ? (
                <button
                  type="button"
                  aria-label={`Remove ${chip.label}`}
                  onClick={chip.onRemove}
                  className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              ) : null}
            </span>
          ))
        )}
      </div>
      {action}
    </div>
  );
}

export function WizardSection({
  label,
  children,
  bordered = true,
  scrollable,
  className,
}: {
  label?: string;
  children: ReactNode;
  bordered?: boolean;
  scrollable?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        WIZARD.section,
        bordered && WIZARD.sectionBorder,
        scrollable,
        className,
      )}
    >
      {label ? <p className={WIZARD.sectionLabel}>{label}</p> : null}
      {children}
    </section>
  );
}

export function WizardToolbar({ children }: { children: ReactNode }) {
  return <div className={WIZARD.toolbar}>{children}</div>;
}

export function WizardLoading({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      {message}
    </div>
  );
}

export function WizardAlert({
  title,
  children,
  variant = "amber",
}: {
  title: string;
  children: ReactNode;
  variant?: "amber" | "rose";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-4 text-xs",
        variant === "amber"
          ? "border-amber-200/90 bg-amber-50/80 text-amber-900"
          : "border-rose-200/90 bg-rose-50/80 text-rose-900",
      )}
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 opacity-90">{children}</p>
    </div>
  );
}

export function WizardReviewRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2 text-xs">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}
