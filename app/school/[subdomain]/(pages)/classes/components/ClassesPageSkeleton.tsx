"use client";

import { cn } from "@/lib/utils";

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-[#e8f2ef] dark:bg-white/5", className)}
    />
  );
}

export function ClassesPageSkeleton() {
  return (
    <div className="flex min-h-full bg-background dark:bg-[#071411]">
      <div className="hidden w-64 shrink-0 flex-col border-r border-[#1a4d42]/12 bg-[#f8fbfa] dark:border-white/10 dark:bg-[#0c1a17] lg:flex">
        <div className="flex justify-end border-b border-[#1a4d42]/10 px-2 py-2 dark:border-white/10">
          <Pulse className="h-8 w-8 rounded-lg" />
        </div>
        <div className="space-y-2 px-3 py-3">
          <Pulse className="h-8 w-full rounded-lg" />
          <Pulse className="h-3 w-24" />
          <Pulse className="h-10 w-full rounded-lg" />
          {Array.from({ length: 7 }).map((_, index) => (
            <Pulse key={index} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-[#1a4d42]/12 bg-[#f8fbfa]/95 px-3 py-2 dark:border-white/10 dark:bg-[#071411]/95 sm:px-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
            <div className="space-y-1">
              <Pulse className="h-2.5 w-20" />
              <Pulse className="h-4 w-32" />
              <Pulse className="h-2.5 w-48" />
            </div>
            <Pulse className="h-8 w-24 rounded-lg" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl space-y-2.5 p-3 sm:p-4">
          <div className="border border-[#0a1f1a] bg-[#0a1f1a] p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <Pulse className="h-12 w-12 bg-white/10" />
              <div className="space-y-2">
                <Pulse className="h-2.5 w-24 bg-white/10" />
                <Pulse className="h-5 w-48 bg-white/10" />
                <Pulse className="h-2.5 w-64 max-w-full bg-white/10" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Pulse key={index} className="h-7 bg-white/[0.08]" />
              ))}
            </div>
          </div>

          <div className="border border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#0c1a17]">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="space-y-2 border-b border-r border-[#1a4d42]/10 px-3 py-3 dark:border-white/10"
                >
                  <Pulse className="h-2.5 w-20" />
                  <Pulse className="h-6 w-14" />
                  <Pulse className="h-2.5 w-24" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <div className="space-y-2.5">
              <Pulse className="h-72 w-full rounded-lg" />
              <Pulse className="h-64 w-full rounded-lg" />
            </div>
            <div className="space-y-2.5">
              <Pulse className="h-24 w-full rounded-lg" />
              <Pulse className="h-48 w-full rounded-lg" />
              <Pulse className="h-56 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
