"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FEES_LAYOUT, FEES_MOBILE } from "../lib/fees-ui";

/** Placeholder for Collections overview while fees data is still loading. */
export function FeesOverviewSkeleton() {
  return (
    <section className={cn(FEES_LAYOUT.page, "space-y-2")}>
      <div
        className={cn(
          FEES_MOBILE.card,
          "flex items-center gap-2 px-3 py-2.5",
        )}
      >
        <Skeleton className="h-4 w-4 shrink-0 rounded" />
        <Skeleton className="h-3 w-48" />
      </div>

      <div className={cn(FEES_MOBILE.card, "overflow-hidden")}>
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-40" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="mt-3 h-2 w-full rounded-full" />
          <Skeleton className="mt-2 h-3 w-56" />
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-3 py-3 text-center">
              <Skeleton className="mx-auto h-2 w-12" />
              <Skeleton className="mx-auto mt-2 h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      <div className={cn(FEES_MOBILE.card, "p-2.5")}>
        <Skeleton className="mb-2 h-3 w-24" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                "h-[4.25rem] rounded-xl",
                i === 0 && "sm:min-h-[4.5rem]",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
