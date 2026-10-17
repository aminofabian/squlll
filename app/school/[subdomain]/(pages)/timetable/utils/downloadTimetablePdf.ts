import type { jsPDF } from "jspdf";
import type { CellHookData, CellInput, RowInput } from "jspdf-autotable";
import { mixWithWhite } from "./mixWithWhite";
import type { PrintCell, PrintLesson, PrintOrientation, PrintRow, PrintableTimetable } from "./printableTimetable";
import { getTimetablePdfLayout, type TimetablePdfLayout } from "./timetablePdfLayout";

const CARD_TINT = 0.14;
const FULL_COLOUR = 1;
const CARD_INSET_MM = 0.5;
const CARD_RADIUS_MM = 1;
const BAR_WIDTH_MM = 0.9;
const TEXT_INSET_MM = 1.8;
const FIRST_BASELINE_MM = 1.4;
const TITLE_BASELINE_MM = 6;
const SUBTITLE_BASELINE_MM = 11;
const HEADER_RULE_MM = 0.4;
const INK: [number, number, number] = [15, 23, 42];
const MUTED: [number, number, number] = [71, 85, 105];
const BREAK_FILL: [number, number, number] = [238, 244, 247];
const FREE_LINE: [number, number, number] = [203, 213, 225];
const FONT_PT = { title: 16, body: 8, small: 7 };
const FREE_DASH_MM = 1;

type LessonCellInput = CellInput & { lesson?: PrintLesson; free?: boolean };

function lessonInput(cell: PrintCell): LessonCellInput | null {
  if (cell.kind === "covered") return null;
  if (cell.kind === "free") return { content: "", free: true } as LessonCellInput;
  return { content: "", rowSpan: cell.rowSpan, lesson: cell } as LessonCellInput;
}

function bodyRows(timetable: PrintableTimetable, layout: TimetablePdfLayout): RowInput[] {
  return timetable.rows.map((row: PrintRow): RowInput => {
    if (row.kind === "break") {
      const time = row.start && row.end ? `   ${row.start}–${row.end}` : "";
      return [{
        content: `${row.label.toUpperCase()}${time}`,
        colSpan: timetable.days.length + 1,
        styles: { halign: "center", fillColor: BREAK_FILL, textColor: MUTED, fontStyle: "bold", minCellHeight: layout.breakRowHeight, fontSize: FONT_PT.small },
      }];
    }
    const time: CellInput = { content: `${row.start}\n${row.end}`, styles: { textColor: MUTED, minCellHeight: layout.periodRowHeight } };
    return [time, ...row.cells.map(lessonInput).filter((c): c is LessonCellInput => c !== null)];
  });
}

function columnWidths(timetable: PrintableTimetable, layout: TimetablePdfLayout) {
  const widths: Record<number, { cellWidth: number }> = { 0: { cellWidth: layout.timeColumnWidth } };
  timetable.days.forEach((_, dayIndex) => {
    widths[dayIndex + 1] = { cellWidth: layout.dayColumnWidth };
  });
  return widths;
}

function drawLessonCard(doc: jsPDF, data: CellHookData, lesson: PrintLesson) {
  const { x, y, width, height } = data.cell;
  const left = x + CARD_INSET_MM;
  const top = y + CARD_INSET_MM;
  const cardWidth = width - CARD_INSET_MM * 2;
  doc.setFillColor(...mixWithWhite(lesson.accentHex, CARD_TINT));
  doc.roundedRect(left, top, cardWidth, height - CARD_INSET_MM * 2, CARD_RADIUS_MM, CARD_RADIUS_MM, "F");
  doc.setFillColor(...mixWithWhite(lesson.accentHex, FULL_COLOUR));
  doc.rect(left, top, BAR_WIDTH_MM, height - CARD_INSET_MM * 2, "F");

  const textWidth = cardWidth - TEXT_INSET_MM * 2;
  doc.setFont("helvetica", "bold").setFontSize(FONT_PT.body).setTextColor(...mixWithWhite(lesson.inkHex, FULL_COLOUR));
  const subjectLines = doc.splitTextToSize(lesson.subject, textWidth) as string[];
  const firstBaseline = top + TEXT_INSET_MM + FIRST_BASELINE_MM;
  doc.text(subjectLines, left + TEXT_INSET_MM, firstBaseline);
  const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor;
  const teacherTop = firstBaseline + subjectLines.length * lineHeight;
  doc.setFont("helvetica", "normal").setFontSize(FONT_PT.small).setTextColor(...MUTED);
  const extra = lesson.rowSpan > 1 ? "Double" : lesson.splitDouble ? "Double (split)" : "";
  const details = [lesson.teacher, lesson.room ? `Room ${lesson.room}` : "", extra].filter(Boolean);
  doc.text(details.join(" · "), left + TEXT_INSET_MM, teacherTop, { maxWidth: textWidth });
}

function drawFreeCell(doc: jsPDF, data: CellHookData) {
  const { x, y, width, height } = data.cell;
  doc.setDrawColor(...FREE_LINE).setLineDashPattern([FREE_DASH_MM, FREE_DASH_MM], 0);
  doc.roundedRect(x + CARD_INSET_MM, y + CARD_INSET_MM, width - CARD_INSET_MM * 2, height - CARD_INSET_MM * 2, CARD_RADIUS_MM, CARD_RADIUS_MM, "S");
  doc.setLineDashPattern([], 0);
}

function drawTitle(doc: jsPDF, timetable: PrintableTimetable, layout: TimetablePdfLayout) {
  doc.setFont("times", "bold").setFontSize(FONT_PT.title).setTextColor(...INK);
  doc.text(timetable.title, layout.margin, layout.margin + TITLE_BASELINE_MM);
  doc.setFont("helvetica", "normal").setFontSize(FONT_PT.body).setTextColor(...MUTED);
  doc.text(timetable.subtitle, layout.margin, layout.margin + SUBTITLE_BASELINE_MM);
}

function drawFooter(doc: jsPDF, layout: TimetablePdfLayout, generatedOn: string) {
  const y = layout.pageHeight - layout.margin;
  doc.setFont("helvetica", "normal").setFontSize(FONT_PT.small).setTextColor(...MUTED);
  doc.text(`Printed ${generatedOn}`, layout.margin, y);
  doc.text("Made with SQUL", layout.pageWidth - layout.margin, y, { align: "right" });
}

/** Builds an A4 PDF of the class timetable and saves it to the user's downloads. */
export async function downloadTimetablePdf(params: {
  timetable: PrintableTimetable;
  orientation: PrintOrientation;
  generatedOn: string;
  fileName: string;
}) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const { timetable, orientation } = params;
  const layout = getTimetablePdfLayout(timetable, orientation);
  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });

  drawTitle(doc, timetable, layout);
  autoTable(doc, {
    startY: layout.tableTop,
    margin: { left: layout.margin, right: layout.margin, bottom: layout.margin },
    theme: "plain",
    head: [["", ...timetable.days]],
    body: bodyRows(timetable, layout),
    styles: { font: "helvetica", fontSize: FONT_PT.body, cellPadding: 1, valign: "top", textColor: INK },
    headStyles: { fontStyle: "bold", halign: "center", minCellHeight: layout.headerRowHeight, lineWidth: { bottom: HEADER_RULE_MM }, lineColor: INK },
    columnStyles: columnWidths(timetable, layout),
    didDrawCell: (data) => {
      if (data.section !== "body") return;
      const raw = data.cell.raw as LessonCellInput;
      if (raw?.lesson) drawLessonCard(doc, data, raw.lesson);
      if (raw?.free) drawFreeCell(doc, data);
    },
  });
  drawFooter(doc, layout, params.generatedOn);
  doc.save(params.fileName);
}
