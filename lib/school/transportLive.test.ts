import { describe, expect, it } from "vitest";
import type { LiveBus } from "./transportApi";
import { upsertLiveBus } from "./transportLive";

const existing: LiveBus = {
  tripId: "t1",
  routeId: "r1",
  routeName: "Route 04",
  vehicleLabel: "Bus 04",
  lat: -1.3,
  lng: 36.8,
  updatedAt: "2026-01-05T06:00:00.000Z",
};

describe("upsertLiveBus", () => {
  it("appends a trip that is not yet shown", () => {
    const next = upsertLiveBus([], {
      tripId: "t1",
      lat: -1.29,
      lng: 36.82,
      routeName: "Route 04",
    });
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({ tripId: "t1", lat: -1.29, lng: 36.82 });
  });

  it("moves an existing trip without dropping its route/vehicle", () => {
    const next = upsertLiveBus([existing], {
      tripId: "t1",
      lat: -1.28,
      lng: 36.81,
      updatedAt: "2026-01-05T06:00:10.000Z",
    });
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({
      tripId: "t1",
      lat: -1.28,
      lng: 36.81,
      routeName: "Route 04",
      vehicleLabel: "Bus 04",
      updatedAt: "2026-01-05T06:00:10.000Z",
    });
  });

  it("does not mutate the input array", () => {
    const input = [existing];
    upsertLiveBus(input, { tripId: "t1", lat: 0, lng: 0 });
    expect(input[0].lat).toBe(-1.3);
  });
});
