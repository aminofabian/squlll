"use client";

import { cn } from "@/lib/utils";
import {
  AGING_BADGE_STYLES,
  getAgingBadgeLabel,
  getWorstAgingCategory,
  type AgingBucket,
  type ArrearsAgingCategory,
} from "../lib/arrearsAging";

interface ArrearsAgingBadgeProps {
  aging?: AgingBucket[];
  hasArrears: boolean;
  compact?: boolean;
  showAmount?: boolean;
  className?: string;
}

export function ArrearsAgingBadge({
  aging,
  hasArrears,
  compact = false,
  showAmount = true,
  className,
}: ArrearsAgingBadgeProps) {
  const category = getWorstAgingCategory(aging, hasArrears);

  if (!category) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  const amount = showAmount
    ? aging?.find((b) => b.category === category)?.amount
    : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        AGING_BADGE_STYLES[category as ArrearsAgingCategory],
        className,
      )}
      title={getAgingBadgeLabel(category, amount, false)}
    >
      {getAgingBadgeLabel(category, amount, compact)}
    </span>
  );
}
