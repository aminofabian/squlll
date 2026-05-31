'use client';

import React, { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type {
  TimetableDay,
  TimetableSlot,
  TimetableBreak,
  TimetableLesson,
  NextLessonInfo,
  TimetableStats,
} from '@/lib/timetable/types';
import { TeacherMobileWeekTable } from './TeacherMobileWeekTable';
import { TimetableNextLessonBar } from './TimetableNextLessonBar';
import { TimetableMobileStatsBar } from './TimetableMobileStatsBar';

export type TeacherMobileScheduleProps = {
  days: TimetableDay[];
  timeSlots: TimetableSlot[];
  breaks: TimetableBreak[];
  currentDayOfWeek: number | null;
  currentPeriodIndex: number;
  completedLessonIds: string[];
  nextLesson: NextLessonInfo | null;
  nextLessonLoading?: boolean;
  stats?: TimetableStats | null;
  classesToday?: number | null;
  isWeekend?: boolean;
  onRefresh?: () => void;
  onLessonClick?: (
    lesson: TimetableLesson,
    dayOfWeek: number,
    periodNumber: number,
  ) => void;
  className?: string;
};

export function TeacherMobileSchedule({
  days,
  timeSlots,
  breaks,
  currentDayOfWeek,
  currentPeriodIndex,
  completedLessonIds,
  nextLesson,
  nextLessonLoading = false,
  stats,
  classesToday,
  isWeekend = false,
  onRefresh,
  onLessonClick,
  className,
}: TeacherMobileScheduleProps) {
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
        'flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden bg-white dark:bg-slate-950',
        className,
      )}
    >
      <TimetableNextLessonBar
        viewType="teacher"
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
          viewType="teacher"
          onLessonClick={handleLessonClick}
        />
      </section>

      <TimetableMobileStatsBar
        viewType="teacher"
        stats={stats}
        classesToday={classesToday}
        isWeekend={isWeekend}
      />
    </div>
  );
}
