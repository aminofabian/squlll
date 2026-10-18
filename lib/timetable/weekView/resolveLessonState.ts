import type { TimetableLesson } from "@/lib/timetable/types";
import { getLessonCardState, type LessonCardState } from "./getLessonCardState";

export type LessonStateContext = {
  /** On weekends the view previews next week, so nothing is live or done yet. */
  isUpcomingWeek: boolean;
  currentDayOfWeek: number | null;
  currentPeriodIndex: number;
  completedLessonIds: string[];
  nextLesson: { id: string; dayOfWeek: number } | null;
};

type LessonPlacement = {
  lesson: TimetableLesson;
  dayOfWeek: number;
  slotIndex: number;
  rowSpan: number;
};

/** Visual state of a lesson card given where it sits in the week and what time it is. */
export function resolveLessonState(
  { lesson, dayOfWeek, slotIndex, rowSpan }: LessonPlacement,
  context: LessonStateContext,
): LessonCardState {
  const isLiveWeek = !context.isUpcomingWeek;
  const lastSlotIndex = slotIndex + rowSpan - 1;
  const coversCurrentPeriod = context.currentPeriodIndex >= slotIndex && context.currentPeriodIndex <= lastSlotIndex;

  return getLessonCardState({
    isCancelled: lesson.isCancelled === true,
    isCurrent: isLiveWeek && context.currentDayOfWeek === dayOfWeek && coversCurrentPeriod,
    isCompleted: isLiveWeek && context.completedLessonIds.includes(lesson.id),
    isNext: context.nextLesson?.id === lesson.id && context.nextLesson.dayOfWeek === dayOfWeek,
  });
}
