import type { Subject, Teacher } from "@/lib/types/timetable";

function normalizeName(name: string): string {
  return name.toLowerCase().trim();
}

/** Subjects this teacher can teach within the current class list. */
export function subjectsForSelectedTeacher(
  teacher: Pick<Teacher, "subjectIds" | "subjects"> | undefined,
  classSubjects: Subject[],
  options?: { includeSubjectId?: string },
): Subject[] {
  if (!teacher) return [];

  const idSet = new Set(teacher.subjectIds ?? []);
  const nameSet = new Set(
    (teacher.subjects ?? []).map((name) => normalizeName(name)),
  );

  const hasAssignments = idSet.size > 0 || nameSet.size > 0;

  const matched = classSubjects.filter((subject) => {
    if (idSet.has(subject.id)) return true;
    return nameSet.has(normalizeName(subject.name));
  });

  if (!hasAssignments) {
    return options?.includeSubjectId
      ? classSubjects.filter((s) => s.id === options.includeSubjectId)
      : [];
  }

  if (
    options?.includeSubjectId &&
    !matched.some((s) => s.id === options.includeSubjectId)
  ) {
    const extra = classSubjects.find((s) => s.id === options.includeSubjectId);
    if (extra) return [...matched, extra];
  }

  return matched;
}

export function teacherTeachesSubject(
  teacher: Pick<Teacher, "subjectIds" | "subjects"> | undefined,
  subject: Pick<Subject, "id" | "name"> | undefined,
): boolean {
  if (!teacher || !subject) return false;
  if ((teacher.subjectIds ?? []).includes(subject.id)) return true;
  const key = normalizeName(subject.name);
  return (teacher.subjects ?? []).some((s) => normalizeName(s) === key);
}
