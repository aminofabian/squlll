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
        "overflow-hidden border border-[#1a4d42]/12 bg-white shadow-[3px_3px_0_0_rgba(10,31,26,0.05)]",
        "dark:border-white/10 dark:bg-[#0c1a17]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2 dark:border-white/10 dark:bg-[#071411]">
        <div className="min-w-0">
          <h2 className="font-display text-base tracking-tight text-[#0a1f1a] dark:text-white">
            {title}
          </h2>
          {description ? (
            <p className="mt-0 hidden text-[11px] leading-snug text-[#1a4d42]/55 sm:block dark:text-white/40">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn("p-3", bodyClassName)}>{children}</div>
    </section>
  );
}
