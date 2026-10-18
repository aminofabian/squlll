"use client";

import { WeekDesktopSkeleton } from "@/components/timetable/week/WeekDesktopSkeleton";
import { TimetableGridSkeleton } from "@/app/school/[subdomain]/(pages)/timetable/components/TimetableGridSkeleton";
import {
  TimetableNextLessonBarSkeleton,
  TimetableMobileStatsBarSkeleton,
} from "@/components/timetable";

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
      <div className="mx-auto w-full max-w-[1440px] max-lg:overflow-hidden max-lg:p-0 lg:px-5 lg:py-4">
        <div className="flex h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] max-h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] w-full flex-col overflow-hidden bg-white lg:hidden dark:bg-slate-950">
          <TimetableNextLessonBarSkeleton viewType="teacher" />
          <ScheduleGridSkeleton flex />
          <TimetableMobileStatsBarSkeleton viewType="teacher" />
        </div>

        <div className="hidden lg:block">
          <WeekDesktopSkeleton />
        </div>
      </div>
    </div>
  );
}
