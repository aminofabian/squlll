"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StudentWelcomeSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-2 dark:border-slate-700 dark:bg-slate-900",
        className,
      )}
    >
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    </div>
  );
}

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
        "flex flex-col items-center justify-center rounded-lg border border-slate-200/80 bg-white px-1 py-2 dark:border-slate-700 dark:bg-slate-900",
        wide && "col-span-3 flex-row items-center gap-2 px-2.5 py-2",
        className,
      )}
    >
      <Skeleton className={cn("shrink-0 rounded-full", wide ? "h-4 w-4" : "mb-0.5 h-3.5 w-3.5")} />
      <div className={cn("space-y-1", wide ? "min-w-0 flex-1" : "w-full px-1")}>
        <Skeleton className={cn(wide ? "h-3.5 w-3/4" : "mx-auto h-4 w-8")} />
        <Skeleton className={cn(wide ? "h-2.5 w-1/2" : "mx-auto h-2 w-10")} />
      </div>
    </div>
  );
}

export function StudentStatsGridSkeleton({ mobile = true }: { mobile?: boolean }) {
  if (!mobile) {
    return (
      <div className="mx-auto mb-8 grid w-full max-w-5xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center rounded-lg border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
          >
            <Skeleton className="mb-2 h-5 w-5 rounded-full" />
            <Skeleton className="mb-1 h-3 w-16" />
            <Skeleton className="h-6 w-10" />
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
    <div>
      <Skeleton className="mb-1.5 h-2.5 w-20" />
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center rounded-lg border border-slate-200/80 bg-white px-1 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <Skeleton className="mb-1 h-8 w-8 rounded-md" />
            <Skeleton className="h-2 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudentDashboardMobileSkeleton() {
  return (
    <div className="space-y-2 lg:hidden">
      <StudentWelcomeSkeleton />
      <Skeleton className="h-14 w-full rounded-lg" />
      <StudentStatsGridSkeleton mobile />
      <StudentQuickActionsSkeleton />
    </div>
  );
}

export function StudentProfileBannerSkeleton() {
  return (
    <div className="mb-6 flex justify-center">
      <div className="w-full max-w-3xl rounded-lg border border-slate-200/80 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
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
