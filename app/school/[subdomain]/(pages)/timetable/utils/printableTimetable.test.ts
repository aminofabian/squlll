import { describe, expect, it } from "vitest";
import { buildPrintableTimetable, type PrintSource } from "./printableTimetable";

type Lesson = NonNullable<ReturnType<PrintSource["lessonFor"]>>;
type Break = ReturnType<PrintSource["breaksAfter"]>[number] & { afterPeriod: number };

const SLOTS: Record<number, { startTime: string; endTime: string }> = {
  1: { startTime: "08:00", endTime: "08:40" },
  2: { startTime: "08:40", endTime: "09:20" },
  3: { startTime: "09:40", endTime: "10:20" },
};

function source(lessons: Record<string, Lesson>, breaks: Break[] = []): PrintSource {
  return {
    title: "Grade 4 · Blue",
    subtitle: "Term 1",
    dayLabels: ["Mon", "Tue"],
    periodNumbers: [1, 2, 3],
    slotFor: (_day, period) => SLOTS[period] ?? null,
    lessonFor: (day, period) => lessons[`${day}:${period}`] ?? null,
    breaksAfter: (period) => breaks.filter((b) => b.afterPeriod === period),
    accentFor: () => ({ accent: "#2563eb", text: "#1e3a8a" }),
  };
}

const maths: Lesson = { subjectId: "m", subject: "Maths", teacher: "Ann", room: "4B" };

describe("buildPrintableTimetable", () => {
  it("lays out one row per period with free cells and trimmed times", () => {
    const result = buildPrintableTimetable(source({ "1:1": maths }));
    const first = result.rows[0];
    expect(first).toMatchObject({ kind: "period", start: "8:00", end: "8:40" });
    expect(first.kind === "period" && first.cells.map((c) => c.kind)).toEqual(["lesson", "free"]);
    expect(result.days).toEqual(["Mon", "Tue"]);
  });

  it("merges a double into one block covering the next period", () => {
    const result = buildPrintableTimetable(source({ "2:1": { ...maths, isDouble: true } }));
    const [p1, p2] = result.rows;
    expect(p1.kind === "period" && p1.cells[1]).toMatchObject({ kind: "lesson", rowSpan: 2, splitDouble: false });
    expect(p2.kind === "period" && p2.cells[1]).toEqual({ kind: "covered" });
  });

  it("repeats a double after a break instead of merging across it", () => {
    const lunch: Break = { name: "Break", durationMinutes: 20, applyToAllDays: true, afterPeriod: 2 };
    const result = buildPrintableTimetable(source({ "1:2": { ...maths, isDouble: true } }, [lunch]));
    const kinds = result.rows.map((r) => r.kind);
    expect(kinds).toEqual(["period", "period", "break", "period"]);
    const after = result.rows[3];
    expect(after.kind === "period" && after.cells[0]).toMatchObject({ subject: "Maths", rowSpan: 1, splitDouble: true });
  });

  it("times break rows from the period end and marks day-only breaks", () => {
    const assembly: Break = { name: "Assembly", durationMinutes: 20, dayOfWeek: 2, afterPeriod: 2 };
    const result = buildPrintableTimetable(source({}, [assembly, assembly]));
    const breakRows = result.rows.filter((r) => r.kind === "break");
    expect(breakRows).toEqual([{ kind: "break", label: "Assembly (Tue only)", start: "9:20", end: "9:40" }]);
  });
});
