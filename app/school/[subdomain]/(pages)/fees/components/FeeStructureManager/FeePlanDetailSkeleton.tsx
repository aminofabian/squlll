"use client";

import { cn } from "@/lib/utils";
import { FEES_DETAIL } from "../../lib/fees-ui";

export function FeePlanDetailSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto w-full animate-pulse space-y-3",
        FEES_DETAIL.planPageWidth,
        className,
      )}
    >
      <div className="h-16 rounded-none border border-[#1a4d42]/10 bg-[#e8f2ef]/80" />
      <div className="h-10 rounded-none border border-[#1a4d42]/10 bg-[#f3f7f5]" />
      <div className="h-40 rounded-none border border-[#1a4d42]/10 bg-[#f8fbfa]" />
      <div className="h-72 rounded-none border border-[#1a4d42]/10 bg-[#f8fbfa]" />
    </div>
  );
}
