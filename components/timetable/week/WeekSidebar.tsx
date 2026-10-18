"use client";

import type { CurrentLessonStatus, NextLessonInfo, TimetableSlot } from "@/lib/timetable/types";
import { isSchoolOpen } from "@/lib/timetable/weekView/isSchoolOpen";
import type { LessonGroups } from "@/lib/timetable/weekView/buildLessonGroups";
import type { WeekDayDate } from "@/lib/timetable/weekView/getWeekDayDates";
import type { WeekViewerType } from "@/lib/timetable/weekView/weekViewerType";
import { WeekUpNextCard } from "./WeekUpNextCard";
import { WeekLiveStatusCard } from "./WeekLiveStatusCard";
import { WeekPeriodsPerDayCard } from "./WeekPeriodsPerDayCard";
import { WeekGroupsCard } from "./WeekGroupsCard";

const MIN_GROUPS_TO_FOCUS = 2;

type WeekSidebarProps = {
  viewType: WeekViewerType;
  nextLesson: NextLessonInfo | null;
  currentStatus: CurrentLessonStatus;
  formattedTime: string;
  timeSlots: TimetableSlot[];
  lessonGroups: LessonGroups;
  dayDates: WeekDayDate[];
  periodCounts: Record<number, number>;
  busiestDay: number | null;
  focusedGroupKey: string | null;
  onToggleGroup: (key: string) => void;
  onClearGroup: () => void;
};

export function WeekSidebar(props: WeekSidebarProps) {
  const { viewType, currentStatus, lessonGroups } = props;
  const hasLessons = lessonGroups.groups.length > 0;

  return (
    <aside className="sticky top-4 z-0 space-y-3">
      <WeekUpNextCard nextLesson={props.nextLesson} viewType={viewType} lessonGroups={lessonGroups} timeSlots={props.timeSlots} />
      {isSchoolOpen(currentStatus) ? (
        <WeekLiveStatusCard status={currentStatus} formattedTime={props.formattedTime} viewType={viewType} />
      ) : null}
      {hasLessons ? (
        <WeekPeriodsPerDayCard dayDates={props.dayDates} periodCounts={props.periodCounts} busiestDay={props.busiestDay} />
      ) : null}
      {lessonGroups.groups.length >= MIN_GROUPS_TO_FOCUS ? (
        <WeekGroupsCard
          mode={lessonGroups.mode}
          groups={lessonGroups.groups}
          focusedKey={props.focusedGroupKey}
          onToggle={props.onToggleGroup}
          onClear={props.onClearGroup}
        />
      ) : null}
    </aside>
  );
}
