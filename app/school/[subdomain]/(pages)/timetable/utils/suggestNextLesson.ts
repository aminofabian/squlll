import type { ClassSubjectProgress } from "./classWeekPlan";

export type FreeClassSlot = {
  dayOfWeek: number;
  periodNumber: number;
  timeSlotId: string;
  startTime: string;
};

export type NextLessonSuggestion = {
  subject: ClassSubjectProgress;
  remaining: number;
  /** Null when every free slot clashes with the teacher's other classes. */
  slot: FreeClassSlot | null;
};

function shortfall(row: ClassSubjectProgress) {
  return row.target == null ? 0 : row.target - row.placed;
}

/**
 * The subject furthest behind its weekly target, placed in the earliest free
 * slot where its teacher has no other class.
 */
export function suggestNextLesson(params: {
  subjects: ClassSubjectProgress[];
  freeSlots: FreeClassSlot[];
  isTeacherBusy: (teacherId: string, dayOfWeek: number, periodNumber: number) => boolean;
}): NextLessonSuggestion | null {
  const behind = params.subjects
    .filter((row) => shortfall(row) > 0)
    .sort((a, b) => shortfall(b) - shortfall(a));
  if (behind.length === 0) return null;

  const orderedSlots = [...params.freeSlots].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek || a.periodNumber - b.periodNumber,
  );

  for (const subject of behind) {
    const slot = orderedSlots.find(
      (free) => !params.isTeacherBusy(subject.teacherId, free.dayOfWeek, free.periodNumber),
    );
    if (slot) return { subject, remaining: shortfall(subject), slot };
  }
  return { subject: behind[0], remaining: shortfall(behind[0]), slot: null };
}
