import type {
  TimetableBreak,
  TimetableDay,
  TimetableLesson,
  TimetableSlot,
} from "@/lib/timetable/types";

const SINGLE_ROW_SPAN = 1;
const DOUBLE_ROW_SPAN = 2;
const BEFORE_FIRST_PERIOD = 0;

export type WeekCell =
  | {
      kind: "lesson";
      dayOfWeek: number;
      lesson: TimetableLesson;
      rowSpan: typeof SINGLE_ROW_SPAN | typeof DOUBLE_ROW_SPAN;
    }
  | { kind: "covered"; dayOfWeek: number }
  | { kind: "break"; dayOfWeek: number; breakItem: TimetableBreak }
  | { kind: "free"; dayOfWeek: number };

export type WeekPeriodRow = {
  kind: "period";
  key: string;
  slot: TimetableSlot;
  slotIndex: number;
  cells: WeekCell[];
};

export type WeekBreakRow = {
  kind: "break";
  key: string;
  afterPeriod: number;
  labelBreak: TimetableBreak;
  perDay: (TimetableBreak | null)[];
  isUniform: boolean;
};

export type WeekRow = WeekPeriodRow | WeekBreakRow;

type BuildWeekRowsInput = {
  days: TimetableDay[];
  timeSlots: TimetableSlot[];
  breaks: TimetableBreak[];
  dayNumbers: readonly number[];
};

function appliesToEveryDay(item: TimetableBreak): boolean {
  return item.dayOfWeek == null || item.applyToAllDays === true;
}

function findBreakForDay(
  rowBreaks: TimetableBreak[],
  dayOfWeek: number,
): TimetableBreak | null {
  return (
    rowBreaks.find((item) => item.dayOfWeek === dayOfWeek) ??
    rowBreaks.find(appliesToEveryDay) ??
    null
  );
}

function isSameBreak(a: TimetableBreak | null, b: TimetableBreak | null) {
  return a != null && b != null && a.name === b.name && a.type === b.type;
}

function buildBreakRow(
  breaks: TimetableBreak[],
  afterPeriod: number,
  dayNumbers: readonly number[],
): WeekBreakRow | null {
  const rowBreaks = breaks.filter((item) => item.afterPeriod === afterPeriod);
  if (rowBreaks.length === 0) return null;

  const perDay = dayNumbers.map((day) => findBreakForDay(rowBreaks, day));
  const isUniform = perDay.every((item) => isSameBreak(item, perDay[0]));

  return {
    kind: "break",
    key: `break-${afterPeriod}`,
    afterPeriod,
    labelBreak: rowBreaks[0],
    perDay,
    isUniform,
  };
}

function lessonAt(day: TimetableDay | undefined, slotIndex: number) {
  const cell = day?.cells[slotIndex];
  return cell?.type === "lesson" ? (cell.lesson ?? null) : null;
}

function startsDoubleBlock(
  day: TimetableDay | undefined,
  slotIndex: number,
): boolean {
  const lesson = lessonAt(day, slotIndex);
  const below = lessonAt(day, slotIndex + 1);
  if (!lesson?.isDoublePeriod || lesson.isDoubleContinuation) return false;
  return below?.id === lesson.id && below.isDoubleContinuation === true;
}

function coverKey(dayOfWeek: number, slotIndex: number) {
  return `${dayOfWeek}:${slotIndex}`;
}

function buildCell(
  day: TimetableDay | undefined,
  dayOfWeek: number,
  slotIndex: number,
  canSpanBelow: boolean,
  covered: Set<string>,
): WeekCell {
  if (covered.has(coverKey(dayOfWeek, slotIndex))) {
    return { kind: "covered", dayOfWeek };
  }

  const cell = day?.cells[slotIndex];
  if (cell?.type === "break" && cell.break) {
    return { kind: "break", dayOfWeek, breakItem: cell.break };
  }
  if (cell?.type !== "lesson" || !cell.lesson) {
    return { kind: "free", dayOfWeek };
  }

  const isDouble = canSpanBelow && startsDoubleBlock(day, slotIndex);
  if (isDouble) covered.add(coverKey(dayOfWeek, slotIndex + 1));

  return {
    kind: "lesson",
    dayOfWeek,
    lesson: cell.lesson,
    rowSpan: isDouble ? DOUBLE_ROW_SPAN : SINGLE_ROW_SPAN,
  };
}

/**
 * Flattens a teacher's week into display rows: one row per period plus a
 * break row wherever the school schedule inserts a break. Double periods
 * that are not split by a break collapse into a single two-row cell.
 */
export function buildWeekRows({
  days,
  timeSlots,
  breaks,
  dayNumbers,
}: BuildWeekRowsInput): WeekRow[] {
  const dayMap = new Map(days.map((day) => [day.dayOfWeek, day]));
  const covered = new Set<string>();
  const rows: WeekRow[] = [];

  const leadingBreak = buildBreakRow(breaks, BEFORE_FIRST_PERIOD, dayNumbers);
  if (leadingBreak) rows.push(leadingBreak);

  timeSlots.forEach((slot, slotIndex) => {
    const breakRow = buildBreakRow(breaks, slot.periodNumber, dayNumbers);
    const cells = dayNumbers.map((dayOfWeek) =>
      buildCell(dayMap.get(dayOfWeek), dayOfWeek, slotIndex, !breakRow, covered),
    );
    rows.push({ kind: "period", key: slot.id, slot, slotIndex, cells });
    if (breakRow) rows.push(breakRow);
  });

  return rows;
}
