"use client";

import type { ReactNode } from "react";
import type { CompleteTimetable, TimetableLesson, TimetableStats } from "@/lib/timetable/types";
import type { UseTimetableCoreResult } from "@/lib/timetable/useTimetableCore";
import type { WeekViewerType } from "@/lib/timetable/weekView/weekViewerType";
import type { WeekScheduleSummary } from "@/lib/timetable/weekView/summarizeWeekSchedule";
import { useWeekLayout } from "@/lib/timetable/weekView/useWeekLayout";
import { useGroupFocus } from "@/lib/timetable/weekView/useGroupFocus";
import { getGreeting } from "@/lib/timetable/weekView/getGreeting";
import { WeekHeroBar, type WeekHeroMetric } from "./WeekHeroBar";
import { WeekSidebar } from "./WeekSidebar";
import { WeekGrid } from "./WeekGrid";

const MISSING_VALUE = "—";

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

function buildHeroMetrics(
  viewType: WeekViewerType,
  stats: TimetableStats | undefined,
  summary: WeekScheduleSummary | null,
): WeekHeroMetric[] {
  const periods = { label: "Periods", value: String(stats?.totalLessons ?? 0) };
  const time = summary?.contactTimeLabel ?? MISSING_VALUE;
  if (viewType === "student") {
    return [periods, { label: "In class", value: time }, { label: "Subjects", value: String(stats?.totalSubjects ?? 0) }];
  }
  return [periods, { label: "Contact time", value: time }, { label: "Classes", value: String(summary?.distinctClasses ?? 0) }];
}

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
