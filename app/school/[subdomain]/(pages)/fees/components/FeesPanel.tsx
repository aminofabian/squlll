"use client";

import { cn } from "@/lib/utils";
import { FEES_LAYOUT, FEES_MOBILE } from "../lib/fees-ui";

interface FeesPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
  dense?: boolean;
}

export function FeesPanel({
  children,
  className,
  title,
  description,
  action,
  noPadding,
  dense,
}: FeesPanelProps) {
  const hasHeader = title || description || action;

  return (
    <section
      className={cn(
        "min-w-0 overflow-x-hidden rounded-xl border border-slate-200/70 bg-white/95 shadow-sm",
        FEES_MOBILE.card,
        className,
      )}
    >
      {hasHeader && (
        <div
          className={cn(
            FEES_LAYOUT.panelHeader,
            "border-b border-slate-100 max-md:mb-2 max-md:rounded-2xl max-md:border-0 max-md:bg-white max-md:shadow-[0_2px_14px_rgba(15,23,42,0.07)] md:mb-0",
            dense ? "px-3 py-3 sm:px-4" : "px-4 py-3 sm:px-5 sm:py-4",
          )}
        >
          <div className="min-w-0 flex-1">
            {title && (
              <h2
                className={cn(
                  "font-semibold tracking-tight text-slate-900",
                  dense ? "text-sm" : "text-base",
                )}
              >
                {title}
              </h2>
            )}
            {description && (
              <p className={cn("text-xs text-slate-500", FEES_LAYOUT.textWrap)}>
                {description}
              </p>
            )}
          </div>
          {action ? (
            <div className={cn(FEES_LAYOUT.panelActions, "[&_button]:w-full sm:[&_button]:w-auto")}>
              {action}
            </div>
          ) : null}
        </div>
      )}
      <div
        className={cn(
          "min-w-0 max-w-full overflow-x-hidden",
          !noPadding && (dense ? "p-4 sm:p-5" : "p-5 sm:p-6"),
        )}
      >
        {children}
      </div>
    </section>
  );
}
