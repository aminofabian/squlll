import type { TimetableLesson } from "@/lib/timetable/types";
import type { WeekViewerType } from "./weekViewerType";

const LABEL_TOKEN_SEPARATOR = /[\s·\-–]+/;

function endsWithStream(label: string, stream: string): boolean {
  const lastToken = label.trim().split(LABEL_TOKEN_SEPARATOR).pop() ?? "";
  return lastToken.toLowerCase() === stream.trim().toLowerCase();
}

/** "Grade 10 · A" — appends the stream only when the grade label doesn't already end with it. */
export function getClassLabel(lesson: TimetableLesson): string {
  const gradeLabel = lesson.grade.displayName || lesson.grade.name;
  const stream = lesson.stream?.trim();
  if (!stream || endsWithStream(gradeLabel, stream)) return gradeLabel;
  return `${gradeLabel} · ${stream}`;
}

/** Who is on the other side of the lesson: the class for teachers, the teacher for students. */
export function getLessonCounterpartLabel(
  lesson: TimetableLesson,
  viewType: WeekViewerType,
): string {
  return viewType === "student" ? lesson.teacher.name : getClassLabel(lesson);
}
