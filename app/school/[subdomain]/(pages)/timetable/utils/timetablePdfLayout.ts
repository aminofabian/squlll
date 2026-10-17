import type { PrintOrientation, PrintableTimetable } from "./printableTimetable";

const A4_MM: Record<PrintOrientation, { width: number; height: number }> = {
  portrait: { width: 210, height: 297 },
  landscape: { width: 297, height: 210 },
};
const PAGE_MARGIN_MM = 10;
const TITLE_BLOCK_MM = 16;
const FOOTER_MM = 7;
const HEADER_ROW_MM = 8;
const BREAK_ROW_MM = 5.5;
const MIN_PERIOD_ROW_MM = 8;
const MAX_PERIOD_ROW_MM = 18;
const TIME_COLUMN_MM: Record<PrintOrientation, number> = { landscape: 16, portrait: 13 };

export type TimetablePdfLayout = {
  pageWidth: number;
  pageHeight: number;
  margin: number;
  tableTop: number;
  timeColumnWidth: number;
  dayColumnWidth: number;
  headerRowHeight: number;
  periodRowHeight: number;
  breakRowHeight: number;
};

/** Row heights that make one class's week fill a single A4 page. */
export function getTimetablePdfLayout(
  timetable: PrintableTimetable,
  orientation: PrintOrientation,
): TimetablePdfLayout {
  const { width, height } = A4_MM[orientation];
  const periodRows = timetable.rows.filter((r) => r.kind === "period").length;
  const breakRows = timetable.rows.length - periodRows;
  const tableTop = PAGE_MARGIN_MM + TITLE_BLOCK_MM;
  const available =
    height - tableTop - PAGE_MARGIN_MM - FOOTER_MM - HEADER_ROW_MM - breakRows * BREAK_ROW_MM;
  const fitted = periodRows > 0 ? available / periodRows : MAX_PERIOD_ROW_MM;
  const timeColumnWidth = TIME_COLUMN_MM[orientation];
  const dayCount = Math.max(1, timetable.days.length);

  return {
    pageWidth: width,
    pageHeight: height,
    margin: PAGE_MARGIN_MM,
    tableTop,
    timeColumnWidth,
    dayColumnWidth: (width - PAGE_MARGIN_MM * 2 - timeColumnWidth) / dayCount,
    headerRowHeight: HEADER_ROW_MM,
    periodRowHeight: Math.min(MAX_PERIOD_ROW_MM, Math.max(MIN_PERIOD_ROW_MM, fitted)),
    breakRowHeight: BREAK_ROW_MM,
  };
}
