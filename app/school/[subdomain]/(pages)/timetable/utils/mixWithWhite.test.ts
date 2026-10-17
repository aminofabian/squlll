import { describe, expect, it } from "vitest";
import { mixWithWhite } from "./mixWithWhite";

describe("mixWithWhite", () => {
  it("returns the colour itself at full strength", () => {
    expect(mixWithWhite("#2563eb", 1)).toEqual([37, 99, 235]);
  });

  it("returns white at zero strength", () => {
    expect(mixWithWhite("2563eb", 0)).toEqual([255, 255, 255]);
  });

  it("blends halfway towards white", () => {
    expect(mixWithWhite("#000000", 0.5)).toEqual([128, 128, 128]);
  });

  it("falls back to slate for colours it cannot read", () => {
    expect(mixWithWhite("teal", 1)).toEqual([100, 116, 139]);
  });
});
