"use client";

import { cn } from "@/lib/utils";

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-100 dark:bg-slate-800",
        className,
      )}
    />
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-3 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <Pulse className="h-4 w-24" />
        <Pulse className="h-7 w-16" />
      </div>
      <Pulse className="h-16 w-full rounded-lg" />
      <div className="rounded-lg border border-slate-200/80 p-2.5 dark:border-slate-800">
        <Pulse className="mb-2 h-3 w-20" />
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 3 }).map((_, index) => (
            <Pulse key={index} className="h-[3.25rem]" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <Pulse key={index} className="h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
