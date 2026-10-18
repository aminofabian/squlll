"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TimetableGridSkeleton } from "@/app/school/[subdomain]/(pages)/timetable/components/TimetableGridSkeleton";
import {
  TimetableNextLessonBarSkeleton,
  TimetableMobileStatsBarSkeleton,
} from "@/components/timetable";

const HERO_METRIC_COUNT = 4;
const RHYTHM_DAY_COUNT = 5;
const DESKTOP_CARD =
  "rounded-[24px] bg-[#fffdf8] ring-1 ring-[#1a4d42]/10 dark:bg-[#0c1a17] dark:ring-white/10";

function HeroSkeleton() {
  return (
    <div className="rounded-[30px] bg-[#0a2620] px-8 pt-7">
      <Skeleton className="h-3 w-40 bg-white/10" />
      <Skeleton className="mt-7 h-11 w-80 max-w-full bg-white/10" />
      <Skeleton className="mt-3 h-4 w-64 bg-white/[0.07]" />
      <div className="mt-7 grid grid-cols-4 divide-x divide-white/10 border-t border-white/10">
        {Array.from({ length: HERO_METRIC_COUNT }).map((_, i) => (
          <div key={i} className="space-y-2 px-5 py-5 first:pl-0">
            <Skeleton className="h-2.5 w-16 bg-white/10" />
            <Skeleton className="h-8 w-14 bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      <div className={`${DESKTOP_CARD} p-5`}>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-3 h-7 w-3/4" />
        <Skeleton className="mt-3 h-4 w-1/2" />
        <Skeleton className="mt-4 h-16 w-full rounded-[18px]" />
      </div>
      <div className={`${DESKTOP_CARD} p-5`}>
        <Skeleton className="mb-4 h-3 w-20" />
        <div className="flex h-28 items-end gap-2">
          {Array.from({ length: RHYTHM_DAY_COUNT }).map((_, i) => (
            <Skeleton key={i} className="h-full flex-1 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ScheduleGridSkeleton({ flex = false }: { flex?: boolean }) {
  return (
    <section
      className={
        flex
          ? "flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-slate-950"
          : "overflow-hidden rounded-lg border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-800/90"
      }
    >
      <TimetableGridSkeleton
        className={
          flex
            ? "h-full min-h-0 flex-1 rounded-none border-0 bg-transparent"
            : "rounded-none border-0 bg-transparent"
        }
      />
    </section>
  );
}

export function TeacherTimetableSkeleton() {
  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[#f4f1e9] dark:bg-[#071411]"
      aria-busy
      aria-label="Loading timetable"
    >
      <div className="mx-auto w-full max-w-[1380px] max-lg:overflow-hidden max-lg:p-0 lg:px-7 lg:py-6">
        <div className="flex h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] max-h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] w-full flex-col overflow-hidden bg-white lg:hidden dark:bg-slate-950">
          <TimetableNextLessonBarSkeleton viewType="teacher" />
          <ScheduleGridSkeleton flex />
          <TimetableMobileStatsBarSkeleton viewType="teacher" />
        </div>

        <div className="hidden flex-col gap-6 lg:flex">
          <HeroSkeleton />
          <div className="grid grid-cols-[minmax(0,296px)_1fr] items-start gap-6 xl:grid-cols-[minmax(0,316px)_1fr]">
            <div className="sticky top-4">
              <SidebarSkeleton />
            </div>
            <section className="min-w-0 overflow-hidden rounded-[26px] bg-[#fffdf8] ring-1 ring-[#1a4d42]/10 dark:bg-[#0c1a17] dark:ring-white/10">
              <div className="border-b border-[#1a4d42]/8 px-6 pb-4 pt-5 dark:border-white/8">
                <Skeleton className="h-2.5 w-28" />
                <Skeleton className="mt-2 h-6 w-56" />
              </div>
              <TimetableGridSkeleton className="rounded-none border-0 bg-transparent" />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
