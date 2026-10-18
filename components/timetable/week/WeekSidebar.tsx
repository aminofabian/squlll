"use client";

import type { TimetableStats } from "@/lib/timetable";
import type { CurrentLessonStatus, LessonStatus, NextLessonInfo } from "@/lib/timetable/types";
import type { LessonTints } from "@/lib/timetable/weekView/buildLessonTints";
import type { WeekDayDate } from "@/lib/timetable/weekView/getWeekDayDates";
import type { WeekViewerType } from "@/lib/timetable/weekView/weekViewerType";
import { WeekUpNextCard } from "./WeekUpNextCard";
import { WeekLiveStatusCard } from "./WeekLiveStatusCard";
import { WeekRhythmCard } from "./WeekRhythmCard";
import { WeekSubjectMixCard } from "./WeekSubjectMixCard";

const SCHOOL_CLOSED_STATUSES: LessonStatus[] = ["weekend", "outside"];
const MIN_SUBJECTS_FOR_MIX = 2;

type WeekSidebarProps = {
  viewType: WeekViewerType;
  tints: LessonTints;
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
  tints,
  nextLesson,
  currentStatus,
  formattedTime,
  stats,
  dayDates,
  lessonCounts,
  currentDayOfWeek,
}: WeekSidebarProps) {
  const hasLessons = (stats?.totalLessons ?? 0) > 0;
  const subjectCount = Object.keys(stats?.subjectDistribution ?? {}).length;
  const isSchoolOpen = !SCHOOL_CLOSED_STATUSES.includes(currentStatus.status);

  return (
    <aside className="sticky top-4 z-0 space-y-3">
      <WeekUpNextCard nextLesson={nextLesson} viewType={viewType} tints={tints} />
      {isSchoolOpen ? (
        <WeekLiveStatusCard status={currentStatus} formattedTime={formattedTime} viewType={viewType} />
      ) : null}
      {hasLessons ? (
        <WeekRhythmCard dayDates={dayDates} lessonCounts={lessonCounts} currentDayOfWeek={currentDayOfWeek} />
      ) : null}
      {stats && subjectCount >= MIN_SUBJECTS_FOR_MIX ? <WeekSubjectMixCard subjectDistribution={stats.subjectDistribution} /> : null}
    </aside>
  );
}
