import type { WeekRow } from "./buildWeekRows";

/** Teaching periods per weekday; a double period counts as two. */
export function countPeriodsPerDay(
  rows: WeekRow[],
  dayNumbers: readonly number[],
): Record<number, number> {
  const counts = Object.fromEntries(dayNumbers.map((day) => [day, 0]));

  for (const row of rows) {
    if (row.kind !== "period") continue;
    for (const cell of row.cells) {
      if (cell.kind === "lesson") counts[cell.dayOfWeek] += cell.rowSpan;
    }
  }

  return counts;
}
