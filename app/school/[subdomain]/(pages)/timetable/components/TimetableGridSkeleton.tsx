"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const PREVIEW_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const PREVIEW_PERIODS = 7;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ROW_H = "h-11 min-h-[44px]";
const MOBILE_TIME_COL_W = "w-[108px]";

interface TimetableGridSkeletonProps {
  className?: string;
  /** Mimic whole-school cells with paired chip placeholders */
  combined?: boolean;
  /** Number of day columns (desktop) / day tabs (mobile). Defaults to 5. */
  daysPerWeek?: number;
  /** Number of period rows to render. Defaults to 7. */
  periodCount?: number;
  /**
   * Render the phone layout (day-tab row + stacked period rows).
   * When omitted, detected via `useIsMobile()`.
   */
  mobile?: boolean;
}

function CellSkeleton({ combined }: { combined?: boolean }) {
  if (combined) {
    return (
      <div className="grid min-h-[44px] grid-cols-2 gap-1 p-0.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-[32px] w-full rounded-none border border-slate-200/50 bg-slate-100/80 dark:border-zinc-700/50 dark:bg-zinc-800/40"
          />
        ))}
      </div>
    );
  }

  return <Skeleton className={cn(ROW_H, "w-full rounded-none")} />;
}

function MobileDayTabsSkeleton({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1 border-b border-zinc-200/90 bg-white px-2 py-2 dark:border-zinc-800 dark:bg-zinc-900">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-7 min-w-0 flex-1 rounded-none",
            i === 0 && "bg-[#246a59]/25 dark:bg-[#246a59]/35",
          )}
        />
      ))}
    </div>
  );
}

function MobilePeriodRowsSkeleton({
  periodCount,
  combined,
}: {
  periodCount: number;
  combined?: boolean;
}) {
  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
      {Array.from({ length: periodCount }).map((_, row) => (
        <div key={row} className="flex items-stretch gap-1 p-1">
          <Skeleton
            className={cn(ROW_H, MOBILE_TIME_COL_W, "shrink-0 rounded-none")}
          />
          <div className="min-w-0 flex-1">
            <CellSkeleton combined={combined} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TimetableGridSkeleton({
  className,
  combined = false,
  daysPerWeek = PREVIEW_DAYS.length,
  periodCount = PREVIEW_PERIODS,
  mobile,
}: TimetableGridSkeletonProps) {
  const detectedMobile = useIsMobile();
  const isMobileLayout = mobile ?? detectedMobile;
  const dayCount = Math.max(1, Math.floor(daysPerWeek));
  const rows = Math.max(1, Math.floor(periodCount));
  const dayLabels = Array.from(
    { length: dayCount },
    (_, i) => DAY_LABELS[i] ?? `D${i + 1}`,
  );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-none border border-zinc-200/90 bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-950/40",
        className,
      )}
      aria-busy
      aria-label="Loading timetable"
    >
      {isMobileLayout ? (
        <>
          <MobileDayTabsSkeleton count={dayCount} />
          <MobilePeriodRowsSkeleton periodCount={rows} combined={combined} />
        </>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-zinc-200/70 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <th className="sticky left-0 z-10 w-[72px] border-r border-zinc-200/90 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
                  <Skeleton className="h-3 w-10" />
                </th>
                {dayLabels.map((day) => (
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
              {Array.from({ length: rows }).map((_, row) => (
                <tr
                  key={row}
                  className="border-b border-zinc-100 dark:border-zinc-800/80"
                >
                  <td className="sticky left-0 border-r border-zinc-200/90 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
                    <Skeleton className={cn(ROW_H, "w-full rounded-none")} />
                  </td>
                  {dayLabels.map((day) => (
                    <td
                      key={day}
                      className="bg-white p-1 align-top dark:bg-zinc-900/40"
                    >
                      <CellSkeleton combined={combined} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function TimetableSidebarSkeleton() {
  return (
    <div className="flex w-64 flex-shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex shrink-0 justify-end border-b border-slate-200/80 px-2 py-2 dark:border-slate-800">
        <Skeleton className="h-8 w-8 rounded-none" />
      </div>
      <div className="flex flex-1 flex-col space-y-3 px-3 pb-3 pt-1">
        <Skeleton className="h-8 w-full rounded-none" />
        <Skeleton className="h-9 w-full rounded-none" />
        <div className="grid grid-cols-2 gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-none" />
          ))}
        </div>
      </div>
    </div>
  );
}
