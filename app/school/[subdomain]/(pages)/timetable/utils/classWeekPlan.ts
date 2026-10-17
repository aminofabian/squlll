const PERIODS_IN_A_DOUBLE = 2;

export type ClassPlanAllocation = {
  subjectId: string;
  teacherId: string;
  lessonsPerWeek: number;
};

export type ClassPlanEntry = {
  subjectId: string;
  teacherId: string;
  isDoublePeriod?: boolean;
};

export type ClassSubjectProgress = {
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  placed: number;
  /** Lessons a week the school asked for; null when nobody set a target. */
  target: number | null;
};

export type ClassWeekPlan = {
  subjects: ClassSubjectProgress[];
  lessonsPlaced: number;
  lessonsTarget: number;
  lessonsRemaining: number;
  slotsFree: number;
};

function lessonCount(entry: ClassPlanEntry) {
  return entry.isDoublePeriod ? PERIODS_IN_A_DOUBLE : 1;
}

function emptyRow(
  subjectId: string,
  teacherId: string,
  names: { subjects: Map<string, string>; teachers: Map<string, string> },
): ClassSubjectProgress {
  return {
    subjectId,
    subjectName: names.subjects.get(subjectId) ?? "Subject",
    teacherId,
    teacherName: names.teachers.get(teacherId) ?? "",
    placed: 0,
    target: null,
  };
}

/**
 * One set of numbers for a class's week, so the header, the side panel and
 * the grid never disagree about how many lessons are placed or still free.
 */
export function getClassWeekPlan(params: {
  allocations: ClassPlanAllocation[];
  entries: ClassPlanEntry[];
  totalSlots: number;
  subjectNames: Map<string, string>;
  teacherNames: Map<string, string>;
}): ClassWeekPlan {
  const names = { subjects: params.subjectNames, teachers: params.teacherNames };
  const rows = new Map<string, ClassSubjectProgress>();

  for (const alloc of params.allocations) {
    const row = rows.get(alloc.subjectId) ?? emptyRow(alloc.subjectId, alloc.teacherId, names);
    row.target = (row.target ?? 0) + alloc.lessonsPerWeek;
    rows.set(alloc.subjectId, row);
  }
  for (const entry of params.entries) {
    const row = rows.get(entry.subjectId) ?? emptyRow(entry.subjectId, entry.teacherId, names);
    row.placed += lessonCount(entry);
    rows.set(entry.subjectId, row);
  }

  const subjects = [...rows.values()].sort((a, b) =>
    a.subjectName.localeCompare(b.subjectName),
  );
  const lessonsPlaced = subjects.reduce((sum, row) => sum + row.placed, 0);
  const hasTargets = params.allocations.length > 0;
  const lessonsTarget = hasTargets
    ? subjects.reduce((sum, row) => sum + (row.target ?? row.placed), 0)
    : params.totalSlots;

  return {
    subjects,
    lessonsPlaced,
    lessonsTarget,
    lessonsRemaining: Math.max(0, lessonsTarget - lessonsPlaced),
    slotsFree: Math.max(0, params.totalSlots - lessonsPlaced),
  };
}
