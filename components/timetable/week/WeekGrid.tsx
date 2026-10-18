"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { TimetableLesson, TimetableSlot } from "@/lib/timetable/types";
import type { WeekBreakRow, WeekCell, WeekPeriodRow, WeekRow } from "@/lib/timetable/weekView/buildWeekRows";
import type { WeekDayDate } from "@/lib/timetable/weekView/getWeekDayDates";
import type { WeekViewerType } from "@/lib/timetable/weekView/weekViewerType";
import type { LessonGroups } from "@/lib/timetable/weekView/buildLessonGroups";
import { getLessonCardState } from "@/lib/timetable/weekView/getLessonCardState";
import { describeLessonCard } from "@/lib/timetable/weekView/describeLessonCard";
import { formatTimeRange } from "@/lib/timetable/weekView/formatTimeRange";
import { WeekLessonCard } from "./WeekLessonCard";
import { WeekDayHeader } from "./WeekDayHeader";
import { WeekTimeRail } from "./WeekTimeRail";
import { WeekBreakBand } from "./WeekBreakBand";
import { WeekGridHeader } from "./WeekGridHeader";
import { WEEK_CARD_CLASS } from "./weekCardClass";

const RAIL_WIDTH_PX = 84;
const PERIOD_ROW_MIN_PX = 48;
const EMPTY_PERIOD_ROW_MIN_PX = 30;
const HEADER_ROW = 1;
const FIRST_BODY_ROW = 2;
const FIRST_DAY_COLUMN = 2;
const COMPLETED_LABELS: Record<WeekViewerType, string> = { teacher: "Taught", student: "Done" };

type LessonTarget = { id: string; dayOfWeek: number } | null;

type GridContext = {
  viewType: WeekViewerType;
  lessonGroups: LessonGroups;
  focusedGroupKey: string | null;
  /** On weekends the grid previews next week, so nothing is live or done yet. */
  isUpcomingWeek: boolean;
  currentDayOfWeek: number | null;
  currentPeriodIndex: number;
  progressPercent: number;
  completedLessonIds: string[];
  nextLesson: LessonTarget;
  onLessonClick: (lesson: TimetableLesson, dayOfWeek: number, periodNumber: number) => void;
};

type CellContext = GridContext & { slots: TimetableSlot[] };

type WeekGridProps = GridContext & {
  rows: WeekRow[];
  dayDates: WeekDayDate[];
  periodCounts: Record<number, number>;
  busiestDay: number | null;
  focusDayOfWeek: number;
  focusLabel: string;
  weekRangeLabel: string;
  totalLessons: number;
  completedLessons: number;
};

function buildRowTemplate(rows: WeekRow[]): string {
  const body = rows.map((row) =>
    row.kind !== "period" ? "auto" : `minmax(${row.isEmpty ? EMPTY_PERIOD_ROW_MIN_PX : PERIOD_ROW_MIN_PX}px, auto)`,
  );
  return ["auto", ...body].join(" ");
}

function dayColumn(dayIndex: number): number {
  return dayIndex + FIRST_DAY_COLUMN;
}

export function WeekGrid({ rows, dayDates, periodCounts, busiestDay, focusDayOfWeek, focusLabel, weekRangeLabel, totalLessons, completedLessons, ...context }: WeekGridProps) {
  const focusIndex = dayDates.findIndex((d) => d.dayOfWeek === focusDayOfWeek);
  const cellContext: CellContext = { ...context, slots: rows.flatMap((row) => (row.kind === "period" ? [row.slot] : [])) };
  const gridStyle: CSSProperties = {
    gridTemplateColumns: `${RAIL_WIDTH_PX}px repeat(${dayDates.length}, minmax(0, 1fr))`,
    gridTemplateRows: buildRowTemplate(rows),
  };

  return (
    <section className={`overflow-hidden ${WEEK_CARD_CLASS}`}>
      <WeekGridHeader
        weekRangeLabel={weekRangeLabel}
        completedLessons={context.isUpcomingWeek ? 0 : completedLessons}
        totalLessons={totalLessons}
        completedLabel={COMPLETED_LABELS[context.viewType]}
      />
      <div className="overflow-x-auto px-3 pb-3">
        <div className="relative grid min-w-[560px]" style={gridStyle}>
          {focusIndex >= 0 ? <FocusColumnWash column={dayColumn(focusIndex)} rowCount={rows.length} /> : null}
          <div style={{ gridRow: HEADER_ROW, gridColumn: 1 }} aria-hidden />
          {dayDates.map((date, index) => (
            <div key={date.dayOfWeek} className="relative z-10 border-b border-[#eceee9] dark:border-white/10" style={{ gridRow: HEADER_ROW, gridColumn: dayColumn(index) }}>
              <WeekDayHeader
                date={date}
                periodCount={periodCounts[date.dayOfWeek] ?? 0}
                isBusiest={date.dayOfWeek === busiestDay}
                focusLabel={index === focusIndex ? focusLabel : null}
              />
            </div>
          ))}
          {rows.map((row, index) =>
            row.kind === "period" ? (
              <PeriodRow key={row.key} row={row} gridRow={index + FIRST_BODY_ROW} context={cellContext} />
            ) : (
              <BreakRow key={row.key} row={row} gridRow={index + FIRST_BODY_ROW} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function FocusColumnWash({ column, rowCount }: { column: number; rowCount: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none rounded-lg bg-[#fdf4dc] dark:bg-amber-400/[0.07]"
      style={{ gridColumn: column, gridRow: `${HEADER_ROW} / ${rowCount + FIRST_BODY_ROW}` }}
    />
  );
}

function PeriodRow({ row, gridRow, context }: { row: WeekPeriodRow; gridRow: number; context: CellContext }) {
  const isCurrentPeriod = !context.isUpcomingWeek && context.currentPeriodIndex === row.slotIndex;
  return (
    <>
      <div aria-hidden className="pointer-events-none self-start border-t border-[#eceee9] dark:border-white/[0.06]" style={{ gridRow, gridColumn: "1 / -1" }} />
      <div className="relative z-10" style={{ gridRow, gridColumn: 1 }}>
        <WeekTimeRail periodNumber={row.slot.periodNumber} startTime={row.slot.startTime} endTime={row.slot.endTime} isCurrent={isCurrentPeriod} isEmpty={row.isEmpty} />
      </div>
      {row.cells.map((cell, index) => (
        <PeriodCell key={cell.dayOfWeek} cell={cell} row={row} gridRow={gridRow} column={dayColumn(index)} context={context} />
      ))}
    </>
  );
}

type PeriodCellProps = { cell: WeekCell; row: WeekPeriodRow; gridRow: number; column: number; context: CellContext };

function PeriodCell({ cell, row, gridRow, column, context }: PeriodCellProps) {
  if (cell.kind === "covered" || cell.kind === "free") return null;

  const span = cell.kind === "lesson" ? cell.rowSpan : 1;
  return (
    <div className="relative z-10 p-[3px]" style={{ gridRow: `${gridRow} / span ${span}`, gridColumn: column }}>
      {cell.kind === "lesson" ? (
        <LessonSlot cell={cell} row={row} context={context} />
      ) : (
        <WeekBreakBand breakItem={cell.breakItem} variant="chip" />
      )}
    </div>
  );
}

function doublePeriodLabel(context: CellContext, row: WeekPeriodRow, rowSpan: number): string | null {
  const lastSlot = context.slots[row.slotIndex + rowSpan - 1];
  if (rowSpan < 2 || !lastSlot) return null;
  return `Double period · ${formatTimeRange(row.slot.startTime, lastSlot.endTime)}`;
}

function LessonSlot({ cell, row, context }: { cell: Extract<WeekCell, { kind: "lesson" }>; row: WeekPeriodRow; context: CellContext }) {
  const { lesson, dayOfWeek, rowSpan } = cell;
  const isLiveWeek = !context.isUpcomingWeek;
  const coversCurrentPeriod = context.currentPeriodIndex >= row.slotIndex && context.currentPeriodIndex <= row.slotIndex + rowSpan - 1;
  const state = getLessonCardState({
    isCancelled: lesson.isCancelled === true,
    isCurrent: isLiveWeek && context.currentDayOfWeek === dayOfWeek && coversCurrentPeriod,
    isCompleted: isLiveWeek && context.completedLessonIds.includes(lesson.id),
    isNext: context.nextLesson?.id === lesson.id && context.nextLesson.dayOfWeek === dayOfWeek,
  });
  const group = context.lessonGroups.groupFor(lesson);
  const text = describeLessonCard(lesson, context.viewType, context.lessonGroups.mode, group);

  return (
    <WeekLessonCard
      title={text.title}
      detail={text.detail}
      room={lesson.room}
      badge={group.badge}
      accent={group.accent}
      surface={group.surface}
      state={state}
      doubleLabel={doublePeriodLabel(context, row, rowSpan)}
      progressPercent={context.progressPercent}
      isDimmed={context.focusedGroupKey != null && context.focusedGroupKey !== group.key}
      onSelect={() => context.onLessonClick(lesson, dayOfWeek, row.slot.periodNumber)}
    />
  );
}

function BreakRow({ row, gridRow }: { row: WeekBreakRow; gridRow: number }) {
  const { labelBreak } = row;
  return (
    <>
      <div className="relative z-10" style={{ gridRow, gridColumn: 1 }}>
        <WeekTimeRail periodNumber={null} startTime={labelBreak.startTime} endTime={labelBreak.endTime} />
      </div>
      {row.isUniform ? (
        <div className="relative z-10 p-[3px]" style={{ gridRow, gridColumn: `${FIRST_DAY_COLUMN} / -1` }}>
          <WeekBreakBand breakItem={labelBreak} />
        </div>
      ) : (
        row.perDay.map((item, index) => (
          <div key={index} className={cn("relative z-10 p-[3px]", !item && "opacity-0")} style={{ gridRow, gridColumn: dayColumn(index) }}>
            {item ? <WeekBreakBand breakItem={item} variant="chip" /> : null}
          </div>
        ))
      )}
    </>
  );
}
