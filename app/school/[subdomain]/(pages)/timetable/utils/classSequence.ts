import type { Grade } from "@/lib/types/timetable";
import { getGradeSortOrder } from "@/lib/utils/grade-display";

export type ClassStop = {
  gradeId: string;
  streamId: string | null;
  label: string;
};

export type ClassNeighbours = {
  previous: ClassStop | null;
  next: ClassStop | null;
  position: number;
  total: number;
};

function gradeLabel(grade: Grade) {
  return grade.displayName || grade.name;
}

function stopsForGrade(grade: Grade): ClassStop[] {
  const streams = grade.streams ?? [];
  if (streams.length === 0) {
    return [{ gradeId: grade.id, streamId: null, label: gradeLabel(grade) }];
  }
  return streams.map((stream) => ({
    gradeId: grade.id,
    streamId: stream.tenantStreamId,
    label: `${gradeLabel(grade)} · ${stream.name}`,
  }));
}

/** Every class and stream in sidebar order, with the ones either side of the current one. */
export function getClassNeighbours(
  grades: Grade[],
  current: { gradeId: string | null; streamId: string | null },
): ClassNeighbours {
  const stops = [...grades]
    .sort(
      (a, b) =>
        getGradeSortOrder(gradeLabel(a)) - getGradeSortOrder(gradeLabel(b)),
    )
    .flatMap(stopsForGrade);

  const index = stops.findIndex(
    (stop) =>
      stop.gradeId === current.gradeId &&
      (stop.streamId === null || stop.streamId === current.streamId),
  );
  if (index < 0) {
    return { previous: null, next: null, position: 0, total: stops.length };
  }
  return {
    previous: index > 0 ? stops[index - 1] : null,
    next: index < stops.length - 1 ? stops[index + 1] : null,
    position: index + 1,
    total: stops.length,
  };
}
