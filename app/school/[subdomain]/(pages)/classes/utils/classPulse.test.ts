import { describe, expect, it } from "vitest";
import {
  classHealth,
  computeClassPerformance,
  computeClassReadiness,
  computeFeeHealth,
  EMPTY_LEADERSHIP,
  initials,
  parseLeadership,
  prefectStorageKey,
  type FeeStudentLike,
  type RankingRowLike,
} from "./classPulse";

function feeStudent(
  admissionNumber: string,
  owed: number,
  paid: number,
): FeeStudentLike {
  return {
    admissionNumber,
    studentName: `Student ${admissionNumber}`,
    feeSummary: {
      totalOwed: owed,
      totalPaid: paid,
      balance: Math.max(0, owed - paid),
    },
  };
}

describe("computeFeeHealth", () => {
  const rows = [
    feeStudent("A1", 10000, 10000),
    feeStudent("A2", 10000, 4000),
    feeStudent("A3", 5000, 0),
  ];

  it("computes billed, paid, balance and collection rate", () => {
    const health = computeFeeHealth(rows);
    expect(health.studentCount).toBe(3);
    expect(health.billed).toBe(25000);
    expect(health.paid).toBe(14000);
    expect(health.balance).toBe(11000);
    expect(health.collectionRate).toBeCloseTo(0.56, 5);
    expect(health.cleared).toBe(1);
    expect(health.owing).toBe(2);
    expect(health.hasData).toBe(true);
  });

  it("scopes to the class roster", () => {
    const health = computeFeeHealth(rows, { admissions: ["A2", "A3"] });
    expect(health.studentCount).toBe(2);
    expect(health.billed).toBe(15000);
    expect(health.paid).toBe(4000);
  });

  it("sorts largest balances first", () => {
    const health = computeFeeHealth(rows, { limit: 2 });
    expect(health.topDebtors.map((d) => d.admissionNumber)).toEqual(["A2", "A3"]);
    expect(health.topDebtors[0].balance).toBe(6000);
  });

  it("handles empty and zero-billed classes", () => {
    const empty = computeFeeHealth([]);
    expect(empty.hasData).toBe(false);
    expect(empty.collectionRate).toBe(0);
    expect(empty.topDebtors).toEqual([]);

    const zero = computeFeeHealth([feeStudent("A1", 0, 0)]);
    expect(zero.collectionRate).toBe(0);
    expect(zero.hasData).toBe(false);
  });
});

function rank(
  studentId: string,
  meanPercentage: number,
  gradePosition: number,
  streamPosition: number,
  streamName?: string,
): RankingRowLike {
  return {
    studentId,
    studentName: `Learner ${studentId}`,
    admissionNumber: studentId,
    streamName,
    meanPercentage,
    overallGrade: meanPercentage >= 80 ? "A" : "B",
    gradePosition,
    streamPosition,
  };
}

describe("computeClassPerformance", () => {
  const rows = [
    rank("s1", 88, 3, 2, "East"),
    rank("s2", 74, 1, 1, "West"),
    rank("s3", 91, 2, 1, "East"),
    rank("s4", 65, 4, 3, "East"),
  ];

  it("ranks the whole grade by grade position when no stream is scoped", () => {
    const result = computeClassPerformance(rows);
    expect(result.top.map((r) => r.studentId)).toEqual(["s2", "s3", "s1", "s4"]);
    expect(result.mean).toBeCloseTo(79.5, 5);
    expect(result.best).toBe(91);
    expect(result.withResults).toBe(4);
  });

  it("scopes to a stream and uses stream positions", () => {
    const result = computeClassPerformance(rows, { streamName: "East" });
    expect(result.top.map((r) => r.studentId)).toEqual(["s3", "s1", "s4"]);
    expect(result.mean).toBeCloseTo((88 + 91 + 65) / 3, 5);
  });

  it("limits the merit list but keeps aggregate stats", () => {
    const result = computeClassPerformance(rows, { limit: 2 });
    expect(result.top).toHaveLength(2);
    expect(result.withResults).toBe(4);
  });

  it("returns null aggregates for an empty list", () => {
    const result = computeClassPerformance([]);
    expect(result.mean).toBeNull();
    expect(result.best).toBeNull();
    expect(result.top).toEqual([]);
  });

  it("breaks position ties with the higher mean", () => {
    const tied = [rank("a", 70, 1, 1), rank("b", 85, 1, 1)];
    const result = computeClassPerformance(tied);
    expect(result.top[0].studentId).toBe("b");
  });
});

describe("readiness and health", () => {
  it("scores learners, teacher and subject staffing", () => {
    expect(
      computeClassReadiness({
        studentCount: 20,
        hasTeacher: true,
        assignedSubjects: 4,
        totalSubjects: 4,
      }),
    ).toBe(100);

    expect(
      computeClassReadiness({
        studentCount: 0,
        hasTeacher: false,
        assignedSubjects: 0,
        totalSubjects: 4,
      }),
    ).toBe(0);

    expect(
      computeClassReadiness({
        studentCount: 10,
        hasTeacher: true,
        assignedSubjects: 2,
        totalSubjects: 4,
      }),
    ).toBe(83);
  });

  it("derives a health label", () => {
    expect(
      classHealth({
        studentCount: 0,
        hasTeacher: true,
        assignedSubjects: 1,
        totalSubjects: 1,
      }),
    ).toBe("empty");
    expect(
      classHealth({
        studentCount: 10,
        hasTeacher: false,
        assignedSubjects: 1,
        totalSubjects: 1,
      }),
    ).toBe("no-teacher");
    expect(
      classHealth({
        studentCount: 10,
        hasTeacher: true,
        assignedSubjects: 0,
        totalSubjects: 0,
      }),
    ).toBe("no-subjects");
    expect(
      classHealth({
        studentCount: 10,
        hasTeacher: true,
        assignedSubjects: 1,
        totalSubjects: 2,
      }),
    ).toBe("partial");
    expect(
      classHealth({
        studentCount: 10,
        hasTeacher: true,
        assignedSubjects: 2,
        totalSubjects: 2,
      }),
    ).toBe("ready");
  });
});

describe("class leadership storage", () => {
  it("builds per-class keys", () => {
    expect(prefectStorageKey("mirema", "g1", "s1")).toBe(
      "squl:class-leadership:mirema:g1:s1",
    );
    expect(prefectStorageKey("mirema", "g1", null)).toBe(
      "squl:class-leadership:mirema:g1:all",
    );
  });

  it("parses valid payloads and rejects junk", () => {
    const raw = JSON.stringify({
      prefect: { studentId: "s1", name: "Amina W.", admissionNumber: "A1" },
      deputy: null,
    });
    expect(parseLeadership(raw)).toEqual({
      prefect: { studentId: "s1", name: "Amina W.", admissionNumber: "A1" },
      deputy: null,
    });
    expect(parseLeadership("not-json")).toEqual(EMPTY_LEADERSHIP);
    expect(parseLeadership(null)).toEqual(EMPTY_LEADERSHIP);
    expect(
      parseLeadership(JSON.stringify({ prefect: { name: "No id" } })),
    ).toEqual(EMPTY_LEADERSHIP);
  });

  it("builds two-letter initials", () => {
    expect(initials("Amina Wanjiru")).toBe("AW");
    expect(initials("Brian")).toBe("BR");
    expect(initials("  ")).toBe("?");
  });
});
