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

export function ClassesPageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-3 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <Pulse className="h-4 w-28" />
        <Pulse className="h-7 w-16" />
      </div>
      <Pulse className="h-3 w-56" />
      <div className="rounded-lg border border-slate-200/80 p-2.5 dark:border-slate-800">
        <Pulse className="mb-2 h-8 w-full rounded-lg" />
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, index) => (
            <Pulse key={index} className="h-11 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
