"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PREVIEW_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const PREVIEW_PERIODS = 7;
const ROW_H = "h-11 min-h-[44px]";

interface TimetableGridSkeletonProps {
  className?: string;
  /** Mimic whole-school cells with paired chip placeholders */
  combined?: boolean;
}

function CellSkeleton({ combined }: { combined?: boolean }) {
  if (combined) {
    return (
      <div className="grid min-h-[44px] grid-cols-2 gap-1 p-0.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-[32px] w-full rounded border border-slate-200/50 bg-slate-100/80 dark:border-zinc-700/50 dark:bg-zinc-800/40"
          />
        ))}
      </div>
    );
  }

  return <Skeleton className={cn(ROW_H, "w-full rounded")} />;
}

export function TimetableGridSkeleton({
  className,
  combined = false,
}: TimetableGridSkeletonProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-950/40",
        className,
      )}
      aria-busy
      aria-label="Loading timetable"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/70 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <th className="sticky left-0 z-10 w-[72px] border-r border-zinc-200/90 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
                <Skeleton className="h-3 w-10" />
              </th>
              {PREVIEW_DAYS.map((day) => (
                <th
                  key={day}
                  className="border-r border-zinc-200/60 p-2 last:border-r-0 dark:border-zinc-800"
                >
                  <Skeleton className="mx-auto h-3 w-8" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: PREVIEW_PERIODS }).map((_, row) => (
              <tr
                key={row}
                className="border-b border-zinc-100 dark:border-zinc-800/80"
              >
                <td className="sticky left-0 border-r border-zinc-200/90 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
                  <Skeleton className={cn(ROW_H, "w-full rounded-md")} />
                </td>
                {PREVIEW_DAYS.map((day) => (
                  <td key={day} className="bg-white p-1 align-top dark:bg-zinc-900/40">
                    <CellSkeleton combined={combined} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TimetableSidebarSkeleton() {
  return (
    <aside className="flex w-64 flex-shrink-0 flex-col border-r border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:w-72">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3.5 dark:border-zinc-800">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-3 p-4">
        <Skeleton className="h-9 w-full rounded-lg" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </aside>
  );
}
