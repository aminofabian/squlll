"use client";

import type { TimetableStats } from "@/lib/timetable";
import type { CurrentLessonStatus, NextLessonInfo } from "@/lib/timetable/types";
import type { WeekDayDate } from "../lib/getWeekDayDates";
import { TeacherUpNextCard } from "./TeacherUpNextCard";
import { TeacherLiveStatusCard } from "./TeacherLiveStatusCard";
import { TeacherWeekRhythmCard } from "./TeacherWeekRhythmCard";
import { TeacherSubjectMixCard } from "./TeacherSubjectMixCard";

type TeacherTimetableSidebarProps = {
  nextLesson: NextLessonInfo | null;
  currentStatus: CurrentLessonStatus;
  formattedTime: string;
  stats: TimetableStats | undefined;
  dayDates: WeekDayDate[];
  lessonCounts: Record<number, number>;
  currentDayOfWeek: number | null;
};

export function TeacherTimetableSidebar({
  nextLesson,
  currentStatus,
  formattedTime,
  stats,
  dayDates,
  lessonCounts,
  currentDayOfWeek,
}: TeacherTimetableSidebarProps) {
  const hasLessons = (stats?.totalLessons ?? 0) > 0;

  return (
    <aside className="sticky top-4 z-0 space-y-4">
      <TeacherUpNextCard nextLesson={nextLesson} />
      <TeacherLiveStatusCard status={currentStatus} formattedTime={formattedTime} />
      {hasLessons ? (
        <TeacherWeekRhythmCard dayDates={dayDates} lessonCounts={lessonCounts} currentDayOfWeek={currentDayOfWeek} />
      ) : null}
      {stats && hasLessons ? <TeacherSubjectMixCard subjectDistribution={stats.subjectDistribution} /> : null}
    </aside>
  );
}
