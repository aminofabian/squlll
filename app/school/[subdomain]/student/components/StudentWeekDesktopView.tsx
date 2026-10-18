"use client";

import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import type {
  CompleteTimetable,
  TimetableLesson,
  TimetableStats,
} from "@/lib/timetable/types";
import type { UseTimetableCoreResult } from "@/lib/timetable/useTimetableCore";
import { useWeekLayout } from "@/lib/timetable/weekView/useWeekLayout";
import { getGreeting } from "@/lib/timetable/weekView/getGreeting";
import { WeekHeroBar } from "@/components/timetable/week/WeekHeroBar";
import { WeekHeroButton } from "@/components/timetable/week/WeekHeroButton";
import { WeekSidebar } from "@/components/timetable/week/WeekSidebar";
import { WeekGrid } from "@/components/timetable/week/WeekGrid";

type StudentWeekDesktopViewProps = {
  timetable: CompleteTimetable | null;
  core: UseTimetableCoreResult;
  studentName?: string;
  classLabel: string;
  termName?: string;
  emptyState: ReactNode;
  leading?: ReactNode;
  onRefresh: () => void;
  onLessonClick: (lesson: TimetableLesson, dayOfWeek: number, periodNumber: number) => void;
};

export function StudentWeekDesktopView({
  timetable,
  core,
  studentName,
  classLabel,
  termName,
  emptyState,
  leading,
  onRefresh,
  onLessonClick,
}: StudentWeekDesktopViewProps) {
  const layout = useWeekLayout(timetable, core.sortedTimeSlots, "student");
  const stats = timetable?.stats as TimetableStats | undefined;
  const totalLessons = stats?.totalLessons ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <WeekHeroBar
        eyebrow={[classLabel, termName].filter(Boolean).join(" · ")}
        greeting={getGreeting(core.currentTime.getHours(), studentName)}
        subtitle={`${core.formattedDate} · Week of ${layout.weekRangeLabel}`}
        metrics={[
          { label: "This week", value: String(totalLessons) },
          { label: "In class", value: layout.summary?.contactTimeLabel ?? "—" },
          { label: "Subjects", value: String(stats?.totalSubjects ?? 0) },
        ]}
        totalLessons={totalLessons}
        completedLessons={stats?.completedLessons ?? 0}
        completedLabel="Done"
        actions={
          <>
            {leading}
            <WeekHeroButton icon={RefreshCw} label="Refresh" onClick={onRefresh} />
          </>
        }
      />
      <div className="grid grid-cols-[minmax(0,260px)_1fr] items-start gap-3 xl:grid-cols-[minmax(0,280px)_1fr]">
        <WeekSidebar
          viewType="student"
          tints={layout.tints}
          nextLesson={core.nextLesson}
          currentStatus={core.currentStatus}
          formattedTime={core.formattedTime}
          stats={stats}
          dayDates={layout.dayDates}
          lessonCounts={layout.lessonCounts}
          currentDayOfWeek={core.currentDayOfWeek}
        />
        <div className="min-w-0">
          {timetable && totalLessons > 0 ? (
            <WeekGrid
              viewType="student"
              tints={layout.tints}
              rows={layout.rows}
              dayDates={layout.dayDates}
              lessonCounts={layout.lessonCounts}
              weekRangeLabel={layout.weekRangeLabel}
              totalLessons={totalLessons}
              completedLessons={stats?.completedLessons ?? 0}
              currentDayOfWeek={core.currentDayOfWeek}
              currentPeriodIndex={core.currentPeriodIndex}
              progressPercent={core.currentStatus.progressPercent}
              completedLessonIds={core.completedLessonIds}
              nextLesson={
                core.nextLesson
                  ? { id: core.nextLesson.lesson.id, dayOfWeek: core.nextLesson.lesson.dayOfWeek }
                  : null
              }
              onLessonClick={onLessonClick}
            />
          ) : (
            emptyState
          )}
        </div>
      </div>
    </div>
  );
}
