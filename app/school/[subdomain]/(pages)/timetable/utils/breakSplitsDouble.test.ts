import { describe, expect, it } from "vitest";
import { breakSplitsDouble } from "./breakSplitsDouble";

const lunch = { afterPeriod: 6, applyToAllDays: true };
const mondayAssembly = { afterPeriod: 2, dayOfWeek: 1 };

describe("breakSplitsDouble", () => {
  it("blocks the period before an every-day break", () => {
    expect(breakSplitsDouble([lunch], 3, 6)).toBe(true);
  });

  it("blocks the period before a break on that day only", () => {
    expect(breakSplitsDouble([mondayAssembly], 1, 2)).toBe(true);
    expect(breakSplitsDouble([mondayAssembly], 2, 2)).toBe(false);
  });

  it("allows periods with no break after them", () => {
    expect(breakSplitsDouble([lunch, mondayAssembly], 1, 5)).toBe(false);
  });
});
