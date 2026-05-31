"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import type {
  TimetableDay,
  TimetableSlot,
  TimetableBreak,
  TimetableLesson,
  NextLessonInfo,
  TimetableStats,
} from "@/lib/timetable/types";
import { TeacherMobileWeekTable } from "@/components/timetable/TeacherMobileWeekTable";
import { StudentNextLessonBar } from "./StudentNextLessonBar";
import { StudentTimetableStatsBar } from "./StudentTimetableStatsBar";

export type StudentMobileScheduleProps = {
  days: TimetableDay[];
  timeSlots: TimetableSlot[];
  breaks: TimetableBreak[];
  currentDayOfWeek: number | null;
  currentPeriodIndex: number;
  completedLessonIds: string[];
  nextLesson: NextLessonInfo | null;
  nextLessonLoading?: boolean;
  stats?: TimetableStats | null;
  onRefresh?: () => void;
  onLessonClick?: (
    lesson: TimetableLesson,
    dayOfWeek: number,
    periodNumber: number,
  ) => void;
  className?: string;
};

export function StudentMobileSchedule({
  days,
  timeSlots,
  breaks,
  currentDayOfWeek,
  currentPeriodIndex,
  completedLessonIds,
  nextLesson,
  nextLessonLoading = false,
  stats,
  onRefresh,
  onLessonClick,
  className,
}: StudentMobileScheduleProps) {
  const dayMap = useMemo(() => {
    const map = new Map<number, TimetableDay>();
    days.forEach((d) => map.set(d.dayOfWeek, d));
    return map;
  }, [days]);

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden bg-white dark:bg-slate-950",
        className,
      )}
    >
      <StudentNextLessonBar
        nextLesson={nextLesson}
        loading={nextLessonLoading}
        onRefresh={onRefresh}
      />

      <section
        className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-hidden bg-white dark:bg-slate-950"
        aria-label="Weekly timetable"
      >
        <TeacherMobileWeekTable
          dayMap={dayMap}
          timeSlots={timeSlots}
          breaks={breaks}
          currentDayOfWeek={currentDayOfWeek}
          currentPeriodIndex={currentPeriodIndex}
          completedLessonIds={completedLessonIds}
          viewType="student"
          onLessonClick={onLessonClick}
        />
      </section>

      <StudentTimetableStatsBar stats={stats} />
    </div>
  );
}
