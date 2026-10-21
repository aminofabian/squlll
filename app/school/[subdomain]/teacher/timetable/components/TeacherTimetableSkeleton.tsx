"use client";

import { WeekDesktopSkeleton } from "@/components/timetable/week/WeekDesktopSkeleton";
import { WeekMobileSkeleton } from "@/components/timetable/week/WeekMobileSkeleton";

export function TeacherTimetableSkeleton() {
  return (
    <div className="min-h-[60vh] overflow-x-hidden" aria-busy aria-label="Loading timetable">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="lg:hidden">
          <WeekMobileSkeleton />
        </div>
        <div className="hidden lg:block">
          <WeekDesktopSkeleton />
        </div>
      </div>
    </div>
  );
}
