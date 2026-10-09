"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Compact greeting row used at the top of the mobile home. */
export function StudentWelcomeSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm",
        className,
      )}
    >
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    </div>
  );
}

/** Small metric tile placeholder, matching the mobile stat grid cells. */
export function StatCellSkeleton({
  wide = false,
  className,
}: {
  wide?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-2 py-3",
        wide && "col-span-3 flex-row items-center gap-3 px-3 py-3",
        className,
      )}
    >
      <Skeleton className={cn("shrink-0 rounded-full", wide ? "h-4 w-4" : "h-3.5 w-3.5")} />
      <div className={cn("flex flex-col gap-1", wide ? "min-w-0 flex-1" : "w-full items-center px-1")}>
        <Skeleton className={cn(wide ? "h-3.5 w-3/4" : "h-4 w-8")} />
        <Skeleton className={cn(wide ? "h-2.5 w-1/2" : "h-2 w-10")} />
      </div>
    </div>
  );
}

export function StudentStatsGridSkeleton({ mobile = true }: { mobile?: boolean }) {
  if (!mobile) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-3 h-6 w-10" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      <StatCellSkeleton wide />
      {Array.from({ length: 5 }).map((_, i) => (
        <StatCellSkeleton key={i} />
      ))}
    </div>
  );
}

export function StudentQuickActionsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl lg:h-14" />
      ))}
    </div>
  );
}

export function StudentDashboardMobileSkeleton() {
  return (
    <div className="space-y-3 lg:hidden">
      <StudentWelcomeSkeleton />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <StudentStatsGridSkeleton mobile />
      <StudentQuickActionsSkeleton />
    </div>
  );
}

export function StudentProfileBannerSkeleton() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl rounded-xl border border-border bg-card px-6 py-4 shadow-sm">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex gap-5">
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-10 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
