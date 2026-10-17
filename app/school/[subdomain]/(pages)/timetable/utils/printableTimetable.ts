const DOUBLE_ROW_SPAN = 2;
const MINUTES_PER_HOUR = 60;

export type PrintOrientation = "landscape" | "portrait";

export type PrintLesson = {
  kind: "lesson";
  subject: string;
  teacher: string;
  room: string | null;
  accentHex: string;
  /** Darker shade of the subject colour, readable on its tint. */
  inkHex: string;
  rowSpan: number;
  /** A double that could not be drawn as one block (a break sits between its halves). */
  splitDouble: boolean;
};

export type PrintCell = PrintLesson | { kind: "free" } | { kind: "covered" };

export type PrintRow =
  | { kind: "period"; start: string; end: string; cells: PrintCell[] }
  | { kind: "break"; label: string; start: string; end: string };

export type PrintableTimetable = {
  title: string;
  subtitle: string;
  days: string[];
  rows: PrintRow[];
};

export type PrintSource = {
  title: string;
  subtitle: string;
  dayLabels: string[];
  periodNumbers: number[];
  slotFor: (dayIndex: number, period: number) => { startTime: string; endTime: string } | null | undefined;
  lessonFor: (dayOfWeek: number, period: number) => {
    subjectId: string;
    subject: string;
    teacher: string;
    room?: string | null;
    isDouble?: boolean;
  } | null;
  breaksAfter: (period: number) => { name: string; durationMinutes: number; dayOfWeek?: number; applyToAllDays?: boolean }[];
  accentFor: (subjectId: string, subject: string) => { accent: string; text: string };
};

function trimClock(time: string) {
  return time.replace(/^0(\d)/, "$1");
}

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = (h || 0) * MINUTES_PER_HOUR + (m || 0) + minutes;
  const mm = String(total % MINUTES_PER_HOUR).padStart(2, "0");
  return `${Math.floor(total / MINUTES_PER_HOUR)}:${mm}`;
}

function rowTimes(source: PrintSource, period: number) {
  for (let dayIndex = 0; dayIndex < source.dayLabels.length; dayIndex++) {
    const slot = source.slotFor(dayIndex, period);
    if (slot) return { start: trimClock(slot.startTime), end: trimClock(slot.endTime) };
  }
  return { start: "", end: "" };
}

function hasBreakAfter(source: PrintSource, period: number, dayOfWeek: number) {
  return source
    .breaksAfter(period)
    .some((b) => b.applyToAllDays || b.dayOfWeek === dayOfWeek);
}

function lessonCell(source: PrintSource, dayOfWeek: number, period: number, nextPeriod: number | undefined): PrintCell {
  const lesson = source.lessonFor(dayOfWeek, period);
  if (!lesson) return { kind: "free" };
  const colour = source.accentFor(lesson.subjectId, lesson.subject);
  const canSpan =
    !!lesson.isDouble &&
    nextPeriod !== undefined &&
    !hasBreakAfter(source, period, dayOfWeek) &&
    !source.lessonFor(dayOfWeek, nextPeriod);
  return {
    kind: "lesson",
    subject: lesson.subject,
    teacher: lesson.teacher,
    room: lesson.room || null,
    accentHex: colour.accent,
    inkHex: colour.text,
    rowSpan: canSpan ? DOUBLE_ROW_SPAN : 1,
    splitDouble: !!lesson.isDouble && !canSpan,
  };
}

/** What a double fills in the next period: nothing when merged, a repeat card when a break splits it. */
function secondHalfOf(
  source: PrintSource,
  cell: PrintCell,
  dayOfWeek: number,
  nextPeriod: number | undefined,
): PrintCell | null {
  if (cell.kind !== "lesson" || nextPeriod === undefined) return null;
  if (cell.rowSpan > 1) return { kind: "covered" };
  if (!cell.splitDouble || source.lessonFor(dayOfWeek, nextPeriod)) return null;
  return cell;
}

function breakRows(source: PrintSource, period: number, periodEnd: string): PrintRow[] {
  const seen = new Set<string>();
  return source.breaksAfter(period).flatMap((b) => {
    const dayOnly = !b.applyToAllDays && b.dayOfWeek ? ` (${source.dayLabels[b.dayOfWeek - 1] ?? ""} only)` : "";
    const label = `${b.name}${dayOnly}`;
    if (seen.has(label)) return [];
    seen.add(label);
    const end = periodEnd ? addMinutes(periodEnd, b.durationMinutes) : "";
    return [{ kind: "break" as const, label, start: periodEnd, end }];
  });
}

/** A class's week laid out as rows for print and PDF, with doubles merged into one block. */
export function buildPrintableTimetable(source: PrintSource): PrintableTimetable {
  const rows: PrintRow[] = [];
  const carried = new Map<string, PrintCell>();

  source.periodNumbers.forEach((period, index) => {
    const nextPeriod = source.periodNumbers[index + 1];
    const cells = source.dayLabels.map((_, dayIndex): PrintCell => {
      const dayOfWeek = dayIndex + 1;
      const carriedCell = carried.get(`${dayOfWeek}:${period}`);
      if (carriedCell) return carriedCell;
      const cell = lessonCell(source, dayOfWeek, period, nextPeriod);
      const secondHalf = secondHalfOf(source, cell, dayOfWeek, nextPeriod);
      if (secondHalf) carried.set(`${dayOfWeek}:${nextPeriod}`, secondHalf);
      return cell;
    });
    const times = rowTimes(source, period);
    rows.push({ kind: "period", ...times, cells }, ...breakRows(source, period, times.end));
  });

  return { title: source.title, subtitle: source.subtitle, days: source.dayLabels, rows };
}
