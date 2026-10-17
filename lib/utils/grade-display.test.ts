import { describe, expect, it } from "vitest";
import {
  abbreviateGradeShort,
  formatGradeDisplayName,
  getGradeSortOrder,
} from "./grade-display";

describe("formatGradeDisplayName", () => {
  it("keeps Baby Class distinct from PP1", () => {
    expect(formatGradeDisplayName("Baby Class")).toBe("Baby Class");
    expect(formatGradeDisplayName("PP1")).toBe("PP1");
  });

  it("keeps other pre-primary names distinct instead of collapsing them", () => {
    expect(formatGradeDisplayName("Nursery")).toBe("Nursery");
    expect(formatGradeDisplayName("Reception")).toBe("Reception");
    expect(formatGradeDisplayName("Play Group")).toBe("Play Group");
  });

  it("canonicalises explicit PP labels", () => {
    expect(formatGradeDisplayName("Pre-Primary 1")).toBe("PP1");
    expect(formatGradeDisplayName("pre primary 2")).toBe("PP2");
    expect(formatGradeDisplayName("PP3")).toBe("PP3");
  });

  it("keeps grade ordering stable for baby and PP1", () => {
    expect(getGradeSortOrder("Baby Class")).toBeLessThan(
      getGradeSortOrder("PP1"),
    );
    expect(abbreviateGradeShort("Baby Class")).toBe("PG");
  });
});
