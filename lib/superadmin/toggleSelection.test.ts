import { describe, expect, it } from "vitest";
import { toggleSelection } from "./toggleSelection";

describe("toggleSelection", () => {
  it("adds ids without dropping ones selected on other pages", () => {
    const next = toggleSelection(new Set(["a"]), ["b", "c"], true);
    expect([...next].sort()).toEqual(["a", "b", "c"]);
  });

  it("removes only the given ids", () => {
    const next = toggleSelection(new Set(["a", "b", "c"]), ["b"], false);
    expect([...next].sort()).toEqual(["a", "c"]);
  });

  it("does not mutate the original selection", () => {
    const original = new Set(["a"]);
    toggleSelection(original, ["a"], false);
    expect(original.has("a")).toBe(true);
  });
});
