import type { CurrentLessonStatus, LessonStatus } from "@/lib/timetable/types";

const SCHOOL_CLOSED_STATUSES: readonly LessonStatus[] = ["weekend", "outside"];

/** True during the school day: in a lesson, on a break or in a free period. */
export function isSchoolOpen(status: CurrentLessonStatus): boolean {
  return !SCHOOL_CLOSED_STATUSES.includes(status.status);
}
