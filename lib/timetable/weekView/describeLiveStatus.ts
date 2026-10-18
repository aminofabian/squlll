import type { CurrentLessonStatus } from "@/lib/timetable/types";
import type { WeekViewerType } from "./weekViewerType";
import { getClassIdentity } from "./getClassIdentity";

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

function describeLesson(
  status: CurrentLessonStatus,
  viewType: WeekViewerType,
): LiveStatusDescription {
  const lesson = status.lesson;
  const who = !lesson
    ? undefined
    : viewType === "teacher"
      ? getClassIdentity(lesson).fullLabel
      : lesson.teacher.name;
  const classLabel = [who, lesson?.room && `Room ${lesson.room}`]
    .filter(Boolean)
    .join(" · ");
  return {
    eyebrow: viewType === "teacher" ? "Teaching now" : "In class now",
    headline: lesson?.subject.name ?? "Lesson in progress",
    detail: [classLabel, minutesLeft(status.remainingMinutes)].filter(Boolean).join(" · "),
    tone: "live",
    showProgress: true,
  };
}

/** Copy and tone for the teacher's live status card. */
export function describeLiveStatus(
  status: CurrentLessonStatus,
  viewType: WeekViewerType,
): LiveStatusDescription {
  switch (status.status) {
    case "lesson":
      return describeLesson(status, viewType);
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
        headline:
          viewType === "teacher" ? "Time to plan or mark" : "Time to revise",
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
