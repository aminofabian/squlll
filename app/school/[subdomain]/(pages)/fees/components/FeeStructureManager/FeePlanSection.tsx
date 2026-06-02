"use client";

import { cn } from "@/lib/utils";
import { FEES_BRAND, FEES_DETAIL, FEES_LAYOUT, FEES_MOBILE } from "../../lib/fees-ui";

interface FeePlanSectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
  lead?: boolean;
  step?: number;
  compact?: boolean;
  hideStep?: boolean;
}

export function FeePlanSection({
  title,
  description,
  action,
  children,
  className,
  id,
  lead = false,
  step,
  compact = false,
  hideStep = false,
}: FeePlanSectionProps) {
  const dense = compact;

  return (
    <section
      id={id}
      className={cn(
        FEES_LAYOUT.planScrollMt,
        FEES_MOBILE.planSection,
        !lead && "border-t border-slate-100/90 max-md:border-0",
        className,
      )}
    >
      <div
        className={cn(
          dense ? "px-4 py-3.5 sm:px-4" : "px-5 py-4 sm:px-6 sm:py-5",
        )}
      >
        <div
          className={cn(
            FEES_LAYOUT.panelHeader,
            FEES_MOBILE.planSectionHeader,
            !dense && "mb-3",
            dense && "mb-2.5 max-md:mb-3",
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            {step != null && !hideStep ? (
              <span
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white max-md:h-7 max-md:w-7 max-md:text-[11px]",
                  dense ? "h-5 w-5" : "h-6 w-6",
                )}
                style={{ backgroundColor: FEES_BRAND.primary }}
              >
                {step}
              </span>
            ) : null}
            <div className="min-w-0">
              <h2
                className={cn(
                  "font-semibold text-slate-900",
                  FEES_MOBILE.planSectionTitle,
                  dense ? "text-sm" : "text-[0.9375rem]",
                )}
              >
                {title}
              </h2>
              {description ? (
                <p className="mt-0.5 text-xs text-slate-500">{description}</p>
              ) : null}
            </div>
          </div>
          {action ? (
            <div className="max-md:shrink-0 max-md:[&_button]:h-9 max-md:[&_button]:w-auto max-md:[&_button]:rounded-xl sm:[&_button]:w-auto [&_button]:w-full">
              {action}
            </div>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export function FeePlanDocument({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <article
      id={id}
      className={cn(
        "min-w-0 max-w-full overflow-x-hidden bg-white",
        FEES_DETAIL.cardRadius,
        FEES_DETAIL.shadowSoft,
        "ring-1 ring-slate-200/60",
        FEES_MOBILE.planDoc,
        className,
      )}
    >
      {children}
    </article>
  );
}
