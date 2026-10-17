import { mixWithWhite } from "./mixWithWhite";
import type {
  PrintCell,
  PrintOrientation,
  PrintRow,
  PrintableTimetable,
} from "./printableTimetable";

const CARD_TINT = 0.14;
const FULL_COLOUR = 1;
const FONT_PT: Record<PrintOrientation, number> = { landscape: 9, portrait: 8 };
const TIME_COLUMN_WIDTH: Record<PrintOrientation, string> = { landscape: "16mm", portrait: "13mm" };

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rgb([r, g, b]: [number, number, number]) {
  return `rgb(${r}, ${g}, ${b})`;
}

function cellHtml(cell: PrintCell) {
  if (cell.kind === "covered") return "";
  if (cell.kind === "free") return `<td class="free"></td>`;
  const tint = rgb(mixWithWhite(cell.accentHex, CARD_TINT));
  const bar = rgb(mixWithWhite(cell.accentHex, FULL_COLOUR));
  const ink = rgb(mixWithWhite(cell.inkHex, FULL_COLOUR));
  const extras = [cell.room ? `Room ${escapeHtml(cell.room)}` : "", cell.rowSpan > 1 ? "Double" : cell.splitDouble ? "Double (split)" : ""]
    .filter(Boolean)
    .join(" · ");
  return `<td rowspan="${cell.rowSpan}"><div class="card" style="background:${tint};border-left-color:${bar}">`
    + `<div class="subject" style="color:${ink}">${escapeHtml(cell.subject)}</div>`
    + `<div class="teacher">${escapeHtml(cell.teacher)}</div>`
    + (extras ? `<div class="extra">${extras}</div>` : "")
    + `</div></td>`;
}

function rowHtml(row: PrintRow, dayCount: number) {
  if (row.kind === "break") {
    const time = row.start && row.end ? `${row.start}–${row.end}` : "";
    return `<tr class="break"><td colspan="${dayCount + 1}"><span>${escapeHtml(row.label)}</span> ${time}</td></tr>`;
  }
  const time = `<th class="time"><b>${escapeHtml(row.start)}</b><br>${escapeHtml(row.end)}</th>`;
  return `<tr>${time}${row.cells.map(cellHtml).join("")}</tr>`;
}

function styles(orientation: PrintOrientation) {
  return `
    @page { size: A4 ${orientation}; margin: 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: ${FONT_PT[orientation]}pt; color: #0f172a; }
    header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4mm; }
    h1 { font-family: Georgia, "Times New Roman", serif; font-size: 18pt; font-weight: 600; margin: 0; }
    .subtitle, footer { color: #475569; }
    table { width: 100%; border-collapse: separate; border-spacing: 1mm; table-layout: fixed; }
    thead th { border-bottom: 0.5mm solid #0a1f1a; padding: 1.5mm 0; font-size: 1.1em; }
    th.time { width: ${TIME_COLUMN_WIDTH[orientation]}; text-align: left; font-weight: 400; color: #475569; vertical-align: top; }
    th.time b { color: #0f172a; }
    td { padding: 0; vertical-align: top; height: 11mm; }
    td.free { border: 0.3mm dashed #cbd5e1; border-radius: 1.2mm; }
    .card { height: 100%; border-radius: 1.2mm; border-left: 0.9mm solid; padding: 1mm 1.5mm; }
    .subject { font-weight: 700; line-height: 1.15; }
    .teacher { color: #334155; margin-top: 0.4mm; }
    .extra { color: #475569; margin-top: 0.6mm; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.04em; }
    tr.break td { height: auto; background: #eef4f7; border-radius: 1.2mm; text-align: center; padding: 1mm; color: #475569; }
    tr.break span { font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; }
    footer { margin-top: 3mm; font-size: 0.85em; display: flex; justify-content: space-between; }
    tr { page-break-inside: avoid; }
  `;
}

/** A standalone A4 document for the browser's print dialog. */
export function renderTimetablePrintHtml(
  timetable: PrintableTimetable,
  orientation: PrintOrientation,
  generatedOn: string,
) {
  const head = `<tr><th class="time"></th>${timetable.days.map((d) => `<th>${escapeHtml(d)}</th>`).join("")}</tr>`;
  const body = timetable.rows.map((row) => rowHtml(row, timetable.days.length)).join("");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(timetable.title)}</title><style>${styles(orientation)}</style></head><body>`
    + `<header><div><h1>${escapeHtml(timetable.title)}</h1><div class="subtitle">${escapeHtml(timetable.subtitle)}</div></div></header>`
    + `<table><thead>${head}</thead><tbody>${body}</tbody></table>`
    + `<footer><span>Printed ${escapeHtml(generatedOn)}</span><span>Made with SQUL</span></footer>`
    + `</body></html>`;
}
