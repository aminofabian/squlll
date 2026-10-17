import { describe, expect, it } from "vitest";
import type { PrintRow, PrintableTimetable } from "./printableTimetable";
import { getTimetablePdfLayout } from "./timetablePdfLayout";

function timetableWith(periods: number, breaks = 0, days = 5): PrintableTimetable {
  const period: PrintRow = { kind: "period", start: "8:00", end: "8:40", cells: [] };
  const pause: PrintRow = { kind: "break", label: "Break", start: "", end: "" };
  return {
    title: "Grade 4",
    subtitle: "",
    days: Array.from({ length: days }, (_, i) => `Day ${i + 1}`),
    rows: [...Array(periods).fill(period), ...Array(breaks).fill(pause)],
  };
}

function tableHeight(layout: ReturnType<typeof getTimetablePdfLayout>, periods: number, breaks: number) {
  return layout.headerRowHeight + periods * layout.periodRowHeight + breaks * layout.breakRowHeight;
}

describe("getTimetablePdfLayout", () => {
  it("uses the A4 page size for each orientation", () => {
    expect(getTimetablePdfLayout(timetableWith(8), "landscape")).toMatchObject({ pageWidth: 297, pageHeight: 210 });
    expect(getTimetablePdfLayout(timetableWith(8), "portrait")).toMatchObject({ pageWidth: 210, pageHeight: 297 });
  });

  it("fits a typical week on one page", () => {
    const layout = getTimetablePdfLayout(timetableWith(9, 3), "landscape");
    const bottom = layout.tableTop + tableHeight(layout, 9, 3);
    expect(bottom).toBeLessThanOrEqual(layout.pageHeight - layout.margin);
  });

  it("caps row height for short days", () => {
    expect(getTimetablePdfLayout(timetableWith(2), "portrait").periodRowHeight).toBe(18);
  });

  it("shares the width between the time column and the days", () => {
    const layout = getTimetablePdfLayout(timetableWith(8, 0, 5), "portrait");
    const used = layout.timeColumnWidth + layout.dayColumnWidth * 5;
    expect(used).toBeCloseTo(layout.pageWidth - layout.margin * 2);
  });
});
