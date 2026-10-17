import { describe, expect, it } from "vitest";
import { getClassWeekPlan } from "./classWeekPlan";

const subjectNames = new Map([
  ["bio", "Biology"],
  ["eng", "English"],
  ["art", "Art"],
]);
const teacherNames = new Map([
  ["t1", "David Ochieng"],
  ["t2", "Samuel Kamau"],
]);

describe("getClassWeekPlan", () => {
  it("counts doubles as two lessons and compares against weekly targets", () => {
    const plan = getClassWeekPlan({
      allocations: [
        { subjectId: "bio", teacherId: "t1", lessonsPerWeek: 4 },
        { subjectId: "eng", teacherId: "t2", lessonsPerWeek: 2 },
      ],
      entries: [
        { subjectId: "bio", teacherId: "t1", isDoublePeriod: true },
        { subjectId: "bio", teacherId: "t1" },
        { subjectId: "eng", teacherId: "t2" },
        { subjectId: "eng", teacherId: "t2" },
      ],
      totalSlots: 6,
      subjectNames,
      teacherNames,
    });
    expect(plan.lessonsPlaced).toBe(5);
    expect(plan.lessonsTarget).toBe(6);
    expect(plan.lessonsRemaining).toBe(1);
    expect(plan.slotsFree).toBe(1);
    expect(plan.subjects[0]).toMatchObject({
      subjectName: "Biology",
      teacherName: "David Ochieng",
      placed: 3,
      target: 4,
    });
  });

  it("keeps subjects placed without a target, counting them as wanted", () => {
    const plan = getClassWeekPlan({
      allocations: [{ subjectId: "bio", teacherId: "t1", lessonsPerWeek: 1 }],
      entries: [{ subjectId: "art", teacherId: "t2" }],
      totalSlots: 10,
      subjectNames,
      teacherNames,
    });
    expect(plan.subjects.map((s) => [s.subjectName, s.target])).toEqual([
      ["Art", null],
      ["Biology", 1],
    ]);
    expect(plan.lessonsTarget).toBe(2);
  });

  it("falls back to the week's slots when no targets are set", () => {
    const plan = getClassWeekPlan({
      allocations: [],
      entries: [{ subjectId: "bio", teacherId: "t1" }],
      totalSlots: 50,
      subjectNames,
      teacherNames,
    });
    expect(plan.lessonsTarget).toBe(50);
    expect(plan.slotsFree).toBe(49);
  });
});
