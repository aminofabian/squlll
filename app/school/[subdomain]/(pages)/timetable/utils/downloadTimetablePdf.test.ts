import { beforeEach, describe, expect, it, vi } from "vitest";
import { downloadTimetablePdf } from "./downloadTimetablePdf";
import type { PrintableTimetable } from "./printableTimetable";

const saved = vi.hoisted(() => [] as { name: string; pages: number; width: number }[]);

vi.mock("jspdf", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jspdf")>();
  class RecordingPdf extends actual.jsPDF {
    constructor(...args: ConstructorParameters<typeof actual.jsPDF>) {
      super(...args);
      this.save = ((name: string) => {
        saved.push({ name, pages: this.getNumberOfPages(), width: Math.round(this.internal.pageSize.getWidth()) });
        return this;
      }) as unknown as typeof this.save;
    }
  }
  return { ...actual, jsPDF: RecordingPdf };
});

const timetable: PrintableTimetable = {
  title: "Grade 4 · Blue",
  subtitle: "Term 1 · 2026 · 5 days",
  days: ["Mon", "Tue"],
  rows: [
    {
      kind: "period",
      start: "8:00",
      end: "8:40",
      cells: [
        { kind: "lesson", subject: "Mathematics", teacher: "Ann Wanjiru", room: "4B", accentHex: "#2563eb", inkHex: "#1e3a8a", rowSpan: 2, splitDouble: false },
        { kind: "free" },
      ],
    },
    { kind: "period", start: "8:40", end: "9:20", cells: [{ kind: "covered" }, { kind: "free" }] },
    { kind: "break", label: "Short break", start: "9:20", end: "9:40" },
  ],
};

describe("downloadTimetablePdf", () => {
  beforeEach(() => {
    saved.length = 0;
  });

  it.each(["landscape", "portrait"] as const)("saves a one-page A4 %s PDF", async (orientation) => {
    await downloadTimetablePdf({ timetable, orientation, generatedOn: "17 Oct 2026", fileName: "grade-4.pdf" });

    expect(saved).toEqual([{ name: "grade-4.pdf", pages: 1, width: orientation === "landscape" ? 297 : 210 }]);
  });
});
