import type { CurrentStudent } from '@/lib/hooks/useCurrentStudent';

/** e.g. "Grade 7 · East" or just stream / grade when one is missing */
export function formatStudentClassLabel(
  student: CurrentStudent | null | undefined,
): string {
  if (!student) return '—';

  const grade =
    typeof student.grade === 'string'
      ? student.grade
      : student.grade?.name ?? '';
  const stream = student.streamName?.trim();

  if (grade && stream) return `${grade} · ${stream}`;
  return grade || stream || '—';
}

export function getStudentDisplayName(
  student: CurrentStudent | null | undefined,
  fallbackName?: string,
): string {
  return student?.name?.trim() || fallbackName?.trim() || '';
}
