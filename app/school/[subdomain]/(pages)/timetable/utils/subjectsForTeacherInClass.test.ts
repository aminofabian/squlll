import { describe, expect, it } from "vitest";
import type { Grade, Subject } from "@/lib/types/timetable";
import { subjectsForTeacherInClass } from "./subjectsForTeacherInClass";

const maths = { id: "maths", name: "Mathematical Activities" } as Subject;
const english = { id: "english", name: "English" } as Subject;
const science = { id: "science", name: "Science" } as Subject;
const classSubjects = [maths, english, science];
const grades = [{ id: "g10", tenantGradeLevelId: "tgl-10" }] as Grade[];
const scope = { gradeId: "g10", streamId: "stream-a", grades };

const patrick = { id: "patrick", subjectIds: ["maths", "english", "science"], subjects: [] };

describe("subjectsForTeacherInClass", () => {
  it("offers only the subjects allocated to the teacher in this class", () => {
    const allocations = [
      { teacherId: "patrick", subjectId: "maths", gradeLevelId: "tgl-10", streamId: null },
      { teacherId: "patrick", subjectId: "english", gradeLevelId: "g11", streamId: null },
    ];
    expect(subjectsForTeacherInClass(patrick, classSubjects, allocations, scope)).toEqual([maths]);
  });

  it("ignores allocations for another stream of the same grade", () => {
    const allocations = [
      { teacherId: "patrick", subjectId: "maths", gradeLevelId: "g10", streamId: "stream-a" },
      { teacherId: "patrick", subjectId: "science", gradeLevelId: "g10", streamId: "stream-b" },
    ];
    expect(subjectsForTeacherInClass(patrick, classSubjects, allocations, scope)).toEqual([maths]);
  });

  it("falls back to the teacher's profile subjects when nothing is allocated here", () => {
    const allocations = [{ teacherId: "someone-else", subjectId: "maths", gradeLevelId: "g10", streamId: null }];
    expect(subjectsForTeacherInClass(patrick, classSubjects, allocations, scope)).toEqual(classSubjects);
  });

  it("offers nothing until a teacher is chosen", () => {
    expect(subjectsForTeacherInClass(undefined, classSubjects, [], scope)).toEqual([]);
  });
});
