import type { TeacherWeekRow } from "./buildTeacherWeekRows";

/** Number of distinct lessons per weekday (a double period counts once). */
export function countLessonsPerDay(
  rows: TeacherWeekRow[],
  dayNumbers: readonly number[],
): Record<number, number> {
  const counts = Object.fromEntries(dayNumbers.map((day) => [day, 0]));

  for (const row of rows) {
    if (row.kind !== "period") continue;
    for (const cell of row.cells) {
      if (cell.kind === "lesson") counts[cell.dayOfWeek] += 1;
    }
  }

  return counts;
}
