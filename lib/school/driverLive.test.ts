import { describe, expect, it } from "vitest";
import {
  formatDistance,
  formatEta,
  formatKm,
  haversineMeters,
  shouldReport,
  MIN_REPORT_INTERVAL_MS,
} from "./driverLive";

describe("driverLive formatters", () => {
  it("formats distances as metres or kilometres", () => {
    expect(formatDistance(320)).toBe("320 m");
    expect(formatDistance(2400)).toBe("2.4 km");
    expect(formatDistance(null)).toBeNull();
    expect(formatDistance(-1)).toBeNull();
  });

  it("formats the next-pick distance in kilometres", () => {
    expect(formatKm(400)).toBe("0.4 km");
    expect(formatKm(2300)).toBe("2.3 km");
    expect(formatKm(null)).toBeNull();
  });

  it("formats ETAs", () => {
    expect(formatEta(30)).toBe("less than a minute");
    expect(formatEta(90)).toBe("about 2 min");
    expect(formatEta(420)).toBe("about 7 min");
    expect(formatEta(undefined)).toBeNull();
  });
});

describe("driverLive position throttling", () => {
  it("measures great-circle distance", () => {
    const metres = haversineMeters(
      { lat: -1.2921, lng: 36.8219 },
      { lat: -1.2921, lng: 36.8319 },
    );
    expect(metres).toBeGreaterThan(1000);
    expect(metres).toBeLessThan(1200);
  });

  it("always reports the first fix", () => {
    expect(shouldReport(null, { lat: 0, lng: 0 }, 0, 0)).toBe(true);
  });

  it("reports on the heartbeat interval regardless of movement", () => {
    const at = 1_000_000;
    expect(
      shouldReport({ lat: 0, lng: 0 }, { lat: 0, lng: 0 }, at, at + MIN_REPORT_INTERVAL_MS),
    ).toBe(true);
  });

  it("reports on meaningful movement before the interval", () => {
    const at = 1_000_000;
    // ~22 m north — beyond the movement threshold.
    expect(
      shouldReport({ lat: 0, lng: 0 }, { lat: 0.0002, lng: 0 }, at, at + 1000),
    ).toBe(true);
  });

  it("stays quiet when neither threshold is met", () => {
    const at = 1_000_000;
    // ~1 m north, well inside the interval.
    expect(
      shouldReport({ lat: 0, lng: 0 }, { lat: 0.00001, lng: 0 }, at, at + 1000),
    ).toBe(false);
  });
});
