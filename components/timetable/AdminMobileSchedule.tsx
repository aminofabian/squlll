"use client";

import React, { useCallback, useMemo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type {
  TimetableDay,
  TimetableSlot,
  TimetableBreak,
  TimetableLesson,
} from "@/lib/timetable/types";
import { TeacherMobileWeekTable } from "./TeacherMobileWeekTable";
import { AdminMobileClassBar } from "./AdminMobileClassBar";
import { TimetableMobileStatsBar } from "./TimetableMobileStatsBar";
import { TimetableTeacherWorkload } from "@/app/school/[subdomain]/(pages)/timetable/components/TimetableTeacherWorkload";
import type { TeacherWeeklyLesson } from "@/app/school/[subdomain]/(pages)/timetable/hooks/useTimetableData";

export type AdminMobileScheduleProps = {
  classLabel: string;
  streamName?: string | null;
  termName?: string | null;
  filledSlots?: number;
  totalSlots?: number;
  totalLessons?: number;
  subjectCount?: number;
  conflictCount?: number;
  fillPercent?: number;
  days: TimetableDay[];
  timeSlots: TimetableSlot[];
  breaks: TimetableBreak[];
  weekDays: number[];
  dayShortNames: Record<number, string>;
  currentDayOfWeek: number | null;
  currentPeriodIndex: number;
  conflictLessonIds?: Set<string>;
  onRefresh?: () => void;
  onClassPickerClick?: () => void;
  onLessonClick?: (
    lesson: TimetableLesson,
    dayOfWeek: number,
    periodNumber: number,
  ) => void;
  onEmptyCellClick?: (dayOfWeek: number, periodNumber: number) => void;
  teacherLessons?: TeacherWeeklyLesson[];
  highlightTeacherId?: string | null;
  onTeacherClick?: (teacherId: string) => void;
  /** Compact toolbar row rendered below the class header (mobile admin). */
  actionStrip?: ReactNode;
  className?: string;
};

export function AdminMobileSchedule({
  classLabel,
  streamName,
  termName,
  filledSlots = 0,
  totalSlots = 0,
  totalLessons = 0,
  subjectCount = 0,
  conflictCount = 0,
  fillPercent,
  days,
  timeSlots,
  breaks,
  weekDays,
  dayShortNames,
  currentDayOfWeek,
  currentPeriodIndex,
  conflictLessonIds,
  onRefresh,
  onClassPickerClick,
  onLessonClick,
  onEmptyCellClick,
  teacherLessons = [],
  highlightTeacherId,
  onTeacherClick,
  actionStrip,
  className,
}: AdminMobileScheduleProps) {
  const dayMap = useMemo(() => {
    const map = new Map<number, TimetableDay>();
    days.forEach((d) => map.set(d.dayOfWeek, d));
    return map;
  }, [days]);

  const handleLessonClick = useCallback(
    (lesson: TimetableLesson, day: number, period: number) => {
      onLessonClick?.(lesson, day, period);
    },
    [onLessonClick],
  );

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden bg-slate-50/60 dark:bg-slate-950",
        className,
      )}
    >
      <div className="shrink-0 bg-white dark:bg-slate-950">
        <AdminMobileClassBar
          classLabel={classLabel}
          streamName={streamName}
          termName={termName}
          filledSlots={filledSlots}
          totalSlots={totalSlots}
          onRefresh={onRefresh}
          onClassPickerClick={onClassPickerClick}
        />

        {actionStrip}
      </div>

      <section
        className="mt-4 flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-hidden rounded-t-[1.25rem] bg-white px-1.5 pt-2 shadow-[0_-1px_0_rgba(0,0,0,0.04)] dark:bg-slate-950 dark:shadow-[0_-1px_0_rgba(255,255,255,0.04)]"
        aria-label="Weekly class timetable"
      >
        <TeacherMobileWeekTable
          dayMap={dayMap}
          timeSlots={timeSlots}
          breaks={breaks}
          currentDayOfWeek={currentDayOfWeek}
          currentPeriodIndex={currentPeriodIndex}
          completedLessonIds={[]}
          viewType="admin"
          weekDays={weekDays}
          dayShortNames={dayShortNames}
          conflictLessonIds={conflictLessonIds}
          onLessonClick={handleLessonClick}
          onEmptyCellClick={onEmptyCellClick}
        />
      </section>

      {teacherLessons.length > 0 ? (
        <div className="shrink-0 border-t border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
          <TimetableTeacherWorkload
            teachers={teacherLessons}
            highlightTeacherId={highlightTeacherId}
            onTeacherClick={onTeacherClick}
            maxHeightClass="max-h-36"
          />
        </div>
      ) : null}

      <TimetableMobileStatsBar
        viewType="admin"
        filledSlots={filledSlots}
        totalSlots={totalSlots}
        totalLessons={totalLessons}
        subjectCount={subjectCount}
        conflictCount={conflictCount}
        fillPercent={fillPercent}
        className="mt-auto"
      />
    </div>
  );
}
