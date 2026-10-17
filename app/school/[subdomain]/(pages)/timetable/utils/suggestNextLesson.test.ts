import { describe, expect, it } from "vitest";
import type { ClassSubjectProgress } from "./classWeekPlan";
import { suggestNextLesson } from "./suggestNextLesson";

function row(overrides: Partial<ClassSubjectProgress>): ClassSubjectProgress {
  return {
    subjectId: "bio",
    subjectName: "Biology",
    teacherId: "t1",
    teacherName: "David Ochieng",
    placed: 3,
    target: 4,
    ...overrides,
  };
}

const friday = { dayOfWeek: 5, periodNumber: 6, timeSlotId: "fri-6", startTime: "12:05" };
const monday = { dayOfWeek: 1, periodNumber: 2, timeSlotId: "mon-2", startTime: "08:40" };

describe("suggestNextLesson", () => {
  it("returns nothing when every subject has its lessons", () => {
    expect(
      suggestNextLesson({ subjects: [row({ placed: 4 })], freeSlots: [friday], isTeacherBusy: () => false }),
    ).toBeNull();
  });

  it("picks the earliest free slot the teacher can take", () => {
    const result = suggestNextLesson({
      subjects: [row({})],
      freeSlots: [friday, monday],
      isTeacherBusy: (_, day) => day === 1,
    });
    expect(result?.slot).toEqual(friday);
    expect(result?.remaining).toBe(1);
  });

  it("starts with the subject furthest behind", () => {
    const result = suggestNextLesson({
      subjects: [row({}), row({ subjectId: "eng", subjectName: "English", placed: 1, target: 5 })],
      freeSlots: [monday],
      isTeacherBusy: () => false,
    });
    expect(result?.subject.subjectName).toBe("English");
  });

  it("still names the subject when its teacher is busy in every free slot", () => {
    const result = suggestNextLesson({
      subjects: [row({})],
      freeSlots: [monday],
      isTeacherBusy: () => true,
    });
    expect(result).toMatchObject({ slot: null, remaining: 1 });
  });
});
