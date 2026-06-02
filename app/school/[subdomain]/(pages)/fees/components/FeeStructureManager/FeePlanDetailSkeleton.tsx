"use client";

import { cn } from "@/lib/utils";
import { FEES_DETAIL } from "../../lib/fees-ui";

export function FeePlanDetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto w-full animate-pulse space-y-6", FEES_DETAIL.maxWidth, className)}>
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className={cn("h-40 rounded-[1.35rem] bg-slate-200/80", FEES_DETAIL.cardRadius)} />
      <div className={cn("h-28 rounded-[1.35rem] bg-slate-200/70", FEES_DETAIL.cardRadius)} />
      <div className={cn("h-96 rounded-[1.35rem] bg-slate-200/60", FEES_DETAIL.cardRadius)} />
    </div>
  );
}
