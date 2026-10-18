"use client";

import type { ReactNode } from "react";
import type { CompleteTimetable, TimetableLesson, TimetableStats } from "@/lib/timetable/types";
import { buildHeroMetrics } from "@/lib/timetable/weekView/buildHeroMetrics";
import type { UseTimetableCoreResult } from "@/lib/timetable/useTimetableCore";
import type { WeekViewerType } from "@/lib/timetable/weekView/weekViewerType";
import { useWeekLayout } from "@/lib/timetable/weekView/useWeekLayout";
import { useGroupFocus } from "@/lib/timetable/weekView/useGroupFocus";
import { getGreeting } from "@/lib/timetable/weekView/getGreeting";
import { WeekHeroBar } from "./WeekHeroBar";
import { WeekSidebar } from "./WeekSidebar";
import { WeekGrid } from "./WeekGrid";

type WeekDesktopViewProps = {
  viewType: WeekViewerType;
  timetable: CompleteTimetable | null;
  core: UseTimetableCoreResult;
  personName?: string;
  eyebrow: string;
  actions?: ReactNode;
  emptyState: ReactNode;
  showEmptyState: boolean;
  onLessonClick: (lesson: TimetableLesson, dayOfWeek: number, periodNumber: number) => void;
};

/** Desktop week view shared by the teacher and student timetables: header, sidebar and grid. */
export function WeekDesktopView({ viewType, timetable, core, personName, eyebrow, actions, emptyState, showEmptyState, onLessonClick }: WeekDesktopViewProps) {
  const layout = useWeekLayout(timetable, core.sortedTimeSlots, viewType, core.currentTime);
  const { focusedKey, toggleFocus, clearFocus } = useGroupFocus();
  const stats = timetable?.stats as TimetableStats | undefined;
  const weekPhrase = layout.displayWeek.isUpcomingWeek ? "Here's your week ahead" : "This week";
  const nextLesson = core.nextLesson;

  return (
    <div className="flex flex-col gap-4">
      <WeekHeroBar
        eyebrow={eyebrow}
        greeting={getGreeting(core.currentTime.getHours(), personName)}
        subtitle={`${core.formattedDate} · ${weekPhrase}, ${layout.weekRangeLabel}.`}
        metrics={buildHeroMetrics(viewType, stats, layout.summary)}
        actions={actions}
      />
      <div className="grid grid-cols-[minmax(0,250px)_1fr] items-start gap-4 xl:grid-cols-[minmax(0,270px)_1fr]">
        <WeekSidebar
          viewType={viewType}
          nextLesson={nextLesson}
          currentStatus={core.currentStatus}
          formattedTime={core.formattedTime}
          timeSlots={core.sortedTimeSlots}
          lessonGroups={layout.lessonGroups}
          dayDates={layout.dayDates}
          periodCounts={layout.periodCounts}
          busiestDay={layout.busiestDay}
          focusedGroupKey={focusedKey}
          onToggleGroup={toggleFocus}
          onClearGroup={clearFocus}
        />
        <div className="min-w-0">
          {showEmptyState || !timetable ? (
            emptyState
          ) : (
            <WeekGrid
              viewType={viewType}
              lessonGroups={layout.lessonGroups}
              focusedGroupKey={focusedKey}
              isUpcomingWeek={layout.displayWeek.isUpcomingWeek}
              rows={layout.rows}
              dayDates={layout.dayDates}
              periodCounts={layout.periodCounts}
              busiestDay={layout.busiestDay}
              focusDayOfWeek={layout.displayWeek.focusDayOfWeek}
              focusLabel={layout.displayWeek.focusLabel}
              weekRangeLabel={layout.weekRangeLabel}
              totalLessons={stats?.totalLessons ?? 0}
              completedLessons={stats?.completedLessons ?? 0}
              currentDayOfWeek={core.currentDayOfWeek}
              currentPeriodIndex={core.currentPeriodIndex}
              progressPercent={core.currentStatus.progressPercent}
              completedLessonIds={core.completedLessonIds}
              nextLesson={nextLesson ? { id: nextLesson.lesson.id, dayOfWeek: nextLesson.lesson.dayOfWeek } : null}
              onLessonClick={onLessonClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
