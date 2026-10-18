"use client";

import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import type { CompleteTimetable, TimetableLesson } from "@/lib/timetable/types";
import type { UseTimetableCoreResult } from "@/lib/timetable/useTimetableCore";
import { WeekDesktopView } from "@/components/timetable/week/WeekDesktopView";
import { WeekHeroButton } from "@/components/timetable/week/WeekHeroButton";

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
  return (
    <WeekDesktopView
      viewType="student"
      timetable={timetable}
      core={core}
      personName={studentName}
      eyebrow={[classLabel, termName].filter(Boolean).join(" · ")}
      actions={
        <>
          {leading}
          <WeekHeroButton icon={RefreshCw} label="Refresh" onClick={onRefresh} />
        </>
      }
      emptyState={emptyState}
      showEmptyState={(timetable?.stats.totalLessons ?? 0) === 0}
      onLessonClick={onLessonClick}
    />
  );
}
