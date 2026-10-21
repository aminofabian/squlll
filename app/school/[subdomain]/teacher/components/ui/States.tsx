import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { tp } from "../../styles/portal";

/**
 * Empty states say what happened, why, and what to do next — never just
 * "No data". Same composition on every page.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        compact ? "px-5 py-10" : "px-6 py-16 sm:py-20",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-full border border-border/80 bg-muted/60 text-muted-foreground">
        <Icon className="size-5" strokeWidth={1.6} />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground text-pretty">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Skeleton rows that match the dashboard list rhythm. */
export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="tp-skeleton size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="tp-skeleton h-3 w-1/3 rounded-full" />
            <div className="tp-skeleton h-2.5 w-1/5 rounded-full" />
          </div>
          <div className="tp-skeleton h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton card used while a page-level query resolves. */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(tp.card, "space-y-4 p-6", className)}
      aria-hidden
    >
      <div className="tp-skeleton h-3 w-24 rounded-full" />
      <div className="tp-skeleton h-7 w-2/3 rounded-lg" />
      <div className="tp-skeleton h-3 w-full rounded-full" />
      <div className="tp-skeleton h-3 w-4/5 rounded-full" />
    </div>
  );
}
