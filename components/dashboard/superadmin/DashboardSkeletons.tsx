import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="flex items-center gap-4">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="space-y-3 p-5">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GrowthSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="space-y-4 p-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-6" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PanelSkeleton rows={5} />
        </div>
        <PanelSkeleton rows={3} />
      </div>
      <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-3">
        <GrowthSkeleton />
        <div className="lg:col-span-2">
          <PanelSkeleton rows={2} />
        </div>
      </div>
    </div>
  );
}
