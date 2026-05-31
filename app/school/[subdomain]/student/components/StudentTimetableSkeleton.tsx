"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TimetableGridSkeleton } from "@/app/school/[subdomain]/(pages)/timetable/components/TimetableGridSkeleton";
import { StudentNextLessonBarSkeleton } from "./StudentNextLessonBar";
import { StudentTimetableStatsBarSkeleton } from "./StudentTimetableStatsBar";

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90"
        >
          <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NextLessonSkeleton({ tall, className }: { tall?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-800/90",
        tall ? "p-4" : "p-3 shadow-sm",
        className,
      )}
    >
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-2 h-5 w-full" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      {tall && <Skeleton className="mt-4 h-14 w-full rounded-xl" />}
    </div>
  );
}

function BannerSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white px-3.5 py-3 dark:border-slate-700 dark:bg-slate-800/90">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-2 h-5 w-4/5" />
      <Skeleton className="mt-2 h-3 w-full" />
    </div>
  );
}

function ScheduleGridSkeleton({ flex }: { flex?: boolean }) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden bg-white dark:bg-slate-950",
        flex ? "min-h-0 flex-1" : "lg:shadow-sm",
      )}
    >
      <div className="shrink-0 border-b border-slate-100 px-2 py-2 dark:border-slate-800">
        <Skeleton className="h-8 w-full" />
      </div>
      <div className={cn(flex && "min-h-0 flex-1 overflow-hidden")}>
        <TimetableGridSkeleton className="h-full rounded-none border-0 bg-transparent" />
      </div>
    </section>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-3">
      <NextLessonSkeleton />
      <BannerSkeleton />
      <StatCardsSkeleton />
    </div>
  );
}

interface StudentTimetableSkeletonProps {
  onBack?: () => void;
  layout?: "embedded" | "page";
}

export function StudentTimetableSkeleton({
  onBack,
  layout = "embedded",
}: StudentTimetableSkeletonProps) {
  const isPage = layout === "page";

  return (
    <div
      className={cn(
        "overflow-x-hidden",
        isPage
          ? cn(
              "mb-0 w-full min-w-0 max-w-full",
              "min-h-0 max-lg:overflow-hidden lg:min-h-[calc(100dvh-4rem)]",
              "bg-[#f2f2f7] lg:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] lg:from-primary/[0.06] lg:via-slate-50 lg:to-white",
              "dark:lg:from-primary/10 dark:lg:via-slate-900 dark:lg:to-slate-950",
            )
          : cn(
              "min-h-[60vh]",
              "bg-[#f2f2f7] lg:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] lg:from-primary/[0.06] lg:via-slate-50 lg:to-white",
              "dark:lg:from-primary/10 dark:lg:via-slate-900 dark:lg:to-slate-950",
            ),
      )}
      aria-busy
      aria-label="Loading timetable"
    >
      <div
        className={cn(
          "mx-auto max-w-7xl",
          isPage
            ? "max-lg:p-0 lg:px-6 lg:py-5"
            : "px-4 py-4 lg:px-6",
        )}
      >
        {isPage ? (
          <>
            <div className="flex h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] max-h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] w-full flex-col overflow-hidden bg-white lg:hidden dark:bg-slate-950">
              <StudentNextLessonBarSkeleton />
              <ScheduleGridSkeleton flex />
              <StudentTimetableStatsBarSkeleton />
            </div>
            <div className="hidden lg:block">
              <div className="mb-3 flex justify-end">
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
              <div className="grid grid-cols-[minmax(0,300px)_1fr] items-start gap-4 xl:grid-cols-[minmax(0,340px)_1fr]">
                <div className="sticky top-4">
                  <SidebarSkeleton />
                </div>
                <ScheduleGridSkeleton />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-700">
              <div className="flex items-center gap-3">
                {onBack ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                ) : (
                  <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                )}
                <div className="space-y-2">
                  <Skeleton className="h-7 w-40 lg:h-8" />
                  <Skeleton className="h-4 w-56 max-w-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
            <div className="space-y-4 lg:hidden">
              <BannerSkeleton />
              <NextLessonSkeleton />
              <StatCardsSkeleton />
              <ScheduleGridSkeleton />
            </div>
            <div className="hidden grid-cols-[minmax(0,300px)_1fr] items-start gap-4 xl:grid-cols-[minmax(0,340px)_1fr] lg:grid">
              <div className="sticky top-4">
                <SidebarSkeleton />
              </div>
              <ScheduleGridSkeleton />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
