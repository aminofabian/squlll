import { Skeleton } from "@/components/ui/skeleton";

export function ClassCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40">
      <div className="px-4 py-3">
        <Skeleton className="mb-2 h-4 w-40" />
        <Skeleton className="mb-3 h-3 w-24" />
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-14 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
