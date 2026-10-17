import { describe, expect, it } from "vitest";
import { findSubjectRuns } from "./findSubjectRuns";

const lesson = (id: string, dayOfWeek: number, periods: number[], subjectId = "kis") => ({
  id,
  subjectId,
  dayOfWeek,
  periods,
});

describe("findSubjectRuns", () => {
  it("flags three lessons of one subject back to back", () => {
    const runs = findSubjectRuns([
      lesson("c", 2, [5]),
      lesson("a", 2, [3]),
      lesson("b", 2, [4]),
    ]);
    expect(runs).toEqual([{ subjectId: "kis", dayOfWeek: 2, lessonIds: ["a", "b", "c"] }]);
  });

  it("ignores two in a row, gaps and other subjects", () => {
    expect(
      findSubjectRuns([
        lesson("a", 1, [1]),
        lesson("b", 1, [2]),
        lesson("c", 1, [4]),
        lesson("d", 1, [5], "eng"),
      ]),
    ).toEqual([]);
  });

  it("counts a double as one lesson that occupies two periods", () => {
    expect(findSubjectRuns([lesson("a", 3, [1, 2]), lesson("b", 3, [3])])).toEqual([]);
    expect(
      findSubjectRuns([lesson("a", 3, [1, 2]), lesson("b", 3, [3]), lesson("c", 3, [4])]),
    ).toHaveLength(1);
  });

  it("does not join lessons across days", () => {
    expect(
      findSubjectRuns([lesson("a", 1, [9]), lesson("b", 1, [10]), lesson("c", 2, [11])]),
    ).toEqual([]);
  });
});
