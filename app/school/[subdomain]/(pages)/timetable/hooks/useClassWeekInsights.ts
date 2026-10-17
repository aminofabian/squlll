import { useMemo } from "react";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";
import type { TeacherLessonAllocation } from "@/lib/types/timetable-allocation";
import type {
  Grade,
  Subject,
  Teacher,
  TimeSlot,
  TimetableEntry,
} from "@/lib/types/timetable";
import { getClassWeekPlan, type ClassWeekPlan } from "../utils/classWeekPlan";
import { getOccupiedPeriodNumbers } from "../utils/computeTimetableConflicts";
import { findSubjectRuns } from "../utils/findSubjectRuns";
import { getClassHeadsUps, type ClassHeadsUp } from "../utils/getClassHeadsUps";
import {
  entryMatchesGradeScope,
  isSameGrade,
} from "../utils/resolveGradeForSchoolConfig";
import {
  suggestNextLesson,
  type FreeClassSlot,
  type NextLessonSuggestion,
} from "../utils/suggestNextLesson";

export type ClassWeekInsights = {
  plan: ClassWeekPlan;
  suggestion: NextLessonSuggestion | null;
  headsUps: ClassHeadsUp[];
  /** Lessons that are part of a run of one subject, for the "in a row" badge. */
  runLessonIds: Set<string>;
};

type GetSlotFor = (dayIndex: number, period: number) => TimeSlot | null | undefined;

type InsightInputs = {
  gradeId: string;
  streamId: string | null;
  grades: Grade[];
  entries: TimetableEntry[];
  timeSlots: TimeSlot[];
  subjects: Subject[];
  teachers: Teacher[];
  allocations: TeacherLessonAllocation[];
  conflictLessonIds: Set<string>;
  totalSlots: number;
  daysPerWeek: number;
  dayLabels: string[];
  periodNumbers: number[];
  getSlotFor: GetSlotFor;
};

function allocationsForClass(input: InsightInputs) {
  return input.allocations.filter(
    (a) =>
      isSameGrade(a.gradeLevelId, input.gradeId, input.grades) &&
      (!a.streamId || a.streamId === input.streamId),
  );
}

function findFreeSlots(
  input: InsightInputs,
  isClassBusy: (dayOfWeek: number, period: number) => boolean,
): FreeClassSlot[] {
  const free: FreeClassSlot[] = [];
  for (let dayOfWeek = 1; dayOfWeek <= input.daysPerWeek; dayOfWeek++) {
    for (const periodNumber of input.periodNumbers) {
      const slot = input.getSlotFor(dayOfWeek - 1, periodNumber);
      if (!slot || isClassBusy(dayOfWeek, periodNumber)) continue;
      free.push({ dayOfWeek, periodNumber, timeSlotId: slot.id, startTime: slot.startTime });
    }
  }
  return free;
}

function isBookedAt(
  entries: TimetableEntry[],
  timeSlots: TimeSlot[],
  dayOfWeek: number,
  period: number,
) {
  return entries.some(
    (e) =>
      e.dayOfWeek === dayOfWeek &&
      getOccupiedPeriodNumbers(e, timeSlots).includes(period),
  );
}

function suggestFor(input: InsightInputs, plan: ClassWeekPlan, classEntries: TimetableEntry[]) {
  const freeSlots = findFreeSlots(input, (day, period) =>
    isBookedAt(classEntries, input.timeSlots, day, period),
  );
  return suggestNextLesson({
    subjects: plan.subjects,
    freeSlots,
    isTeacherBusy: (teacherId, day, period) =>
      isBookedAt(
        input.entries.filter((e) => e.teacherId === teacherId),
        input.timeSlots,
        day,
        period,
      ),
  });
}

function buildInsights(input: InsightInputs): ClassWeekInsights {
  const classEntries = input.entries.filter((e) =>
    entryMatchesGradeScope(e, input.gradeId, input.streamId, input.grades),
  );
  const subjectNames = new Map(input.subjects.map((s) => [s.id, s.name]));
  const plan = getClassWeekPlan({
    allocations: allocationsForClass(input),
    entries: classEntries,
    totalSlots: input.totalSlots,
    subjectNames,
    teacherNames: new Map(input.teachers.map((t) => [t.id, t.name])),
  });
  const runs = findSubjectRuns(
    classEntries.map((e) => ({ ...e, periods: getOccupiedPeriodNumbers(e, input.timeSlots) })),
  );
  const headsUps = getClassHeadsUps({
    subjects: plan.subjects,
    lessonsPlaced: plan.lessonsPlaced,
    runs,
    clashCount: classEntries.filter((e) => input.conflictLessonIds.has(e.id)).length,
    subjectNames,
    dayLabels: input.dayLabels,
  });
  return {
    plan,
    suggestion: suggestFor(input, plan, classEntries),
    headsUps,
    runLessonIds: new Set(runs.flatMap((r) => r.lessonIds)),
  };
}

/** Week totals, a next step and heads-ups for the class on screen. */
export function useClassWeekInsights(params: {
  allocations: TeacherLessonAllocation[];
  conflictLessonIds: Set<string>;
  totalSlots: number;
  daysPerWeek: number;
  dayLabels: string[];
  periodNumbers: number[];
  getSlotFor: GetSlotFor;
}): ClassWeekInsights | null {
  const gradeId = useTimetableStore((s) => s.selectedGradeId);
  const streamId = useTimetableStore((s) => s.selectedStreamId);
  const grades = useTimetableStore((s) => s.grades);
  const entries = useTimetableStore((s) => s.entries);
  const timeSlots = useTimetableStore((s) => s.timeSlots);
  const subjects = useTimetableStore((s) => s.subjects);
  const teachers = useTimetableStore((s) => s.teachers);

  return useMemo(
    () =>
      gradeId
        ? buildInsights({ ...params, gradeId, streamId, grades, entries, timeSlots, subjects, teachers })
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- params fields listed individually
    [gradeId, streamId, grades, entries, timeSlots, subjects, teachers, params.allocations, params.conflictLessonIds, params.totalSlots, params.daysPerWeek, params.dayLabels, params.periodNumbers, params.getSlotFor],
  );
}
