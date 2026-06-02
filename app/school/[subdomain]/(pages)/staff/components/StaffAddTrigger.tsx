"use client";

import { forwardRef } from "react";
import { ArrowRight, Loader2, Sparkles, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export type StaffAddTriggerVariant = "header" | "hero" | "toolbar" | "inline";

interface StaffAddTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: StaffAddTriggerVariant;
  loading?: boolean;
  loadingLabel?: string;
}

const variantStyles: Record<StaffAddTriggerVariant, string> = {
  header: cn(
    "group relative h-9 gap-2 overflow-hidden rounded-full px-3.5 text-xs font-medium text-white",
    "bg-primary shadow-sm shadow-primary/20 ring-1 ring-inset ring-white/15",
    "transition-all duration-200 hover:bg-primary-dark hover:text-white hover:shadow-md hover:shadow-primary/25",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
  ),
  hero: cn(
    "group relative h-11 gap-2.5 overflow-hidden rounded-full px-6 text-sm font-medium text-white",
    "bg-primary shadow-lg shadow-primary/30 ring-1 ring-inset ring-white/20",
    "transition-all duration-200 hover:bg-primary-light hover:text-white hover:shadow-xl hover:shadow-primary/35",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
  ),
  toolbar: cn(
    "group h-8 gap-1.5 rounded-full px-3 text-xs font-medium text-white",
    "bg-primary ring-1 ring-inset ring-white/10",
    "transition-colors hover:bg-primary-dark hover:text-white",
    "disabled:pointer-events-none disabled:opacity-60",
  ),
  inline: cn(
    "group inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white",
    "bg-primary ring-1 ring-inset ring-white/10",
    "transition-colors hover:bg-primary-dark hover:text-white",
    "disabled:pointer-events-none disabled:opacity-60",
  ),
};

export const StaffAddTrigger = forwardRef<HTMLButtonElement, StaffAddTriggerProps>(
  function StaffAddTrigger(
    {
      variant = "header",
      loading = false,
      loadingLabel = "Loading…",
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) {
    const isPrimary = variant === "header" || variant === "hero";
    const label =
      children ?? (variant === "hero" ? "Add first staff member" : "Add staff");

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center",
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {isPrimary ? (
          <span
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          >
            <span className="absolute -left-4 top-0 h-full w-1/3 skew-x-12 bg-white/10 blur-sm" />
          </span>
        ) : null}

        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
            {loadingLabel}
          </>
        ) : (
          <>
            {variant === "toolbar" ? (
              <Sparkles className="h-3 w-3 shrink-0 text-white/80" />
            ) : (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                <UserPlus className="h-3 w-3 text-white" />
              </span>
            )}
            <span className="relative truncate">{label}</span>
            {isPrimary || variant === "inline" ? (
              <ArrowRight className="h-3 w-3 shrink-0 text-white/70 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
            ) : null}
          </>
        )}
      </button>
    );
  },
);
