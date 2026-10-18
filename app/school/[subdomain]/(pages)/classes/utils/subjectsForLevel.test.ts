import { describe, expect, it } from "vitest";
import type { Level } from "@/lib/types/school-config";
import type { TenantSubject } from "@/lib/hooks/useTenantSubjects";
import { subjectsForLevel } from "./useClassSubjectsForLevel";

function tenantSubject(overrides: Partial<TenantSubject> & { id: string }) {
  return {
    subjectType: "core",
    isCompulsory: true,
    totalMarks: 100,
    passingMarks: 50,
    creditHours: 4,
    isActive: true,
    curriculum: { id: "level-1", name: "Upper Primary" },
    subject: null,
    customSubject: null,
    ...overrides,
  } as TenantSubject;
}

function level(overrides: Partial<Level> = {}): Level {
  return {
    id: "level-1",
    name: "Upper Primary",
    description: "Primary",
    subjects: [
      {
        id: "ts-maths",
        name: "Mathematics",
        code: "MAT",
        subjectType: "core",
        category: null,
        department: null,
        shortName: null,
        isCompulsory: true,
        totalMarks: 100,
        passingMarks: 50,
        creditHours: 4,
        curriculum: "level-1",
      },
    ],
    gradeLevels: [{ id: "g4", name: "Grade 4", age: 10, streams: [] }],
    ...overrides,
  };
}

describe("subjectsForLevel", () => {
  const maths = tenantSubject({
    id: "ts-maths",
    name: "Mathematics",
    subject: {
      id: "subject-maths",
      name: "Mathematics",
      code: "MAT",
      category: null,
      department: null,
      shortName: null,
    },
  });

  it("matches on the tenant subject id", () => {
    const rows = subjectsForLevel(level(), "g4", [maths]);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("ts-maths");
    expect(rows[0].name).toBe("Mathematics");
    expect(rows[0].code).toBe("MAT");
  });

  it("keeps a renamed subject visible (rename-safe id match)", () => {
    const renamed: TenantSubject = { ...maths, name: "Mathematics & Stats" };
    const rows = subjectsForLevel(level(), "g4", [renamed]);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Mathematics & Stats");
  });

  it("prefers the tenant name over the catalog name", () => {
    const renamed: TenantSubject = {
      ...maths,
      name: "Maths (school label)",
    };
    const rows = subjectsForLevel(level(), "g4", [renamed]);
    expect(rows[0].name).toBe("Maths (school label)");
  });

  it("falls back to name/code for older level configs", () => {
    const legacy = level({
      subjects: [
        {
          ...level().subjects[0],
          id: "subject-maths", // master id, not tenant id
        },
      ],
    });
    const rows = subjectsForLevel(legacy, "g4", [maths]);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("ts-maths");
  });

  it("filters out subjects outside the curriculum", () => {
    const other = tenantSubject({
      id: "ts-robotics",
      name: "Robotics",
      subjectType: "elective",
    });
    const rows = subjectsForLevel(level(), "g4", [maths, other]);
    expect(rows.map((row) => row.name)).toEqual(["Mathematics"]);
  });

  it("returns nothing when the grade does not belong to the level", () => {
    expect(subjectsForLevel(level(), "g9", [maths])).toEqual([]);
    expect(subjectsForLevel(null, "g4", [maths])).toEqual([]);
    expect(subjectsForLevel(level(), "", [maths])).toEqual([]);
  });

  it("sorts core subjects before electives", () => {
    const art = tenantSubject({
      id: "ts-art",
      name: "Art",
      subjectType: "elective",
    });
    const lvl = level({
      subjects: [
        ...level().subjects,
        { ...level().subjects[0], id: "ts-art", name: "Art", code: "ART" },
      ],
    });
    const rows = subjectsForLevel(lvl, "g4", [art, maths]);
    expect(rows.map((row) => row.name)).toEqual(["Mathematics", "Art"]);
  });
});
