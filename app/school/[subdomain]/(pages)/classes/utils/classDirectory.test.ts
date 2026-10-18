import { describe, expect, it } from "vitest";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import {
  buildClassDirectory,
  countGradeStudents,
  countStreamStudents,
  filterClassRows,
  visibleStreams,
  type StudentLike,
} from "./classDirectory";

const config: SchoolConfiguration = {
  id: "cfg",
  tenant: { id: "t1", schoolName: "Mirema", subdomain: "mirema" },
  selectedLevels: [
    {
      id: "level-primary",
      name: "Upper Primary",
      description: "Primary",
      subjects: [],
      gradeLevels: [
        {
          id: "g5",
          name: "Grade 5",
          age: 11,
          streams: [
            { id: "s-east", name: "East" },
            { id: "s-west", name: "West" },
          ],
        },
        { id: "g4", name: "Grade 4", age: 10, streams: [] },
      ],
    },
    {
      id: "level-jss",
      name: "Junior Secondary",
      description: "JSS",
      subjects: [],
      gradeLevels: [
        { id: "g7", name: "Grade 7", age: 13, streams: [{ id: "s-blue", name: "Blue" }] },
      ],
    },
  ],
};

const students: StudentLike[] = [
  { grade: { gradeLevel: { id: "g4" } }, streamId: null },
  { grade: { gradeLevel: { id: "g5" } }, streamId: "s-east" },
  { grade: { gradeLevel: { id: "g5" } }, streamId: "s-east" },
  { grade: { gradeLevel: { id: "g5" } }, streamId: "s-west" },
  { grade: "g7", streamId: "s-blue" },
];

describe("student counts", () => {
  it("counts the whole grade and individual streams", () => {
    expect(countGradeStudents(students, "g5")).toBe(3);
    expect(countStreamStudents(students, "g5", "s-east")).toBe(2);
    expect(countStreamStudents(students, "g5", "s-west")).toBe(1);
    expect(countGradeStudents(students, "g7")).toBe(1);
  });
});

describe("buildClassDirectory", () => {
  it("builds sorted rows grouped by level", () => {
    const directory = buildClassDirectory({
      config,
      students,
      getClassTeacher: (gradeId) => (gradeId === "g5" ? "Ms. Achieng" : null),
      getStaffing: () => ({ assigned: 3, total: 4 }),
    });

    expect(directory.rows).toHaveLength(3);
    expect(directory.rows.map((row) => row.name)).toEqual([
      "Grade 4",
      "Grade 5",
      "Grade 7",
    ]);
    expect(directory.levels.map((level) => level.name)).toEqual([
      "Upper Primary",
      "Junior Secondary",
    ]);

    const grade5 = directory.rows.find((row) => row.gradeId === "g5")!;
    expect(grade5.studentCount).toBe(3);
    expect(grade5.streamCounts).toEqual({ "s-east": 2, "s-west": 1 });
    expect(grade5.classTeacher).toBe("Ms. Achieng");
    expect(grade5.assignedSubjects).toBe(3);
    expect(grade5.totalSubjects).toBe(4);
    expect(grade5.health).toBe("partial");
    expect(grade5.displayName).toBe("Grade 5");
  });

  it("counts streams as classes and sums learners", () => {
    const directory = buildClassDirectory({ config, students });
    expect(directory.totalClasses).toBe(4); // G4, G5 East, G5 West, G7
    expect(directory.totalStudents).toBe(5);
  });

  it("handles a missing configuration", () => {
    const directory = buildClassDirectory({ config: null, students });
    expect(directory.rows).toEqual([]);
    expect(directory.levels).toEqual([]);
    expect(directory.totalClasses).toBe(0);
  });
});

describe("sidebar search", () => {
  const directory = buildClassDirectory({ config, students });
  const rows = directory.rows;

  it("matches grade names, display names, levels and streams", () => {
    expect(filterClassRows(rows, "grade 5").map((r) => r.gradeId)).toEqual(["g5"]);
    expect(filterClassRows(rows, "g4").map((r) => r.gradeId)).toEqual(["g4"]);
    expect(filterClassRows(rows, "junior").map((r) => r.gradeId)).toEqual(["g7"]);
    expect(filterClassRows(rows, "west").map((r) => r.gradeId)).toEqual(["g5"]);
    expect(filterClassRows(rows, "  ")).toHaveLength(3);
    expect(filterClassRows(rows, "nothing")).toEqual([]);
  });

  it("limits stream pills to the matching stream", () => {
    const grade5 = rows.find((row) => row.gradeId === "g5")!;
    expect(visibleStreams(grade5, "")).toHaveLength(2);
    expect(visibleStreams(grade5, "west").map((s) => s.id)).toEqual(["s-west"]);
    expect(visibleStreams(grade5, "grade").map((s) => s.id)).toEqual([
      "s-east",
      "s-west",
    ]);
  });
});
