import { resolveTeacherDisplayName } from "./teacher-display";

export type ClassTeacherAssignmentRow = {
  id: string;
  active?: boolean;
  stream?: {
    stream?: { id?: string; name?: string };
  } | null;
  gradeLevel?: {
    gradeLevel?: { id?: string; name?: string };
  } | null;
};

export type TeacherPickerRow = {
  id: string;
  email?: string;
  department?: string;
  isActive?: boolean;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  user?: { name?: string | null } | null;
  classTeacherAssignments?: ClassTeacherAssignmentRow[];
};

export type TeacherPickerEntry<T extends TeacherPickerRow = TeacherPickerRow> =
  T & { mergedProfileCount?: number };

function teacherPickScore(t: TeacherPickerRow): number {
  let s = 0;
  if (t.user?.name) s += 4;
  if ((t.classTeacherAssignments?.length ?? 0) > 0) s += 2;
  if (t.email?.includes("@")) s += 1;
  if (resolveTeacherDisplayName(t)) s += 1;
  return s;
}

function pickBetter<T extends TeacherPickerRow>(a: T, b: T): T {
  return teacherPickScore(b) > teacherPickScore(a) ? b : a;
}

/** Collapse duplicate invites (same email or same display name) to one picker row. */
export function dedupeTeachersForPicker<T extends TeacherPickerRow>(
  teachers: T[],
): TeacherPickerEntry<T>[] {
  const active = teachers.filter((t) => t.isActive !== false);

  const byEmail = new Map<string, { teacher: T; count: number }>();
  const noEmail: T[] = [];

  for (const teacher of active) {
    const email = teacher.email?.trim().toLowerCase();
    if (!email) {
      noEmail.push(teacher);
      continue;
    }
    const hit = byEmail.get(email);
    if (!hit) {
      byEmail.set(email, { teacher, count: 1 });
    } else {
      hit.count += 1;
      hit.teacher = pickBetter(hit.teacher, teacher);
    }
  }

  const afterEmail: TeacherPickerEntry<T>[] = [
    ...[...byEmail.values()].map(({ teacher, count }) => ({
      ...teacher,
      mergedProfileCount: count > 1 ? count : undefined,
    })),
    ...noEmail.map((t) => ({ ...t })),
  ];

  const byName = new Map<string, TeacherPickerEntry<T>>();
  const unnamed: TeacherPickerEntry<T>[] = [];

  for (const entry of afterEmail) {
    const name = resolveTeacherDisplayName(entry).toLowerCase().trim();
    if (!name || name.length < 2) {
      unnamed.push(entry);
      continue;
    }
    const hit = byName.get(name);
    if (!hit) {
      byName.set(name, { ...entry });
      continue;
    }
    const merged =
      (hit.mergedProfileCount ?? 1) + (entry.mergedProfileCount ?? 1);
    const better = pickBetter(hit, entry);
    byName.set(name, {
      ...better,
      mergedProfileCount: merged > 1 ? merged : undefined,
    });
  }

  return [...byName.values(), ...unnamed].sort((a, b) =>
    resolveTeacherDisplayName(a).localeCompare(resolveTeacherDisplayName(b)),
  );
}

/** Whether this teacher is the active class/stream teacher for the target scope. */
export function isTeacherClassTeacherForScope(
  teacher: TeacherPickerRow,
  scope: { streamId?: string; gradeLevelId?: string },
): boolean {
  const assignments = teacher.classTeacherAssignments ?? [];
  return assignments.some((a) => {
    if (a.active === false) return false;
    const catalogStreamId = a.stream?.stream?.id;
    const catalogGradeId = a.gradeLevel?.gradeLevel?.id;

    if (scope.streamId) {
      return catalogStreamId === scope.streamId;
    }
    if (scope.gradeLevelId) {
      return (
        catalogGradeId === scope.gradeLevelId &&
        !catalogStreamId
      );
    }
    return false;
  });
}

export function assignmentsForScope(
  teacher: TeacherPickerRow,
  scope: { streamId?: string; gradeLevelId?: string },
): ClassTeacherAssignmentRow[] {
  return (teacher.classTeacherAssignments ?? []).filter(
    (a) => a.active !== false && isTeacherClassTeacherForScope(
      { ...teacher, classTeacherAssignments: [a] },
      scope,
    ),
  );
}
