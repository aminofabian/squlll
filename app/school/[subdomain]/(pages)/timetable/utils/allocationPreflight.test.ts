import { describe, expect, it } from "vitest";
import { computeLocalPreflight } from "./allocationPreflight";
import {
  computeAllocationQuotas,
  computeWorkloadRuleBreaches,
} from "./computeAllocationQuotas";
import type { TimetableEntry } from "@/lib/types/timetable";

describe("allocationPreflight", () => {
  it("errors when there are no allocations", () => {
    const result = computeLocalPreflight({
      allocations: [],
      rules: [],
      availableSlotsPerClass: 40,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.code === "NO_ALLOCATIONS")).toBe(true);
  });

  it("warns when allocation sum mismatches totalLessonsPerWeek", () => {
    const result = computeLocalPreflight({
      allocations: [
        {
          id: "1",
          termId: "t",
          teacherId: "teach1",
          subjectId: "sub1",
          gradeLevelId: "g1",
          lessonsPerWeek: 7,
        },
      ],
      rules: [
        {
          id: "r1",
          termId: "t",
          teacherId: "teach1",
          totalLessonsPerWeek: 20,
        },
      ],
      availableSlotsPerClass: 40,
    });
    expect(result.ok).toBe(true);
    expect(result.issues.some((i) => i.code === "TOTAL_MISMATCH")).toBe(true);
  });

  it("warns when preferred and avoid days overlap", () => {
    const result = computeLocalPreflight({
      allocations: [
        {
          id: "1",
          termId: "t",
          teacherId: "teach1",
          subjectId: "sub1",
          gradeLevelId: "g1",
          lessonsPerWeek: 5,
        },
      ],
      rules: [
        {
          id: "r1",
          termId: "t",
          teacherId: "teach1",
          preferredDays: [1, 2],
          avoidDays: [2, 3],
        },
      ],
      availableSlotsPerClass: 40,
    });
    expect(
      result.issues.some((i) => i.code === "PREFERRED_AVOID_DAY_OVERLAP"),
    ).toBe(true);
  });

  it("warns when preferred doubles exceed teacher double budget", () => {
    const result = computeLocalPreflight({
      allocations: [
        {
          id: "1",
          termId: "t",
          teacherId: "teach1",
          subjectId: "sub1",
          gradeLevelId: "g1",
          lessonsPerWeek: 6,
          preferredDoubleLessons: 2,
        },
        {
          id: "2",
          termId: "t",
          teacherId: "teach1",
          subjectId: "sub1",
          gradeLevelId: "g2",
          lessonsPerWeek: 4,
          preferredDoubleLessons: 2,
        },
      ],
      rules: [
        {
          id: "r1",
          termId: "t",
          teacherId: "teach1",
          doubleLessonsPerWeek: 3,
        },
      ],
      availableSlotsPerClass: 40,
    });
    expect(result.issues.some((i) => i.code === "DOUBLE_BUDGET_OVERFLOW")).toBe(
      true,
    );
  });

  it("errors when class demand exceeds available slots", () => {
    const result = computeLocalPreflight({
      allocations: [
        {
          id: "1",
          termId: "t",
          teacherId: "teach1",
          subjectId: "sub1",
          gradeLevelId: "g1",
          lessonsPerWeek: 50,
        },
      ],
      rules: [],
      availableSlotsPerClass: 40,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.code === "CLASS_OVERCAPACITY")).toBe(
      true,
    );
  });

  it("multiplies a teacher's load by the streams they repeat a lesson for", () => {
    const result = computeLocalPreflight({
      allocations: [
        {
          id: "1",
          termId: "t",
          teacherId: "teach1",
          subjectId: "sub1",
          gradeLevelId: "g1",
          lessonsPerWeek: 6,
        },
      ],
      rules: [
        {
          id: "r1",
          termId: "t",
          teacherId: "teach1",
          maxLessonsPerDay: 4,
        },
      ],
      availableSlotsPerClass: 40,
      schoolDays: 5,
      classCountFor: () => 3,
    });
    // 6 lessons × 3 streams = 18, still inside 4/day × 5 days.
    expect(result.totalAllocatedLessons).toBe(18);
    expect(result.issues.some((i) => i.code === "MAX_DAY_OVERFLOW")).toBe(false);
    // Class demand stays 6 — each stream is its own class.
    expect(result.issues.some((i) => i.code === "CLASS_OVERCAPACITY")).toBe(
      false,
    );
  });
});

describe("computeAllocationQuotas", () => {
  const entries: TimetableEntry[] = [
    {
      id: "e1",
      gradeId: "g1",
      subjectId: "sub1",
      teacherId: "teach1",
      timeSlotId: "p1",
      dayOfWeek: 1,
      periodNumber: 1,
    },
    {
      id: "e2",
      gradeId: "g1",
      subjectId: "sub1",
      teacherId: "teach1",
      timeSlotId: "p2",
      dayOfWeek: 2,
      periodNumber: 1,
      isDoublePeriod: true,
    },
  ];

  it("reports under-fill vs required lessons", () => {
    const issues = computeAllocationQuotas({
      allocations: [
        {
          id: "a1",
          termId: "t",
          teacherId: "teach1",
          subjectId: "sub1",
          gradeLevelId: "g1",
          lessonsPerWeek: 7,
        },
      ],
      entries,
    });
    // 1 + 2 (double) = 3 placed of 7
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("under");
    expect(issues[0].placed).toBe(3);
    expect(issues[0].required).toBe(7);
  });

  it("requires a grade-wide allocation once per stream", () => {
    const issues = computeAllocationQuotas({
      allocations: [
        {
          id: "a1",
          termId: "t",
          teacherId: "teach1",
          subjectId: "sub1",
          gradeLevelId: "g1",
          lessonsPerWeek: 2,
        },
      ],
      entries: [
        { ...entries[0], streamId: "s1" },
        { ...entries[0], id: "e2", timeSlotId: "p2", streamId: "s1" },
        { ...entries[0], id: "e3", timeSlotId: "p3", streamId: "s2" },
      ],
      classCountFor: () => 2,
    });
    // 2 lessons × 2 streams = 4 required, 3 placed across both streams.
    expect(issues).toHaveLength(1);
    expect(issues[0].required).toBe(4);
    expect(issues[0].placed).toBe(3);
  });

  it("counts lessons stored under the tenant grade id", () => {
    const issues = computeAllocationQuotas({
      allocations: [
        {
          id: "a1",
          termId: "t",
          teacherId: "teach1",
          subjectId: "sub1",
          gradeLevelId: "tenant-g1",
          lessonsPerWeek: 1,
        },
      ],
      entries: [entries[0]],
      sameGrade: (a, b) =>
        a === b || [a, b].every((id) => ["g1", "tenant-g1"].includes(id)),
    });
    expect(issues).toHaveLength(0);
  });
});

describe("computeWorkloadRuleBreaches", () => {
  it("flags max lessons per day breaches", () => {
    const breaches = computeWorkloadRuleBreaches({
      rules: [
        {
          id: "r1",
          termId: "t",
          teacherId: "teach1",
          maxLessonsPerDay: 1,
        },
      ],
      entries: [
        {
          id: "e1",
          gradeId: "g1",
          subjectId: "sub1",
          teacherId: "teach1",
          timeSlotId: "p1",
          dayOfWeek: 1,
          periodNumber: 1,
        },
        {
          id: "e2",
          gradeId: "g1",
          subjectId: "sub1",
          teacherId: "teach1",
          timeSlotId: "p2",
          dayOfWeek: 1,
          periodNumber: 2,
        },
      ],
    });
    expect(breaches.some((b) => b.code === "MAX_DAY")).toBe(true);
  });

  it("flags min free periods per day breaches", () => {
    const breaches = computeWorkloadRuleBreaches({
      rules: [
        {
          id: "r1",
          termId: "t",
          teacherId: "teach1",
          minFreePeriodsPerDay: 3,
        },
      ],
      periodsPerDay: 8,
      entries: [
        {
          id: "e1",
          gradeId: "g1",
          subjectId: "sub1",
          teacherId: "teach1",
          timeSlotId: "p1",
          dayOfWeek: 1,
          periodNumber: 1,
        },
        {
          id: "e2",
          gradeId: "g1",
          subjectId: "sub1",
          teacherId: "teach1",
          timeSlotId: "p2",
          dayOfWeek: 1,
          periodNumber: 2,
          isDoublePeriod: true,
        },
        {
          id: "e3",
          gradeId: "g1",
          subjectId: "sub1",
          teacherId: "teach1",
          timeSlotId: "p4",
          dayOfWeek: 1,
          periodNumber: 4,
        },
        {
          id: "e4",
          gradeId: "g1",
          subjectId: "sub1",
          teacherId: "teach1",
          timeSlotId: "p5",
          dayOfWeek: 1,
          periodNumber: 5,
        },
        {
          id: "e5",
          gradeId: "g1",
          subjectId: "sub1",
          teacherId: "teach1",
          timeSlotId: "p6",
          dayOfWeek: 1,
          periodNumber: 6,
        },
        {
          id: "e6",
          gradeId: "g1",
          subjectId: "sub1",
          teacherId: "teach1",
          timeSlotId: "p7",
          dayOfWeek: 1,
          periodNumber: 7,
        },
      ],
    });
    // 1+2+1+1+1+1 = 7 lessons → 1 free < 3
    expect(breaches.some((b) => b.code === "MIN_FREE")).toBe(true);
  });
});
