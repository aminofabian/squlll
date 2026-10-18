"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { WEEK_CARD_CLASS } from "./weekCardClass";

const METRIC_COUNT = 3;
const DAY_COUNT = 5;
const AGENDA_ROW_COUNT = 5;

/** Loading placeholder matching the phone week view (header, up next, day strip, agenda). */
export function WeekMobileSkeleton() {
  return (
    <div className="space-y-4 px-4 pb-8 pt-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-3.5 w-64 max-w-full" />
      </div>
      <div className={`${WEEK_CARD_CLASS} grid grid-cols-3 gap-4 px-4 py-3`}>
        {Array.from({ length: METRIC_COUNT }).map((_, i) => (
          <Skeleton key={i} className="mx-auto h-9 w-14" />
        ))}
      </div>
      <div className="space-y-3 rounded-xl bg-[#111a17] p-4">
        <Skeleton className="h-3 w-16 bg-white/10" />
        <Skeleton className="h-6 w-3/4 bg-white/10" />
        <Skeleton className="h-8 w-2/3 bg-white/10" />
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: DAY_COUNT }).map((_, i) => (
          <Skeleton key={i} className="h-[68px] rounded-xl" />
        ))}
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: AGENDA_ROW_COUNT }).map((_, i) => (
          <Skeleton key={i} className="ml-14 h-[52px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}
