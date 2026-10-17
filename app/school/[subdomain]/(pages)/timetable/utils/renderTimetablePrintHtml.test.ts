import { describe, expect, it } from "vitest";
import type { PrintableTimetable } from "./printableTimetable";
import { renderTimetablePrintHtml } from "./renderTimetablePrintHtml";

const timetable: PrintableTimetable = {
  title: "Grade 4 <Blue>",
  subtitle: "Term 1 · 2026",
  days: ["Mon", "Tue"],
  rows: [
    {
      kind: "period",
      start: "8:00",
      end: "8:40",
      cells: [
        { kind: "lesson", subject: "Maths & Logic", teacher: "Ann", room: "4B", accentHex: "#2563eb", inkHex: "#1e3a8a", rowSpan: 2, splitDouble: false },
        { kind: "free" },
      ],
    },
    { kind: "period", start: "8:40", end: "9:20", cells: [{ kind: "covered" }, { kind: "free" }] },
    { kind: "break", label: "Short break", start: "9:20", end: "9:40" },
  ],
};

describe("renderTimetablePrintHtml", () => {
  it("sets the A4 page in the chosen orientation", () => {
    expect(renderTimetablePrintHtml(timetable, "landscape", "17 Oct")).toContain("size: A4 landscape");
    expect(renderTimetablePrintHtml(timetable, "portrait", "17 Oct")).toContain("size: A4 portrait");
  });

  it("escapes text from the school's data", () => {
    const html = renderTimetablePrintHtml(timetable, "portrait", "17 Oct");
    expect(html).toContain("Grade 4 &lt;Blue&gt;");
    expect(html).toContain("Maths &amp; Logic");
    expect(html).not.toContain("<Blue>");
  });

  it("draws a double as one tall cell and skips the covered cell", () => {
    const html = renderTimetablePrintHtml(timetable, "landscape", "17 Oct");
    expect(html).toContain('rowspan="2"');
    expect(html).toContain("Room 4B · Double");
    expect(html.match(/class="free"/g)).toHaveLength(2);
  });

  it("spans break rows across every column", () => {
    const html = renderTimetablePrintHtml(timetable, "landscape", "17 Oct");
    expect(html).toContain('<td colspan="3"><span>Short break</span> 9:20–9:40</td>');
  });
});
