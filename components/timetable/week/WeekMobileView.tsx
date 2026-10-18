"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { CompleteTimetable, TimetableLesson, TimetableStats } from "@/lib/timetable/types";
import type { UseTimetableCoreResult } from "@/lib/timetable/useTimetableCore";
import type { WeekViewerType } from "@/lib/timetable/weekView/weekViewerType";
import { DAY_NAMES } from "@/lib/timetable/constants";
import { useWeekLayout } from "@/lib/timetable/weekView/useWeekLayout";
import { useGroupFocus } from "@/lib/timetable/weekView/useGroupFocus";
import { getGreeting } from "@/lib/timetable/weekView/getGreeting";
import { buildHeroMetrics } from "@/lib/timetable/weekView/buildHeroMetrics";
import { buildDayAgenda } from "@/lib/timetable/weekView/buildDayAgenda";
import { isSchoolOpen } from "@/lib/timetable/weekView/isSchoolOpen";
import { WeekMobileHeader } from "./WeekMobileHeader";
import { WeekUpNextCard } from "./WeekUpNextCard";
import { WeekLiveStatusCard } from "./WeekLiveStatusCard";
import { WeekDayStrip } from "./WeekDayStrip";
import { WeekGroupChips } from "./WeekGroupChips";
import { WeekDayAgenda } from "./WeekDayAgenda";

const MIN_GROUPS_TO_FOCUS = 2;

type WeekMobileViewProps = {
  viewType: WeekViewerType;
  timetable: CompleteTimetable | null;
  core: UseTimetableCoreResult;
  personName?: string;
  eyebrow: string;
  actions?: ReactNode;
  /** Shown under the "Up next" card, e.g. pending swap requests. */
  extra?: ReactNode;
  emptyState: ReactNode;
  showEmptyState: boolean;
  onLessonClick: (lesson: TimetableLesson, dayOfWeek: number, periodNumber: number) => void;
};

/** Phone-sized week view shared by the teacher and student timetables: one day at a time. */
export function WeekMobileView({ viewType, timetable, core, personName, eyebrow, actions, extra, emptyState, showEmptyState, onLessonClick }: WeekMobileViewProps) {
  const layout = useWeekLayout(timetable, core.sortedTimeSlots, viewType, core.currentTime);
  const stats = timetable?.stats as TimetableStats | undefined;
  const weekPhrase = layout.displayWeek.isUpcomingWeek ? "Here's your week ahead" : "This week";

  return (
    <div className="space-y-4 px-4 pb-8 pt-4">
      <WeekMobileHeader
        eyebrow={eyebrow}
        greeting={getGreeting(core.currentTime.getHours(), personName)}
        subtitle={`${core.formattedDate} · ${weekPhrase}, ${layout.weekRangeLabel}.`}
        metrics={buildHeroMetrics(viewType, stats, layout.summary)}
        actions={actions}
      />
      <WeekUpNextCard nextLesson={core.nextLesson} viewType={viewType} lessonGroups={layout.lessonGroups} timeSlots={core.sortedTimeSlots} />
      {isSchoolOpen(core.currentStatus) ? (
        <WeekLiveStatusCard status={core.currentStatus} formattedTime={core.formattedTime} viewType={viewType} />
      ) : null}
      {extra}
      {showEmptyState || !timetable ? emptyState : <MobileWeekSection viewType={viewType} core={core} layout={layout} onLessonClick={onLessonClick} />}
    </div>
  );
}

type MobileWeekSectionProps = {
  viewType: WeekViewerType;
  core: UseTimetableCoreResult;
  layout: ReturnType<typeof useWeekLayout>;
  onLessonClick: WeekMobileViewProps["onLessonClick"];
};

function MobileWeekSection({ viewType, core, layout, onLessonClick }: MobileWeekSectionProps) {
  const { displayWeek, dayDates, lessonGroups } = layout;
  const [selectedDay, setSelectedDay] = useState(displayWeek.focusDayOfWeek);
  const { focusedKey, toggleFocus } = useGroupFocus();
  const dayIndex = Math.max(0, dayDates.findIndex((d) => d.dayOfWeek === selectedDay));
  const items = useMemo(() => buildDayAgenda(layout.rows, dayIndex), [layout.rows, dayIndex]);
  const nextLesson = core.nextLesson;

  return (
    <section aria-label="Weekly timetable" className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[17px] font-bold text-[#111a16] dark:text-white">Week at a glance</h2>
        <span className="text-[12px] text-[#5b6862] dark:text-white/60">{layout.weekRangeLabel}</span>
      </div>
      <WeekDayStrip
        dayDates={dayDates}
        periodCounts={layout.periodCounts}
        selectedDay={selectedDay}
        focusDayOfWeek={displayWeek.focusDayOfWeek}
        focusLabel={displayWeek.focusLabel}
        onSelect={setSelectedDay}
      />
      {lessonGroups.groups.length >= MIN_GROUPS_TO_FOCUS ? (
        <WeekGroupChips groups={lessonGroups.groups} focusedKey={focusedKey} onToggle={toggleFocus} />
      ) : null}
      <WeekDayAgenda
        items={items}
        dayName={DAY_NAMES[selectedDay] ?? ""}
        context={{
          viewType,
          lessonGroups,
          focusedGroupKey: focusedKey,
          progressPercent: core.currentStatus.progressPercent,
          isUpcomingWeek: displayWeek.isUpcomingWeek,
          currentDayOfWeek: core.currentDayOfWeek,
          currentPeriodIndex: core.currentPeriodIndex,
          completedLessonIds: core.completedLessonIds,
          nextLesson: nextLesson ? { id: nextLesson.lesson.id, dayOfWeek: nextLesson.lesson.dayOfWeek } : null,
          onLessonClick,
        }}
      />
    </section>
  );
}
