import { describe, expect, it } from "vitest";
import {
  alertSourceLabel,
  alertStatusTone,
  alertTypeLabel,
  alertTypeTone,
  formatMttr,
} from "./emergency";

describe("alertTypeLabel / tone", () => {
  it("labels every alert type", () => {
    expect(alertTypeLabel("PANIC")).toBe("Emergency (panic)");
    expect(alertTypeLabel("LONG_STOP")).toBe("Long stop");
  });

  it("escalates panic to the danger tone", () => {
    expect(alertTypeTone("PANIC")).toBe("danger");
    expect(alertTypeTone("DEVIATION")).toBe("warning");
  });
});

describe("alertStatusTone", () => {
  it("maps the lifecycle to tones", () => {
    expect(alertStatusTone("OPEN")).toBe("danger");
    expect(alertStatusTone("ACKED")).toBe("warning");
    expect(alertStatusTone("RESOLVED")).toBe("success");
  });
});

describe("alertSourceLabel", () => {
  it("distinguishes a driver alert from an auto-detected one", () => {
    expect(alertSourceLabel("DRIVER")).toBe("Driver");
    expect(alertSourceLabel("SYSTEM")).toBe("Auto-detected");
  });
});

describe("formatMttr", () => {
  it("handles missing history", () => {
    expect(formatMttr(null)).toBe("—");
    expect(formatMttr(undefined)).toBe("—");
  });

  it("formats seconds, minutes and hours", () => {
    expect(formatMttr(45)).toBe("45s");
    expect(formatMttr(90)).toBe("1m 30s");
    expect(formatMttr(7500)).toBe("2h 5m");
  });
});
