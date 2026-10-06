"use client";

import { cn } from "@/lib/utils";

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-none bg-[#e8f2ef] dark:bg-slate-800",
        className,
      )}
    />
  );
}

export function ClassesPageSkeleton() {
  return (
    <div className="min-h-full bg-[#f3f7f5] dark:bg-[#071411]">
      <div className="border-b border-[#1a4d42]/12 bg-[#f8fbfa]/95 px-3 py-2 dark:border-white/10 dark:bg-[#071411]/95 sm:px-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          <div className="space-y-1">
            <Pulse className="h-4 w-28" />
            <Pulse className="h-2.5 w-44" />
          </div>
          <Pulse className="h-8 w-20" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-3 p-3 sm:space-y-5 sm:p-4">
        <div className="rounded-none border border-[#0a1f1a] bg-[#0a1f1a] p-4 sm:p-5">
          <Pulse className="h-3 w-24 bg-white/10" />
          <Pulse className="mt-2 h-5 w-56 bg-white/10" />
          <Pulse className="mt-1.5 h-2.5 w-72 max-w-full bg-white/10" />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Pulse key={i} className="h-14 bg-white/[0.07]" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Pulse key={i} className="h-[58px]" />
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <Pulse className="h-20 w-full lg:h-64 lg:w-56 lg:shrink-0" />
          <div className="grid min-w-0 flex-1 grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Pulse key={i} className="h-40" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
