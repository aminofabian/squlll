"use client";

import { forwardRef } from "react";
import { Loader2, UserPlus } from "lucide-react";
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
    "group relative h-9 gap-2 overflow-hidden rounded-none px-3.5 text-xs font-medium text-white",
    "bg-[#0a1f1a]",
    "transition-colors duration-200 hover:bg-[#246a59] hover:text-white",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
  ),
  hero: cn(
    "group relative h-11 gap-2.5 overflow-hidden rounded-none px-6 text-sm font-medium text-white",
    "bg-[#0a1f1a]",
    "transition-colors duration-200 hover:bg-[#246a59] hover:text-white",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
  ),
  toolbar: cn(
    "group h-8 gap-1.5 rounded-none px-3 text-xs font-medium text-white",
    "bg-[#0a1f1a]",
    "transition-colors hover:bg-[#246a59] hover:text-white",
    "disabled:pointer-events-none disabled:opacity-60",
  ),
  inline: cn(
    "group inline-flex items-center gap-1 rounded-none px-2.5 py-1 text-xs font-medium text-white",
    "bg-[#0a1f1a]",
    "transition-colors hover:bg-[#246a59] hover:text-white",
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
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
            {loadingLabel}
          </>
        ) : (
          <>
            <UserPlus className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </>
        )}
      </button>
    );
  },
);
