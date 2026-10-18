"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { WEEK_CARD_CLASS } from "./weekCardClass";
import { TimetableGridSkeleton } from "@/app/school/[subdomain]/(pages)/timetable/components/TimetableGridSkeleton";

const HERO_METRIC_COUNT = 3;
const RHYTHM_DAY_COUNT = 5;
const CARD = WEEK_CARD_CLASS;

function HeroSkeleton() {
  return (
    <div className="flex items-end justify-between gap-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-3.5 w-64" />
      </div>
      <div className={`${CARD} flex gap-6 px-4 py-2.5`}>
        {Array.from({ length: HERO_METRIC_COUNT }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-14" />
        ))}
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-[#111a17] p-4">
        <Skeleton className="h-3 w-16 bg-white/10" />
        <Skeleton className="mt-3 h-7 w-3/4 bg-white/10" />
        <Skeleton className="mt-3 h-4 w-1/2 bg-white/10" />
        <Skeleton className="mt-4 h-8 w-2/3 bg-white/10" />
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
    <div className="flex flex-col gap-4">
      <HeroSkeleton />
      <div className="grid grid-cols-[minmax(0,250px)_1fr] items-start gap-4 xl:grid-cols-[minmax(0,270px)_1fr]">
        <SidebarSkeleton />
        <section className={`min-w-0 overflow-hidden ${CARD}`}>
          <div className="px-4 py-3.5">
            <Skeleton className="h-5 w-56" />
          </div>
          <TimetableGridSkeleton className="rounded-md border-0 bg-transparent" />
        </section>
      </div>
    </div>
  );
}
