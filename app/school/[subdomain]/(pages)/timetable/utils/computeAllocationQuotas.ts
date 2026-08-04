import type {
  AllocationQuotaIssue,
  TeacherLessonAllocation,
  TeacherWorkloadRules,
  WorkloadRuleBreach,
} from "@/lib/types/timetable-allocation";
import type { TimetableEntry } from "@/lib/types/timetable";

function entryPeriodCount(entry: TimetableEntry): number {
  return entry.isDoublePeriod ? 2 : 1;
}

export function computeAllocationQuotas(params: {
  allocations: TeacherLessonAllocation[];
  entries: TimetableEntry[];
  teacherNames?: Map<string, string>;
  subjectNames?: Map<string, string>;
  gradeNames?: Map<string, string>;
  /** Treat the two grade id forms as the same class. */
  sameGrade?: (a: string, b: string) => boolean;
  /** Classes a grade-wide allocation covers — one per stream. */
  classCountFor?: (gradeLevelId: string) => number;
}): AllocationQuotaIssue[] {
  const {
    allocations,
    entries,
    teacherNames,
    subjectNames,
    gradeNames,
  } = params;
  const sameGrade = params.sameGrade ?? ((a, b) => a === b);
  const issues: AllocationQuotaIssue[] = [];

  for (const alloc of allocations) {
    // A grade-wide allocation is taught once per stream, so it is satisfied by
    // lessons in every stream of the grade.
    const classCount = alloc.streamId
      ? 1
      : Math.max(1, params.classCountFor?.(alloc.gradeLevelId) ?? 1);
    const required = alloc.lessonsPerWeek * classCount;

    const placed = entries
      .filter(
        (e) =>
          e.teacherId === alloc.teacherId &&
          e.subjectId === alloc.subjectId &&
          sameGrade(e.gradeId, alloc.gradeLevelId) &&
          (alloc.streamId ? e.streamId === alloc.streamId : true),
      )
      .reduce((sum, e) => sum + entryPeriodCount(e), 0);

    if (placed === required) continue;

    const teacher = teacherNames?.get(alloc.teacherId) ?? "Teacher";
    const subject = subjectNames?.get(alloc.subjectId) ?? "Subject";
    const grade = gradeNames?.get(alloc.gradeLevelId) ?? "Class";
    const type = placed < required ? "under" : "over";
    issues.push({
      type,
      teacherId: alloc.teacherId,
      subjectId: alloc.subjectId,
      gradeLevelId: alloc.gradeLevelId,
      streamId: alloc.streamId,
      required,
      placed,
      message: `${teacher} · ${subject} · ${grade}: ${placed}/${required} lessons (${type}-filled)`,
    });
  }

  return issues;
}

export function computeWorkloadRuleBreaches(params: {
  rules: TeacherWorkloadRules[];
  entries: TimetableEntry[];
  teacherNames?: Map<string, string>;
  /** Teaching periods available per school day (for free-period checks). */
  periodsPerDay?: number;
}): WorkloadRuleBreach[] {
  const { rules, entries, teacherNames, periodsPerDay } = params;
  const breaches: WorkloadRuleBreach[] = [];

  for (const rule of rules) {
    const teacherEntries = entries.filter((e) => e.teacherId === rule.teacherId);
    const name = teacherNames?.get(rule.teacherId) ?? "Teacher";
    const total = teacherEntries.reduce((s, e) => s + entryPeriodCount(e), 0);

    if (
      rule.totalLessonsPerWeek != null &&
      total > rule.totalLessonsPerWeek
    ) {
      breaches.push({
        teacherId: rule.teacherId,
        code: "TOTAL_OVER",
        message: `${name} has ${total} lessons (allocation sum may exceed consistency target ${rule.totalLessonsPerWeek}/week).`,
      });
    }

    const byDay = new Map<number, number>();
    for (const e of teacherEntries) {
      byDay.set(e.dayOfWeek, (byDay.get(e.dayOfWeek) ?? 0) + entryPeriodCount(e));
    }
    if (rule.maxLessonsPerDay != null) {
      for (const [day, count] of byDay) {
        if (count > rule.maxLessonsPerDay) {
          breaches.push({
            teacherId: rule.teacherId,
            code: "MAX_DAY",
            message: `${name} has ${count} lessons on day ${day} (max ${rule.maxLessonsPerDay}).`,
          });
        }
      }
    }
    if (rule.minLessonsPerDay != null) {
      for (const [day, count] of byDay) {
        if (count > 0 && count < rule.minLessonsPerDay) {
          breaches.push({
            teacherId: rule.teacherId,
            code: "MIN_DAY",
            message: `${name} has only ${count} lessons on day ${day} (min ${rule.minLessonsPerDay}).`,
          });
        }
      }
    }

    if (
      rule.minFreePeriodsPerDay != null &&
      periodsPerDay != null &&
      periodsPerDay > 0
    ) {
      for (const [day, count] of byDay) {
        const free = periodsPerDay - count;
        if (free < rule.minFreePeriodsPerDay) {
          breaches.push({
            teacherId: rule.teacherId,
            code: "MIN_FREE",
            message: `${name} has only ${free} free period(s) on day ${day} (min ${rule.minFreePeriodsPerDay}).`,
          });
        }
      }
    }

    if (rule.unavailableSlots?.length) {
      for (const e of teacherEntries) {
        const period = e.periodNumber;
        if (period == null) continue;
        const hit = rule.unavailableSlots.some(
          (s) => s.dayOfWeek === e.dayOfWeek && s.periodNumber === period,
        );
        if (hit) {
          breaches.push({
            teacherId: rule.teacherId,
            code: "UNAVAILABLE",
            message: `${name} is scheduled on an unavailable period (day ${e.dayOfWeek}, P${period}).`,
          });
        }
      }
    }

    if (rule.maxConsecutiveLessons != null) {
      const byDayPeriods = new Map<number, number[]>();
      for (const e of teacherEntries) {
        const base = e.periodNumber;
        if (base == null) continue;
        const list = byDayPeriods.get(e.dayOfWeek) ?? [];
        list.push(base);
        if (e.isDoublePeriod) list.push(base + 1);
        byDayPeriods.set(e.dayOfWeek, list);
      }
      for (const [, periods] of byDayPeriods) {
        const sorted = [...new Set(periods)].sort((a, b) => a - b);
        let run = 1;
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i] === sorted[i - 1] + 1) {
            run += 1;
            if (run > rule.maxConsecutiveLessons) {
              breaches.push({
                teacherId: rule.teacherId,
                code: "MAX_CONSECUTIVE",
                message: `${name} has more than ${rule.maxConsecutiveLessons} consecutive lessons.`,
              });
              break;
            }
          } else {
            run = 1;
          }
        }
      }
    }
  }

  return breaches;
}
