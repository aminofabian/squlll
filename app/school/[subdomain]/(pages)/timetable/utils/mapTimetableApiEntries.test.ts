import { describe, expect, it, vi } from "vitest";
import { mapApiTimetableEntries } from "./mapTimetableApiEntries";

describe("mapApiTimetableEntries", () => {
  const mondaySlot = {
    id: "mon-p3",
    periodNumber: 3,
    time: "10:00 - 10:40",
    startTime: "10:00",
    endTime: "10:40",
    dayOfWeek: 1,
    dayTemplateId: "mon",
    color: "border-l-primary",
  };

  it("uses the entry period's day template instead of a same-numbered Monday slot", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const rows = [
      {
        id: "e1",
        subjectId: "s1",
        teacherId: "t1",
        dayTemplatePeriodId: "thu-p3",
        streamId: null,
        gradeLevelId: "g1",
        gradeLevel: { id: "g1", name: "Grade 10" },
        period: {
          id: "thu-p3",
          periodNumber: 3,
          dayTemplateId: "thu",
          dayTemplate: { dayOfWeek: 4 },
        },
        room: null,
      },
    ];

    const [entry] = mapApiTimetableEntries(rows, [], [mondaySlot]);

    expect(entry.dayOfWeek).toBe(4);
    expect(entry.timeSlotId).toBe("thu-p3");
  });

  it("never falls back to Monday when the day is unknown", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const rows = [
      {
        id: "e2",
        subjectId: "s1",
        teacherId: "t1",
        dayTemplatePeriodId: "unknown",
        gradeLevelId: "g1",
        period: { id: "unknown", periodNumber: 3 },
      },
    ];

    expect(mapApiTimetableEntries(rows, [], [mondaySlot])).toEqual([]);
  });
});
