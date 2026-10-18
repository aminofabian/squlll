import type { TimetableLesson } from "@/lib/timetable/types";
import type { WeekViewerType } from "./weekViewerType";

/** Who is on the other side of the lesson: the class for teachers, the teacher for students. */
export function getLessonCounterpartLabel(
  lesson: TimetableLesson,
  viewType: WeekViewerType,
): string {
  if (viewType === "student") return lesson.teacher.name;
  return [lesson.grade.displayName || lesson.grade.name, lesson.stream]
    .filter(Boolean)
    .join(" · ");
}
