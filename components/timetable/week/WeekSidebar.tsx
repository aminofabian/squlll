"use client";

import type { TimetableStats } from "@/lib/timetable";
import type { CurrentLessonStatus, NextLessonInfo } from "@/lib/timetable/types";
import type { WeekDayDate } from "@/lib/timetable/weekView/getWeekDayDates";
import type { WeekViewerType } from "@/lib/timetable/weekView/weekViewerType";
import { WeekUpNextCard } from "./WeekUpNextCard";
import { WeekLiveStatusCard } from "./WeekLiveStatusCard";
import { WeekRhythmCard } from "./WeekRhythmCard";
import { WeekSubjectMixCard } from "./WeekSubjectMixCard";

type WeekSidebarProps = {
  viewType: WeekViewerType;
  nextLesson: NextLessonInfo | null;
  currentStatus: CurrentLessonStatus;
  formattedTime: string;
  stats: TimetableStats | undefined;
  dayDates: WeekDayDate[];
  lessonCounts: Record<number, number>;
  currentDayOfWeek: number | null;
};

export function WeekSidebar({
  viewType,
  nextLesson,
  currentStatus,
  formattedTime,
  stats,
  dayDates,
  lessonCounts,
  currentDayOfWeek,
}: WeekSidebarProps) {
  const hasLessons = (stats?.totalLessons ?? 0) > 0;

  return (
    <aside className="sticky top-4 z-0 space-y-3">
      <WeekUpNextCard nextLesson={nextLesson} viewType={viewType} />
      <WeekLiveStatusCard status={currentStatus} formattedTime={formattedTime} viewType={viewType} />
      {hasLessons ? (
        <WeekRhythmCard dayDates={dayDates} lessonCounts={lessonCounts} currentDayOfWeek={currentDayOfWeek} />
      ) : null}
      {stats && hasLessons ? <WeekSubjectMixCard subjectDistribution={stats.subjectDistribution} /> : null}
    </aside>
  );
}
