import { feesBalancesHref } from "../../fees/lib/feesRoutes";

/** Deep link to students list filtered by grade (and optional stream). */
export function studentsClassHref(
  gradeId: string,
  options?: { streamId?: string; action?: "add" },
): string {
  const params = new URLSearchParams();
  params.set("gradeId", gradeId);
  if (options?.streamId) params.set("streamId", options.streamId);
  if (options?.action === "add") params.set("action", "add");
  return `/students?${params.toString()}`;
}

export function studentProfileHref(studentId: string): string {
  return `/students?studentId=${encodeURIComponent(studentId)}`;
}

/** Timetable for a grade/stream (page reads these query params). */
export function timetableClassHref(
  gradeId: string,
  streamId?: string | null,
): string {
  const params = new URLSearchParams();
  params.set("gradeId", gradeId);
  if (streamId) params.set("streamId", streamId);
  return `/timetable?${params.toString()}`;
}

export function feesClassHref(gradeDisplayName: string): string {
  return feesBalancesHref(gradeDisplayName);
}
