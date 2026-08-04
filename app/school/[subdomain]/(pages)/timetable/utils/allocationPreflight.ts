import type {
  TeacherLessonAllocation,
  TeacherWorkloadRules,
  TimetablePreflightIssue,
  TimetablePreflightResult,
} from "@/lib/types/timetable-allocation";

export function computeLocalPreflight(params: {
  allocations: TeacherLessonAllocation[];
  rules: TeacherWorkloadRules[];
  availableSlotsPerClass: number;
  schoolDays?: number;
}): TimetablePreflightResult {
  const { allocations, rules, availableSlotsPerClass } = params;
  const schoolDays = params.schoolDays ?? 5;
  const issues: TimetablePreflightIssue[] = [];

  const totalAllocatedLessons = allocations.reduce(
    (sum, a) => sum + a.lessonsPerWeek,
    0,
  );

  if (allocations.length === 0) {
    issues.push({
      code: "NO_ALLOCATIONS",
      severity: "error",
      message: "Add teacher lesson allocations before generating.",
    });
  }

  const byTeacher = new Map<string, number>();
  for (const a of allocations) {
    byTeacher.set(
      a.teacherId,
      (byTeacher.get(a.teacherId) ?? 0) + a.lessonsPerWeek,
    );
  }

  for (const [teacherId, sum] of byTeacher) {
    const rule = rules.find((r) => r.teacherId === teacherId);
    if (
      rule?.totalLessonsPerWeek != null &&
      rule.totalLessonsPerWeek !== sum
    ) {
      issues.push({
        code: "TOTAL_MISMATCH",
        severity: "warning",
        teacherId,
        message: `Allocation sum (${sum}) does not match total lessons/week (${rule.totalLessonsPerWeek}).`,
      });
    }
    if (rule?.maxLessonsPerDay != null && sum > rule.maxLessonsPerDay * schoolDays) {
      issues.push({
        code: "MAX_DAY_OVERFLOW",
        severity: "error",
        teacherId,
        message: `Allocated ${sum} lessons exceed max ${rule.maxLessonsPerDay}/day × ${schoolDays} days.`,
      });
    }

    if (rule) {
      issues.push(...collectContradictoryRuleIssues(teacherId, rule, allocations));
    }
  }

  const demandByClass = new Map<string, number>();
  for (const a of allocations) {
    const key = `${a.gradeLevelId}:${a.streamId ?? ""}`;
    demandByClass.set(key, (demandByClass.get(key) ?? 0) + a.lessonsPerWeek);
  }
  for (const [key, demand] of demandByClass) {
    const [gradeLevelId] = key.split(":");
    if (availableSlotsPerClass > 0 && demand > availableSlotsPerClass) {
      issues.push({
        code: "CLASS_OVERCAPACITY",
        severity: "error",
        gradeLevelId,
        message: `Class needs ${demand} lessons but only ${availableSlotsPerClass} slots are available.`,
      });
    }
  }

  return {
    ok: !issues.some((i) => i.severity === "error"),
    totalAllocatedLessons,
    totalAvailableSlots: availableSlotsPerClass,
    issues,
  };
}

/** Shared contradictory-constraint warnings (client preflight). */
export function collectContradictoryRuleIssues(
  teacherId: string,
  rule: TeacherWorkloadRules,
  allocations: TeacherLessonAllocation[],
): TimetablePreflightIssue[] {
  const issues: TimetablePreflightIssue[] = [];
  const preferred = rule.preferredDays ?? [];
  const avoided = rule.avoidDays ?? [];
  const overlapDays = preferred.filter((d) => avoided.includes(d));
  if (overlapDays.length > 0) {
    issues.push({
      code: "PREFERRED_AVOID_DAY_OVERLAP",
      severity: "warning",
      teacherId,
      message: `Preferred days overlap avoid days (${overlapDays.join(", ")}).`,
    });
  }

  const prefPeriods = rule.preferredPeriodNumbers ?? [];
  const avoidPeriods = rule.avoidPeriodNumbers ?? [];
  const overlapPeriods = prefPeriods.filter((p) => avoidPeriods.includes(p));
  if (overlapPeriods.length > 0) {
    issues.push({
      code: "PREFERRED_AVOID_PERIOD_OVERLAP",
      severity: "warning",
      teacherId,
      message: `Preferred periods overlap avoid periods (P${overlapPeriods.join(", P")}).`,
    });
  }

  const teacherAllocs = allocations.filter((a) => a.teacherId === teacherId);
  const preferredDoublesSum = teacherAllocs.reduce(
    (s, a) => s + (a.preferredDoubleLessons ?? 0),
    0,
  );
  if (
    rule.doubleLessonsPerWeek != null &&
    preferredDoublesSum > rule.doubleLessonsPerWeek
  ) {
    issues.push({
      code: "DOUBLE_BUDGET_OVERFLOW",
      severity: "warning",
      teacherId,
      message: `Preferred doubles across allocations (${preferredDoublesSum}) exceed teacher double budget (${rule.doubleLessonsPerWeek}).`,
    });
  }

  return issues;
}
