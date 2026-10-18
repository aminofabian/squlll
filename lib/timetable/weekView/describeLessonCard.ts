import type { TimetableLesson } from "@/lib/timetable/types";
import type { WeekViewerType } from "./weekViewerType";
import type { LessonTintMode } from "./buildLessonTints";
import { getClassLabel } from "./getLessonCounterpartLabel";

export type LessonCardText = { title: string; detail: string };

/** Headline and supporting line for a lesson card, without repeating what the tint already says. */
export function describeLessonCard(
  lesson: TimetableLesson,
  viewType: WeekViewerType,
  tintMode: LessonTintMode,
  showSubject: boolean,
): LessonCardText {
  if (viewType === "student") {
    return { title: lesson.subject.name, detail: lesson.teacher.name };
  }
  if (tintMode === "class") {
    return {
      title: getClassLabel(lesson),
      detail: showSubject ? lesson.subject.name : "",
    };
  }
  return { title: lesson.subject.name, detail: getClassLabel(lesson) };
}
