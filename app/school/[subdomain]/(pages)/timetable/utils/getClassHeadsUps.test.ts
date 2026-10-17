import { describe, expect, it } from "vitest";
import type { ClassSubjectProgress } from "./classWeekPlan";
import { getClassHeadsUps } from "./getClassHeadsUps";

function row(subjectId: string, subjectName: string, teacherId: string, placed: number): ClassSubjectProgress {
  return { subjectId, subjectName, teacherId, teacherName: "Samuel Kamau", placed, target: placed };
}

const base = {
  subjectNames: new Map([["kis", "Kiswahili"]]),
  dayLabels: ["Monday", "Tuesday"],
};

describe("getClassHeadsUps", () => {
  it("warns when one teacher carries a big share across several subjects", () => {
    const [headsUp] = getClassHeadsUps({
      ...base,
      subjects: [row("eng", "English", "t2", 10), row("mat", "Maths", "t2", 10), row("bio", "Biology", "t1", 29)],
      lessonsPlaced: 49,
      runs: [],
      clashCount: 0,
    });
    expect(headsUp.title).toBe("Samuel Kamau carries 20 of 49 lessons");
    expect(headsUp.body).toContain("English and Maths");
  });

  it("does not warn about a teacher with a single subject", () => {
    expect(
      getClassHeadsUps({
        ...base,
        subjects: [row("eng", "English", "t2", 30)],
        lessonsPlaced: 40,
        runs: [],
        clashCount: 0,
      }),
    ).toEqual([]);
  });

  it("lists clashes first, then runs of one subject", () => {
    const headsUps = getClassHeadsUps({
      ...base,
      subjects: [],
      lessonsPlaced: 0,
      runs: [{ subjectId: "kis", dayOfWeek: 2, lessonIds: ["a", "b", "c"] }],
      clashCount: 2,
    });
    expect(headsUps.map((h) => h.title)).toEqual([
      "2 lessons clash with another class",
      "Kiswahili runs 3 lessons in a row",
    ]);
    expect(headsUps[1].body).toContain("Tuesday");
  });
});
