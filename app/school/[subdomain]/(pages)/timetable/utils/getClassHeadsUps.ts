import type { ClassSubjectProgress } from "./classWeekPlan";
import type { SubjectRun } from "./findSubjectRuns";

const HEAVY_TEACHER_SHARE = 0.35;
const SUBJECTS_BEFORE_SHARING_HELPS = 2;

export type ClassHeadsUp = {
  id: string;
  title: string;
  body: string;
};

function joinNames(names: string[]) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function heavyTeacherHeadsUps(
  subjects: ClassSubjectProgress[],
  lessonsPlaced: number,
): ClassHeadsUp[] {
  const byTeacher = new Map<string, ClassSubjectProgress[]>();
  for (const row of subjects) {
    if (!row.teacherId || row.placed === 0) continue;
    byTeacher.set(row.teacherId, [...(byTeacher.get(row.teacherId) ?? []), row]);
  }
  return [...byTeacher.entries()]
    .filter(([, rows]) => rows.length >= SUBJECTS_BEFORE_SHARING_HELPS)
    .map(([teacherId, rows]) => ({ teacherId, rows, load: rows.reduce((s, r) => s + r.placed, 0) }))
    .filter(({ load }) => lessonsPlaced > 0 && load / lessonsPlaced >= HEAVY_TEACHER_SHARE)
    .map(({ teacherId, rows, load }) => ({
      id: `teacher-${teacherId}`,
      title: `${rows[0].teacherName || "One teacher"} carries ${load} of ${lessonsPlaced} lessons`,
      body: `${joinNames(rows.map((r) => r.subjectName))} all sit with one teacher. Consider sharing one subject.`,
    }));
}

function runHeadsUps(
  runs: SubjectRun[],
  subjectNames: Map<string, string>,
  dayLabels: string[],
): ClassHeadsUp[] {
  return runs.map((run) => ({
    id: `run-${run.subjectId}-${run.dayOfWeek}`,
    title: `${subjectNames.get(run.subjectId) ?? "A subject"} runs ${run.lessonIds.length} lessons in a row`,
    body: `On ${dayLabels[run.dayOfWeek - 1] ?? "one day"} students get no change of subject. Swap one lesson to another day.`,
  }));
}

/** Things worth a second look in one class's week, most serious first. */
export function getClassHeadsUps(params: {
  subjects: ClassSubjectProgress[];
  lessonsPlaced: number;
  runs: SubjectRun[];
  clashCount: number;
  subjectNames: Map<string, string>;
  dayLabels: string[];
}): ClassHeadsUp[] {
  const clashes: ClassHeadsUp[] =
    params.clashCount > 0
      ? [{
          id: "clashes",
          title: `${params.clashCount} lesson${params.clashCount === 1 ? "" : "s"} clash with another class`,
          body: "A teacher or room is booked twice at the same time. Marked in red on the grid.",
        }]
      : [];
  return [
    ...clashes,
    ...heavyTeacherHeadsUps(params.subjects, params.lessonsPlaced),
    ...runHeadsUps(params.runs, params.subjectNames, params.dayLabels),
  ];
}
