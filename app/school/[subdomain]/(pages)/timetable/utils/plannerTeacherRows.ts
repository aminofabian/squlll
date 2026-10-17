export type PlannerTeacherRow = {
  gradeId: string;
  gradeName: string;
  key: string;
  teacherId: string;
  subjectName: string;
  streamName: string | null;
  lessonsPerWeek: number;
  doubleLessons: number;
  /** Changed in the planner but not stored yet. */
  unsaved: boolean;
};

type PlannerClass = {
  gradeId: string;
  gradeName: string;
  unsaved: boolean;
  rows: {
    key: string;
    teacherId: string;
    subjectName: string;
    streamName?: string | null;
    lessonsPerWeek: number;
    doubleLessons: number;
  }[];
};

/** The planner's rows that have a teacher and lessons, grouped teacher by teacher. */
export function plannerTeacherRows(
  classes: PlannerClass[],
  teacherName: (teacherId: string) => string,
): PlannerTeacherRow[] {
  return classes
    .flatMap((c) =>
      c.rows
        .filter((r) => r.teacherId && r.lessonsPerWeek > 0)
        .map((r) => ({
          gradeId: c.gradeId,
          gradeName: c.gradeName,
          key: r.key,
          teacherId: r.teacherId,
          subjectName: r.subjectName,
          streamName: r.streamName ?? null,
          lessonsPerWeek: r.lessonsPerWeek,
          doubleLessons: r.doubleLessons,
          unsaved: c.unsaved,
        })),
    )
    .sort(
      (a, b) =>
        teacherName(a.teacherId).localeCompare(teacherName(b.teacherId)) ||
        a.gradeName.localeCompare(b.gradeName) ||
        a.subjectName.localeCompare(b.subjectName),
    );
}
