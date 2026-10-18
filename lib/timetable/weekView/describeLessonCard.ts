import type { TimetableLesson } from "@/lib/timetable/types";
import type { WeekViewerType } from "./weekViewerType";
import type { LessonGroup, LessonGroupMode } from "./buildLessonGroups";
import { getClassIdentity } from "./getClassIdentity";

export type LessonCardText = { title: string; detail: string };

/** Headline and supporting line for a lesson card. */
export function describeLessonCard(
  lesson: TimetableLesson,
  viewType: WeekViewerType,
  mode: LessonGroupMode,
  showSubjectOrGroup: boolean | LessonGroup,
): LessonCardText {
  const group =
    typeof showSubjectOrGroup === "boolean" ? undefined : showSubjectOrGroup;
  const showSubject =
    typeof showSubjectOrGroup === "boolean" ? showSubjectOrGroup : false;
  if (viewType === "student" || showSubject) {
    return { title: lesson.subject.name, detail: lesson.teacher.name };
  }
  if (mode === "class") {
    return {
      title: group?.shortLabel ?? getClassIdentity(lesson).shortLabel,
      detail: lesson.subject.name,
    };
  }
  return { title: lesson.subject.name, detail: getClassIdentity(lesson).shortLabel };
}
