"use client";

import { cn } from "@/lib/utils";

/** Locale-formatted number only (no currency prefix). */
export function formatKesNumber(amount: number): string {
  return amount.toLocaleString("en-KE");
}

type KesAmountProps = {
  amount: number;
  className?: string;
  /** Tight copy under badges; default for table cells */
  size?: "xs" | "sm";
};

/**
 * KES amounts with tabular numerals — avoids ambiguous "1" vs "I" in small text.
 */
export function KesAmount({ amount, className, size = "xs" }: KesAmountProps) {
  const text =
    size === "sm" ? "text-sm" : "text-[10px] leading-snug";

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-sans tabular-nums lining-nums",
        className,
      )}
    >
      <span className={cn(text, "font-normal tracking-wide text-slate-500")}>
        KES
      </span>
      <span className={cn(text, "font-medium text-slate-700")}>
        {formatKesNumber(amount)}
      </span>
    </span>
  );
}
