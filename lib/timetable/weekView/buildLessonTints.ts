import type { TimetableLesson } from "@/lib/timetable/types";
import type { LessonGroups } from "./buildLessonGroups";
import type { WeekViewerType } from "./weekViewerType";

export type LessonTints = {
  mode: LessonGroups["mode"];
  showSubject: boolean;
  accentFor: (lesson: TimetableLesson) => string;
};

/**
 * Stable per-group colours for the shared week grid. Student views lead with
 * the subject; staff views lead with the class they are meeting.
 */
export function buildLessonTints(
  groups: LessonGroups,
  viewType: WeekViewerType,
): LessonTints {
  return {
    mode: groups.mode,
    showSubject: viewType === "student" || groups.mode === "subject",
    accentFor: (lesson) => groups.groupFor(lesson).accent,
  };
}
