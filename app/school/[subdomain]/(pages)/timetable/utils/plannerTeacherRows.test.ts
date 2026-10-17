import { describe, expect, it } from "vitest";
import { plannerTeacherRows } from "./plannerTeacherRows";

const names: Record<string, string> = { daniel: "Daniel Mutua", alice: "Alice Mwende" };
const teacherName = (id: string) => names[id] ?? "";

const row = (key: string, teacherId: string, subjectName: string, lessonsPerWeek: number) => ({
  key,
  teacherId,
  subjectName,
  lessonsPerWeek,
  doubleLessons: 0,
});

describe("plannerTeacherRows", () => {
  it("keeps only rows with a teacher and at least one lesson", () => {
    const result = plannerTeacherRows(
      [{ gradeId: "g10", gradeName: "Grade 10", unsaved: false, rows: [
        row("a", "daniel", "Kiswahili", 6),
        row("b", "", "Biology", 4),
        row("c", "alice", "Computer Science", 0),
      ] }],
      teacherName,
    );
    expect(result.map((r) => r.key)).toEqual(["a"]);
  });

  it("shows the planner's current numbers and marks unsaved classes", () => {
    const [kiswahili] = plannerTeacherRows(
      [{ gradeId: "g10", gradeName: "Grade 10", unsaved: true, rows: [row("a", "daniel", "Kiswahili", 6)] }],
      teacherName,
    );
    expect(kiswahili).toMatchObject({ lessonsPerWeek: 6, unsaved: true, gradeId: "g10" });
  });

  it("orders rows by teacher, then class, then subject", () => {
    const result = plannerTeacherRows(
      [
        { gradeId: "g11", gradeName: "Grade 11", unsaved: false, rows: [row("x", "daniel", "Kiswahili", 5)] },
        { gradeId: "g10", gradeName: "Grade 10", unsaved: false, rows: [
          row("y", "daniel", "Kiswahili", 6),
          row("z", "alice", "Computer Science", 4),
        ] },
      ],
      teacherName,
    );
    expect(result.map((r) => r.key)).toEqual(["z", "y", "x"]);
  });
});
