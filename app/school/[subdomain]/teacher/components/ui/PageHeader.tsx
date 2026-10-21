import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { tp } from "../../styles/portal";

/**
 * The one header every teacher page uses: eyebrow, serif title, short lede,
 * actions on the right. Keeps hierarchy identical page to page.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "tp-reveal flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <p className={tp.eyebrow}>{eyebrow}</p> : null}
        <h1 className={tp.title}>{title}</h1>
        {description ? <p className={tp.lede}>{description}</p> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

/**
 * Small heading above a group of cards. Used when a page has more than one
 * band of content so the eye can separate them.
 */
export function SectionHeading({
  children,
  hint,
  className,
}: {
  children: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", className)}>
      <h2 className={tp.sectionTitle}>{children}</h2>
      {hint ? <span className={tp.meta}>{hint}</span> : null}
    </div>
  );
}
