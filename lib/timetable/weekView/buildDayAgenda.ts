import type { TimetableBreak, TimetableLesson } from "@/lib/timetable/types";
import type { WeekRow } from "./buildWeekRows";

export type AgendaItem =
  | {
      kind: "lesson";
      key: string;
      lesson: TimetableLesson;
      dayOfWeek: number;
      periodNumber: number;
      slotIndex: number;
      rowSpan: number;
      startTime: string;
      endTime: string;
    }
  | { kind: "break"; key: string; breakItem: TimetableBreak }
  | { kind: "free"; key: string; startTime: string; endTime: string; periodCount: number };

type FreeStretch = Extract<AgendaItem, { kind: "free" }>;

function extendFree(stretch: FreeStretch | null, key: string, startTime: string, endTime: string): FreeStretch {
  if (!stretch) return { kind: "free", key: `free-${key}`, startTime, endTime, periodCount: 1 };
  return { ...stretch, endTime, periodCount: stretch.periodCount + 1 };
}

function periodRowEnd(rows: WeekRow[], fromIndex: number, rowSpan: number): string {
  const periodRows = rows.slice(fromIndex).filter((row) => row.kind === "period");
  const last = periodRows[rowSpan - 1] ?? periodRows[0];
  return last?.kind === "period" ? last.slot.endTime : "";
}

/**
 * One day of the week as a vertical list: lessons, breaks, and runs of
 * consecutive free periods collapsed into a single item.
 */
export function buildDayAgenda(rows: WeekRow[], dayIndex: number): AgendaItem[] {
  const items: AgendaItem[] = [];
  let free: FreeStretch | null = null;
  const flushFree = () => {
    if (free) items.push(free);
    free = null;
  };

  rows.forEach((row, rowIndex) => {
    if (row.kind === "break") {
      const breakItem = row.perDay[dayIndex];
      if (!breakItem) return;
      flushFree();
      items.push({ kind: "break", key: row.key, breakItem });
      return;
    }
    const cell = row.cells[dayIndex];
    if (!cell || cell.kind === "covered") return;
    if (cell.kind === "free") {
      free = extendFree(free, row.key, row.slot.startTime, row.slot.endTime);
      return;
    }
    flushFree();
    if (cell.kind === "break") {
      items.push({ kind: "break", key: `${row.key}-break`, breakItem: cell.breakItem });
      return;
    }
    items.push({
      kind: "lesson",
      key: `${row.key}-${cell.lesson.id}`,
      lesson: cell.lesson,
      dayOfWeek: cell.dayOfWeek,
      periodNumber: row.slot.periodNumber,
      slotIndex: row.slotIndex,
      rowSpan: cell.rowSpan,
      startTime: row.slot.startTime,
      endTime: periodRowEnd(rows, rowIndex, cell.rowSpan),
    });
  });

  flushFree();
  return items;
}
