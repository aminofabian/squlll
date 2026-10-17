import { describe, expect, it } from "vitest";
import { getAutoBuildOffer } from "./getAutoBuildOffer";

describe("getAutoBuildOffer", () => {
  it("offers nothing before the school day exists", () => {
    expect(getAutoBuildOffer({ totalSlots: 0, filledSlots: 0 })).toBeNull();
  });

  it("offers to start when the week is empty", () => {
    expect(getAutoBuildOffer({ totalSlots: 200, filledSlots: 0 })).toBe(
      "start",
    );
  });

  it("offers to finish while the week is mostly empty", () => {
    expect(getAutoBuildOffer({ totalSlots: 200, filledSlots: 30 })).toBe(
      "finish",
    );
  });

  it("stops offering once a quarter of the week is filled", () => {
    expect(getAutoBuildOffer({ totalSlots: 200, filledSlots: 50 })).toBeNull();
    expect(getAutoBuildOffer({ totalSlots: 200, filledSlots: 180 })).toBeNull();
  });
});
