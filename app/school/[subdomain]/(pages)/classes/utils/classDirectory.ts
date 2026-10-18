import type {
  GradeLevel,
  Level,
  SchoolConfiguration,
  Stream,
} from "@/lib/types/school-config";
import {
  abbreviateGradeShort,
  formatGradeDisplayName,
  getGradeSortOrder,
} from "@/lib/utils/grade-display";
import { classHealth, type ClassHealth } from "./classPulse";

export interface StudentLike {
  grade?: { gradeLevel?: { id?: string; name?: string } } | string;
  streamId?: string | null;
}

export interface ClassRow {
  gradeId: string;
  levelId: string;
  levelName: string;
  /** Raw grade name from the API. */
  name: string;
  displayName: string;
  streams: Stream[];
  studentCount: number;
  streamCounts: Record<string, number>;
  classTeacher: string | null;
  assignedSubjects: number;
  totalSubjects: number;
  health: ClassHealth;
}

export interface ClassDirectory {
  rows: ClassRow[];
  totalClasses: number;
  totalStudents: number;
  levels: { id: string; name: string; rows: ClassRow[] }[];
}

function studentGradeId(student: StudentLike): string | undefined {
  const grade = student?.grade;
  if (!grade) return undefined;
  if (typeof grade === "string") return grade;
  return grade.gradeLevel?.id ?? (grade as { id?: string }).id;
}

export function countGradeStudents(
  students: StudentLike[],
  gradeId: string,
): number {
  let count = 0;
  for (const student of students) {
    if (studentGradeId(student) === gradeId) count += 1;
  }
  return count;
}

export function countStreamStudents(
  students: StudentLike[],
  gradeId: string,
  streamId: string,
): number {
  let count = 0;
  for (const student of students) {
    if (studentGradeId(student) === gradeId && student.streamId === streamId) {
      count += 1;
    }
  }
  return count;
}

interface BuildArgs {
  config: SchoolConfiguration | null;
  students: StudentLike[];
  getClassTeacher?: (gradeId: string, streamId?: string | null) => string | null;
  getStaffing?: (gradeId: string) => { assigned: number; total: number };
}

/**
 * Flatten configured levels/grades into the class list used by the sidebar.
 * A “class” is a grade level plus its streams; the sidebar expands streams
 * inline once the grade is active (same pattern as the timetable sidebar).
 */
export function buildClassDirectory({
  config,
  students,
  getClassTeacher,
  getStaffing,
}: BuildArgs): ClassDirectory {
  if (!config?.selectedLevels?.length) {
    return { rows: [], totalClasses: 0, totalStudents: 0, levels: [] };
  }

  const levels: ClassDirectory["levels"] = [];
  const rows: ClassRow[] = [];

  for (const level of config.selectedLevels) {
    const levelRows = (level.gradeLevels ?? [])
      .map((grade) => buildRow(level, grade, students, getClassTeacher, getStaffing))
      .sort((a, b) => getGradeSortOrder(a.name) - getGradeSortOrder(b.name));

    if (levelRows.length === 0) continue;
    levels.push({ id: level.id, name: level.name, rows: levelRows });
    rows.push(...levelRows);
  }

  const totalStudents = rows.reduce((sum, row) => sum + row.studentCount, 0);
  const totalClasses = rows.reduce(
    (sum, row) => sum + Math.max(1, row.streams.length),
    0,
  );

  return { rows, totalClasses, totalStudents, levels };
}

function buildRow(
  level: Level,
  grade: GradeLevel,
  students: StudentLike[],
  getClassTeacher?: BuildArgs["getClassTeacher"],
  getStaffing?: BuildArgs["getStaffing"],
): ClassRow {
  const streams = grade.streams ?? [];
  const streamCounts: Record<string, number> = {};
  for (const stream of streams) {
    streamCounts[stream.id] = countStreamStudents(students, grade.id, stream.id);
  }

  const studentCount = countGradeStudents(students, grade.id);
  const staffing = getStaffing?.(grade.id) ?? { assigned: 0, total: 0 };
  const classTeacher = getClassTeacher?.(grade.id) ?? null;

  return {
    gradeId: grade.id,
    levelId: level.id,
    levelName: level.name,
    name: grade.name,
    displayName: formatGradeDisplayName(grade.name),
    streams,
    studentCount,
    streamCounts,
    classTeacher,
    assignedSubjects: staffing.assigned,
    totalSubjects: staffing.total,
    health: classHealth({
      studentCount,
      hasTeacher: Boolean(classTeacher),
      assignedSubjects: staffing.assigned,
      totalSubjects: staffing.total,
    }),
  };
}

/** Match grade name, display name, level or any stream name. */
export function filterClassRows(rows: ClassRow[], query: string): ClassRow[] {
  const term = query.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter((row) => {
    if (row.name.toLowerCase().includes(term)) return true;
    if (row.displayName.toLowerCase().includes(term)) return true;
    if (abbreviateGradeShort(row.name).toLowerCase().includes(term)) {
      return true;
    }
    if (row.levelName.toLowerCase().includes(term)) return true;
    return row.streams.some((stream) =>
      stream.name.toLowerCase().includes(term),
    );
  });
}

/** Which stream pills should stay visible for a search term. */
export function visibleStreams(row: ClassRow, query: string): Stream[] {
  const term = query.trim().toLowerCase();
  if (!term) return row.streams;
  if (
    row.name.toLowerCase().includes(term) ||
    row.displayName.toLowerCase().includes(term) ||
    abbreviateGradeShort(row.name).toLowerCase().includes(term) ||
    row.levelName.toLowerCase().includes(term)
  ) {
    return row.streams;
  }
  return row.streams.filter((stream) =>
    stream.name.toLowerCase().includes(term),
  );
}
