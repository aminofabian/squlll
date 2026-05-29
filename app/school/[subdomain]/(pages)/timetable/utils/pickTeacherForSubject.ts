import type { Teacher } from "@/lib/types/timetable";

/** Prefer a teacher who lists this subject; otherwise first eligible candidate. */
export function pickTeacherForSubject(
  subjectName: string | undefined,
  candidates: Teacher[],
): Teacher | undefined {
  if (candidates.length === 0) return undefined;
  if (!subjectName?.trim()) return candidates[0];

  const key = subjectName.toLowerCase().trim();
  const bySubject = candidates.find((t) =>
    (t.subjects ?? []).some((s) => s.toLowerCase().trim() === key),
  );
  if (bySubject) return bySubject;

  const partial = candidates.find((t) =>
    (t.subjects ?? []).some((s) => {
      const sub = s.toLowerCase().trim();
      return sub.includes(key) || key.includes(sub);
    }),
  );
  return partial ?? candidates[0];
}
