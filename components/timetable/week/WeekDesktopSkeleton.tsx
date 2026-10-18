"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TimetableGridSkeleton } from "@/app/school/[subdomain]/(pages)/timetable/components/TimetableGridSkeleton";

const HERO_METRIC_COUNT = 4;
const RHYTHM_DAY_COUNT = 5;
const CARD =
  "rounded-xl border border-[#1a4d42]/10 bg-[#fffdf8] dark:border-white/10 dark:bg-[#0c1a17]";

function HeroSkeleton() {
  return (
    <div className="flex items-center gap-6 rounded-xl bg-[#0a2620] px-5 py-3">
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-2.5 w-32 bg-white/10" />
        <Skeleton className="h-6 w-72 max-w-full bg-white/10" />
      </div>
      <div className="hidden gap-6 xl:flex">
        {Array.from({ length: HERO_METRIC_COUNT }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-14 bg-white/10" />
        ))}
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-3">
      <div className={`${CARD} p-4`}>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-3 h-7 w-3/4" />
        <Skeleton className="mt-3 h-4 w-1/2" />
        <Skeleton className="mt-3 h-12 w-full rounded-lg" />
      </div>
      <div className={`${CARD} p-4`}>
        <Skeleton className="mb-3 h-3 w-20" />
        <div className="flex h-16 items-end gap-1.5">
          {Array.from({ length: RHYTHM_DAY_COUNT }).map((_, i) => (
            <Skeleton key={i} className="h-full flex-1 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Loading placeholder matching the desktop week view (hero bar, sidebar, grid). */
export function WeekDesktopSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <HeroSkeleton />
      <div className="grid grid-cols-[minmax(0,260px)_1fr] items-start gap-3 xl:grid-cols-[minmax(0,280px)_1fr]">
        <SidebarSkeleton />
        <section className={`min-w-0 overflow-hidden ${CARD}`}>
          <div className="border-b border-[#1a4d42]/8 px-4 py-2.5 dark:border-white/8">
            <Skeleton className="h-5 w-56" />
          </div>
          <TimetableGridSkeleton className="rounded-none border-0 bg-transparent" />
        </section>
      </div>
    </div>
  );
}
