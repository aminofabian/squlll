"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FEES_LAYOUT } from "../../lib/fees-ui";

/** Matches fee structures list (summary + toolbar + year card) while loading. */
export function FeePlansListSkeleton() {
  return (
    <div className={cn(FEES_LAYOUT.page, "min-w-0 space-y-3 overflow-x-hidden")}>
      <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-3 py-3 sm:px-4">
        <div className="flex justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="mt-2 h-8 w-36 sm:h-9" />
            <Skeleton className="mt-2 h-3 w-full max-w-md" />
          </div>
          <Skeleton className="h-8 w-24 shrink-0 rounded-lg" />
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:max-w-2xl">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200/80 bg-white px-2 py-1.5"
            >
              <Skeleton className="mx-auto h-2 w-12" />
              <Skeleton className="mx-auto mt-1.5 h-3.5 w-8" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-sm">
        <Skeleton className="h-9 w-full max-w-xs" />
        <div className="mt-2 flex flex-wrap gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-200/80 px-4 py-3 sm:px-5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-2 h-3 w-40" />
          <Skeleton className="mt-3 h-6 w-32 rounded-lg" />
        </div>
        <div className="hidden space-y-0 md:block">
          <div className="flex gap-4 border-b border-slate-100 bg-slate-50/60 px-4 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-16" />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, row) => (
            <div
              key={row}
              className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0"
            >
              <Skeleton className="h-4 w-[38%]" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-[28%]" />
            </div>
          ))}
        </div>
        <div className="space-y-2 p-3 md:hidden">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
