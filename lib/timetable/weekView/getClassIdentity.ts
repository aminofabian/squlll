import type { TimetableLesson } from "@/lib/timetable/types";

const COMPACT_STREAM_MAX_LENGTH = 2;
const TRAILING_SEPARATORS = /[\s·\-–]+$/;

export type ClassIdentity = {
  key: string;
  /** "Grade 10A" */
  fullLabel: string;
  /** "10A" */
  shortLabel: string;
  /** "A" */
  badge: string;
};

function stripTrailingStream(label: string, stream: string): string {
  const trimmed = label.trim();
  if (!stream || !trimmed.toLowerCase().endsWith(stream.toLowerCase())) return trimmed;
  return trimmed.slice(0, -stream.length).replace(TRAILING_SEPARATORS, "");
}

function joinStream(base: string, stream: string): string {
  if (!stream) return base;
  return stream.length <= COMPACT_STREAM_MAX_LENGTH ? `${base}${stream}` : `${base} ${stream}`;
}

/** How a class is named across the week view, without repeating the stream. */
export function getClassIdentity(lesson: TimetableLesson): ClassIdentity {
  const stream = lesson.stream?.trim() ?? "";
  const base = stripTrailingStream(lesson.grade.name || lesson.grade.displayName, stream);
  const gradeNumber = base.match(/\d+/)?.[0];
  const fullLabel = joinStream(base, stream);

  return {
    key: `${lesson.grade.id}:${stream}`,
    fullLabel,
    shortLabel: gradeNumber ? joinStream(gradeNumber, stream) : fullLabel,
    badge: (stream || gradeNumber || base).charAt(0).toUpperCase(),
  };
}
