/**
 * A class the teacher owns as class teacher. `id` is the tenant grade level id
 * used by every teacher-portal query (assignments, exams, marks, attendance).
 */
export type TeacherClassScope = {
  id: string;
  name: string;
  shortName?: string;
  /** Set when the class-teacher assignment is scoped to a single stream. */
  streamId?: string;
  streamName?: string;
};

export type TeacherGradeRelation = {
  id: string;
  gradeLevel?: { id: string; name: string } | null;
} | null;

export type TeacherClassAssignment = {
  id: string;
  active?: boolean;
  stream?: {
    id: string;
    stream?: { id: string; name: string } | null;
    tenantGradeLevel?: TeacherGradeRelation;
  } | null;
  gradeLevel?: TeacherGradeRelation;
};

/**
 * Classes the teacher owns as class teacher.
 *
 * Older assignments can be stream-scoped (`gradeLevel` empty), so the grade is
 * read from the stream's tenant grade level when needed.
 */
export function classTeacherClasses(
  assignments: TeacherClassAssignment[] | null | undefined,
): TeacherClassScope[] {
  const byGradeId = new Map<string, TeacherClassScope>();

  for (const assignment of assignments ?? []) {
    if (!assignment || assignment.active === false) continue;

    const stream = assignment.stream ?? null;
    const grade = assignment.gradeLevel ?? stream?.tenantGradeLevel ?? null;
    if (!grade?.id) continue;

    const existing = byGradeId.get(grade.id);
    if (existing) {
      // Prefer keeping the grade-wide class when the teacher also owns a
      // stream in it; otherwise remember the stream so the register can be
      // narrowed correctly.
      if (!existing.streamId && stream?.id) {
        existing.streamId = stream.id;
        existing.streamName = stream.stream?.name;
      }
      continue;
    }

    byGradeId.set(grade.id, {
      id: grade.id,
      name: grade.gradeLevel?.name ?? 'Class',
      streamId: stream?.id,
      streamName: stream?.stream?.name,
    });
  }

  return [...byGradeId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Grade options for teacher-portal pickers, always including owned classes. */
export function mergeTeacherGradeLevels(
  gradeLevels:
    | Array<{
        id: string;
        gradeLevel?: { id: string; name: string } | null;
        shortName?: string;
      }>
    | null
    | undefined,
  classScope: TeacherClassScope[],
): Array<{
  id: string;
  name: string;
  shortName?: string;
  baseLevelId?: string;
}> {
  const formatted = (gradeLevels ?? []).map((grade) => ({
    id: grade.id,
    name: grade.gradeLevel?.name ?? grade.shortName ?? 'Class',
    shortName: grade.shortName,
    baseLevelId: grade.gradeLevel?.id,
  }));

  // Teachers assigned as class teachers before grade sync existed (or whose
  // grade row was removed) still own a class. Include it so the portal has a
  // usable class instead of "No Assigned Grades".
  const known = new Set(formatted.map((grade) => grade.id));
  for (const scope of classScope) {
    if (known.has(scope.id)) continue;
    formatted.push({
      id: scope.id,
      name: scope.name,
      shortName: scope.shortName,
      baseLevelId: undefined,
    });
  }

  return formatted.sort((a, b) => a.name.localeCompare(b.name));
}
