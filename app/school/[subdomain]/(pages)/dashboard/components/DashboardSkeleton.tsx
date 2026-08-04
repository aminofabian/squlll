"use client";

import { cn } from "@/lib/utils";

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[#1a4d42]/10 dark:bg-white/10",
        className,
      )}
    />
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="relative min-h-full bg-[#f3f7f5] dark:bg-[#071411]">
      <div className="relative mx-auto max-w-6xl space-y-3 p-3 sm:p-4 lg:p-5">
        <div className="overflow-hidden border border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#0c1a17]">
          <div className="flex items-center justify-between gap-3 border-b border-[#1a4d42]/10 bg-[#0a1f1a] px-3 py-2.5">
            <Pulse className="h-5 w-48 bg-white/15" />
            <Pulse className="h-5 w-16 bg-white/15" />
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-[#1a4d42]/10 sm:grid-cols-4 sm:divide-y-0 dark:divide-white/10">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-1.5 px-3 py-2.5">
                <Pulse className="h-2.5 w-14" />
                <Pulse className="h-6 w-10" />
              </div>
            ))}
          </div>
        </div>

        <Pulse className="h-10 w-full" />

        <div className="grid gap-3 lg:grid-cols-12">
          <div className="overflow-hidden border border-[#1a4d42]/12 bg-white lg:col-span-5 dark:border-white/10">
            <div className="border-b border-[#1a4d42]/10 px-3 py-2">
              <Pulse className="h-4 w-24" />
            </div>
            <div className="divide-y divide-[#1a4d42]/10">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-2 px-3 py-2">
                  <Pulse className="h-6 w-6" />
                  <Pulse className="h-3 flex-1" />
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden border border-[#1a4d42]/12 bg-white lg:col-span-3 dark:border-white/10">
            <div className="border-b border-[#1a4d42]/10 px-3 py-2">
              <Pulse className="h-4 w-20" />
            </div>
            <div className="space-y-1 p-1.5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Pulse key={index} className="h-10 w-full" />
              ))}
            </div>
          </div>
          <div className="overflow-hidden border border-[#1a4d42]/12 bg-white lg:col-span-4 dark:border-white/10">
            <div className="border-b border-[#1a4d42]/10 px-3 py-2">
              <Pulse className="h-4 w-28" />
            </div>
            <div className="space-y-2 p-3">
              <Pulse className="h-10 w-full" />
              <Pulse className="h-10 w-full" />
              <Pulse className="h-16 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
