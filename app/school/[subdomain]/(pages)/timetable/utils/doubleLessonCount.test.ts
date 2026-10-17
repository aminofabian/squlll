import { describe, expect, it } from "vitest";
import { lessonsAfterDoubleChange } from "./doubleLessonCount";

describe("lessonsAfterDoubleChange", () => {
  it("adds two lessons when a double is added", () => {
    expect(lessonsAfterDoubleChange(5, 0, 1)).toEqual({
      lessonsPerWeek: 7,
      doubleLessons: 1,
    });
  });

  it("gives a subject with no lessons two periods for its first double", () => {
    expect(lessonsAfterDoubleChange(0, 0, 1)).toEqual({
      lessonsPerWeek: 2,
      doubleLessons: 1,
    });
  });

  it("removes those two lessons when the double is cleared", () => {
    expect(lessonsAfterDoubleChange(7, 1, 0)).toEqual({
      lessonsPerWeek: 5,
      doubleLessons: 0,
    });
  });
});
