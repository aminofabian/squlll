import type { TimetableDay, TimetableLesson } from "@/lib/timetable/types";
import {
  SUBJECT_COLOR_PALETTE,
  getLessonSubjectPalette,
} from "@/lib/timetable/constants";
import type { WeekViewerType } from "./weekViewerType";
import { getClassLabel } from "./getLessonCounterpartLabel";

export type LessonTintMode = "class" | "subject";

export type LessonTints = {
  mode: LessonTintMode;
  /** False when every lesson shares one subject, so repeating it adds nothing. */
  showSubject: boolean;
  accentFor: (lesson: TimetableLesson) => string;
};

function classKey(lesson: TimetableLesson): string {
  return `${lesson.grade.id}:${lesson.stream ?? ""}`;
}

function collectLessons(days: TimetableDay[]): TimetableLesson[] {
  return days.flatMap((day) =>
    day.cells.flatMap((cell) =>
      cell?.type === "lesson" && cell.lesson ? [cell.lesson] : [],
    ),
  );
}

function buildClassAccents(lessons: TimetableLesson[]): Map<string, string> {
  const labelsByKey = new Map(lessons.map((l) => [classKey(l), getClassLabel(l)]));
  const sortedKeys = [...labelsByKey.keys()].sort((a, b) =>
    (labelsByKey.get(a) ?? "").localeCompare(labelsByKey.get(b) ?? "", undefined, { numeric: true }),
  );
  return new Map(
    sortedKeys.map((key, index) => [
      key,
      SUBJECT_COLOR_PALETTE[index % SUBJECT_COLOR_PALETTE.length].accent,
    ]),
  );
}

/**
 * Teachers who take more classes than subjects get cards tinted by class,
 * since the class is what tells one lesson apart from the next.
 */
export function buildLessonTints(
  days: TimetableDay[],
  viewType: WeekViewerType,
): LessonTints {
  const lessons = collectLessons(days);
  const subjectCount = new Set(lessons.map((l) => l.subject.name.trim().toLowerCase())).size;
  const classCount = new Set(lessons.map(classKey)).size;
  const mode: LessonTintMode =
    viewType === "teacher" && classCount > subjectCount ? "class" : "subject";

  if (mode === "subject") {
    return {
      mode,
      showSubject: true,
      accentFor: (lesson) => getLessonSubjectPalette(lesson.subject).accent,
    };
  }

  const classAccents = buildClassAccents(lessons);
  const fallback = SUBJECT_COLOR_PALETTE[0].accent;
  return {
    mode,
    showSubject: subjectCount > 1,
    accentFor: (lesson) => classAccents.get(classKey(lesson)) ?? fallback,
  };
}
