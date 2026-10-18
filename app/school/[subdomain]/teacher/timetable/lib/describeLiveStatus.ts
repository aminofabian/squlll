import type { CurrentLessonStatus } from "@/lib/timetable/types";

export type LiveStatusTone = "live" | "break" | "calm";

export type LiveStatusDescription = {
  eyebrow: string;
  headline: string;
  detail: string;
  tone: LiveStatusTone;
  showProgress: boolean;
};

function titleCase(value: string): string {
  return value.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function minutesLeft(minutes: number): string {
  return minutes === 1 ? "1 min left" : `${minutes} min left`;
}

function describeLesson(status: CurrentLessonStatus): LiveStatusDescription {
  const lesson = status.lesson;
  const classLabel = lesson
    ? [lesson.grade.displayName || lesson.grade.name, lesson.room && `Room ${lesson.room}`]
        .filter(Boolean)
        .join(" · ")
    : "";
  return {
    eyebrow: "Teaching now",
    headline: lesson?.subject.name ?? "Lesson in progress",
    detail: [classLabel, minutesLeft(status.remainingMinutes)].filter(Boolean).join(" · "),
    tone: "live",
    showProgress: true,
  };
}

/** Copy and tone for the teacher's live status card. */
export function describeLiveStatus(
  status: CurrentLessonStatus,
): LiveStatusDescription {
  switch (status.status) {
    case "lesson":
      return describeLesson(status);
    case "break":
      return {
        eyebrow: "On break",
        headline: titleCase(status.break?.name || "Break"),
        detail: minutesLeft(status.remainingMinutes),
        tone: "break",
        showProgress: true,
      };
    case "free":
      return {
        eyebrow: "Free period",
        headline: "Time to plan or mark",
        detail: `${status.remainingMinutes} min until the next bell`,
        tone: "calm",
        showProgress: true,
      };
    case "weekend":
      return {
        eyebrow: "Weekend",
        headline: "Rest up for the week",
        detail: status.message,
        tone: "calm",
        showProgress: false,
      };
    default:
      return {
        eyebrow: "After hours",
        headline: "School is out",
        detail: status.message,
        tone: "calm",
        showProgress: false,
      };
  }
}
