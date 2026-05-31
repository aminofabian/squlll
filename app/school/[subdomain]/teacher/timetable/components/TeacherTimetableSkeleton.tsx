"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TimetableGridSkeleton } from "@/app/school/[subdomain]/(pages)/timetable/components/TimetableGridSkeleton";

function HeroSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/90 sm:px-5">
      <Skeleton className="mb-2 h-5 w-20 rounded-full" />
      <Skeleton className="h-7 w-56 max-w-full sm:h-8" />
      <Skeleton className="mt-2 h-4 w-40" />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-5 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </div>
      <div className="rounded-md border border-slate-200/80 bg-white px-3 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
        <Skeleton className="mb-3 h-3 w-20" />
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-sm" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md border border-slate-200/80 bg-white px-2.5 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800/90"
          >
            <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5 overflow-hidden">
      <div className="flex shrink-0 justify-end">
        <Skeleton className="h-7 w-28 rounded-md" />
      </div>
      <div className="shrink-0 rounded-lg border border-slate-200/80 bg-white px-3.5 py-3 dark:border-slate-700 dark:bg-slate-800/90">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-5 w-4/5" />
        <Skeleton className="mt-2 h-3 w-full" />
      </div>
      <div className="grid shrink-0 grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-800/90">
        <TimetableGridSkeleton className="h-full min-h-0 flex-1 rounded-none border-0 bg-transparent" />
      </section>
    </div>
  );
}

export function TeacherTimetableSkeleton() {
  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[#f2f2f7] lg:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] lg:from-primary/[0.06] lg:via-slate-50 lg:to-white dark:lg:from-primary/10 dark:lg:via-slate-900 dark:lg:to-slate-950"
      aria-busy
      aria-label="Loading timetable"
    >
      <div className="container mx-auto max-w-7xl px-4 py-4 max-lg:overflow-x-hidden max-lg:p-0">
        <div className="flex h-[calc(100dvh-9.75rem)] max-h-[calc(100dvh-9.75rem)] w-full max-w-full flex-col overflow-hidden bg-[#f2f2f7] px-3 pt-2 pb-2 lg:hidden">
          <MobileSkeleton />
        </div>

        <div className="hidden flex-col gap-4 lg:flex">
          <HeroSkeleton />
          <div className="grid grid-cols-[minmax(0,340px)_1fr] items-start gap-4">
            <div className="sticky top-4">
              <SidebarSkeleton />
            </div>
            <div className="min-w-0 space-y-3">
              <section className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60 dark:bg-slate-800/95 dark:shadow-none dark:ring-slate-700/80 lg:rounded-lg lg:border lg:border-slate-200/80 lg:shadow-sm">
                <div className="hidden border-b border-slate-100 px-4 py-2.5 dark:border-slate-700/80 lg:block">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1 h-3 w-48" />
                </div>
                <TimetableGridSkeleton className="rounded-none border-0 bg-transparent" />
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
