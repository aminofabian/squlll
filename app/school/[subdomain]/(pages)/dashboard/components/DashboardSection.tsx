"use client";

import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function DashboardSection({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: DashboardSectionProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800 sm:px-3.5">
        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 hidden text-[11px] text-slate-400 sm:block">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn("p-2.5 sm:p-3", bodyClassName)}>{children}</div>
    </section>
  );
}
