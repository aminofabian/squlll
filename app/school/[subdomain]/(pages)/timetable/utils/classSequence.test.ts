import { describe, expect, it } from "vitest";
import type { Grade } from "@/lib/types/timetable";
import { getClassNeighbours } from "./classSequence";

const grades: Grade[] = [
  {
    id: "g10",
    name: "Grade 10",
    level: 10,
    streams: [
      { tenantStreamId: "s10a", name: "A" },
      { tenantStreamId: "s10b", name: "B" },
    ],
  },
  { id: "g9", name: "Grade 9", level: 9 },
  { id: "g11", name: "Grade 11", level: 11, streams: [{ tenantStreamId: "s11a", name: "A" }] },
];

describe("getClassNeighbours", () => {
  it("walks grades in order and every stream inside a grade", () => {
    const result = getClassNeighbours(grades, { gradeId: "g10", streamId: "s10a" });
    expect(result.previous?.label).toBe("Grade 9");
    expect(result.next).toEqual({ gradeId: "g10", streamId: "s10b", label: "Grade 10 · B" });
    expect(result.position).toBe(2);
    expect(result.total).toBe(4);
  });

  it("moves across to the next grade after the last stream", () => {
    const result = getClassNeighbours(grades, { gradeId: "g10", streamId: "s10b" });
    expect(result.next?.label).toBe("Grade 11 · A");
  });

  it("has nothing before the first class or after the last", () => {
    expect(getClassNeighbours(grades, { gradeId: "g9", streamId: null }).previous).toBeNull();
    expect(getClassNeighbours(grades, { gradeId: "g11", streamId: "s11a" }).next).toBeNull();
  });

  it("returns no neighbours for an unknown class", () => {
    const result = getClassNeighbours(grades, { gradeId: "missing", streamId: null });
    expect(result).toMatchObject({ previous: null, next: null, position: 0 });
  });
});
