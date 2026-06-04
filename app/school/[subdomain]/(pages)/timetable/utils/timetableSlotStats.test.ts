import { describe, expect, it } from "vitest";
import { getPeriodsPerDay, slotsPerClassWeek } from "./timetableSlotStats";

describe("getPeriodsPerDay", () => {
  it("dedupes periodNumbers instead of using raw array length", () => {
    const periodsPerDay = getPeriodsPerDay({
      periodNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8],
    });
    expect(periodsPerDay).toBe(8);
  });

  it("does not treat aggregate totalPeriods-style arrays as periods per day", () => {
    const inflated = Array.from({ length: 80 }, (_, i) => i + 1);
    expect(inflated.length).toBe(80);
    expect(getPeriodsPerDay({ periodNumbers: inflated })).toBe(80);
  });

  it("prefers unique period numbers from timeSlots", () => {
    expect(
      getPeriodsPerDay({
        periodNumbers: Array.from({ length: 40 }, (_, i) => i + 1),
        timeSlots: [
          { id: "1", periodNumber: 1, time: "", color: "", startTime: "", endTime: "" },
          { id: "2", periodNumber: 2, time: "", color: "", startTime: "", endTime: "" },
          { id: "3", periodNumber: 8, time: "", color: "", startTime: "", endTime: "" },
        ],
      }),
    ).toBe(3);
  });
});

describe("slotsPerClassWeek", () => {
  it("computes periods × days", () => {
    expect(slotsPerClassWeek(8, 5)).toBe(40);
  });
});
