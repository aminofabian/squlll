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
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-2 h-6 w-12" />
        </div>
      ))}
    </div>
  );
}

function NextLessonSkeleton({ tall, className }: { tall?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        tall ? "p-4" : "p-3 shadow-sm",
        className,
      )}
    >
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-2 h-5 w-full" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      {tall && <Skeleton className="mt-4 h-14 w-full rounded-lg" />}
    </div>
  );
}

function BannerSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-3">
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
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card",
        flex ? "min-h-0 flex-1" : "lg:shadow-sm",
      )}
    >
      <div className="shrink-0 border-b border-border px-2 py-2">
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
        "overflow-x-hidden bg-gradient-to-b from-primary/[0.04] via-background to-background",
        isPage
          ? cn(
              "mb-0 w-full min-w-0 max-w-full",
              "min-h-0 max-lg:overflow-hidden lg:min-h-[calc(100dvh-4rem)]",
            )
          : "min-h-[60vh]",
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
            <div className="flex h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] max-h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] w-full flex-col overflow-hidden bg-background lg:hidden">
              <StudentNextLessonBarSkeleton />
              <ScheduleGridSkeleton flex />
              <StudentTimetableStatsBarSkeleton />
            </div>
            <div className="hidden lg:block">
              <div className="mb-3 flex justify-end">
                <Skeleton className="h-8 w-20 rounded-lg" />
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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                {onBack ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    aria-label="Back"
                    className="-ml-2 shrink-0 gap-1.5 px-2 text-muted-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                ) : (
                  <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                )}
                <div className="space-y-2">
                  <Skeleton className="h-7 w-40 lg:h-8" />
                  <Skeleton className="h-4 w-56 max-w-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
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
