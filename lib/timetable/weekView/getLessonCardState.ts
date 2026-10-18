export type LessonCardState =
  | "cancelled"
  | "current"
  | "completed"
  | "next"
  | "scheduled";

type LessonCardFlags = {
  isCancelled: boolean;
  isCurrent: boolean;
  isCompleted: boolean;
  isNext: boolean;
};

/** Single visual state for a lesson card, in order of importance. */
export function getLessonCardState({
  isCancelled,
  isCurrent,
  isCompleted,
  isNext,
}: LessonCardFlags): LessonCardState {
  if (isCancelled) return "cancelled";
  if (isCurrent) return "current";
  if (isCompleted) return "completed";
  if (isNext) return "next";
  return "scheduled";
}
