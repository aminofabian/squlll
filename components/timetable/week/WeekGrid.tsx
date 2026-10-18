"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { TimetableLesson } from "@/lib/timetable/types";
import type {
  WeekBreakRow,
  WeekCell,
  WeekPeriodRow,
  WeekRow,
} from "@/lib/timetable/weekView/buildWeekRows";
import type { WeekDayDate } from "@/lib/timetable/weekView/getWeekDayDates";
import { getLessonCardState } from "@/lib/timetable/weekView/getLessonCardState";
import { describeLessonCard } from "@/lib/timetable/weekView/describeLessonCard";
import type { LessonTints } from "@/lib/timetable/weekView/buildLessonTints";
import type { WeekViewerType } from "@/lib/timetable/weekView/weekViewerType";
import { WeekDayHeader } from "./WeekDayHeader";
import { WeekTimeRail } from "./WeekTimeRail";
import { WeekLessonCard } from "./WeekLessonCard";
import { WeekBreakBand } from "./WeekBreakBand";
import { WeekLegend } from "./WeekLegend";

const RAIL_WIDTH_PX = 90;
const PERIOD_ROW_MIN_PX = 58;
const EMPTY_PERIOD_ROW_MIN_PX = 30;
const HEADER_ROW = 1;
const FIRST_BODY_ROW = 2;
const FIRST_DAY_COLUMN = 2;

type LessonTarget = { id: string; dayOfWeek: number } | null;

type GridContext = {
  viewType: WeekViewerType;
  tints: LessonTints;
  currentDayOfWeek: number | null;
  currentPeriodIndex: number;
  progressPercent: number;
  completedLessonIds: string[];
  nextLesson: LessonTarget;
  onLessonClick: (lesson: TimetableLesson, dayOfWeek: number, periodNumber: number) => void;
};

type WeekGridProps = GridContext & {
  rows: WeekRow[];
  dayDates: WeekDayDate[];
  lessonCounts: Record<number, number>;
  weekRangeLabel: string;
  totalLessons: number;
  completedLessons: number;
};

function buildRowTemplate(rows: WeekRow[]): string {
  const body = rows.map((row) =>
    row.kind !== "period"
      ? "auto"
      : `minmax(${row.isEmpty ? EMPTY_PERIOD_ROW_MIN_PX : PERIOD_ROW_MIN_PX}px, auto)`,
  );
  return ["auto", ...body].join(" ");
}

function dayColumn(dayIndex: number): number {
  return dayIndex + FIRST_DAY_COLUMN;
}

export function WeekGrid({
  rows,
  dayDates,
  lessonCounts,
  weekRangeLabel,
  totalLessons,
  completedLessons,
  ...context
}: WeekGridProps) {
  const todayIndex = dayDates.findIndex((d) => d.dayOfWeek === context.currentDayOfWeek);
  const gridStyle: CSSProperties = {
    gridTemplateColumns: `${RAIL_WIDTH_PX}px repeat(${dayDates.length}, minmax(0, 1fr))`,
    gridTemplateRows: buildRowTemplate(rows),
  };

  return (
    <section className="overflow-hidden rounded-xl border border-[#1a4d42]/10 bg-[#fffdf8] shadow-[0_20px_40px_-36px_rgba(10,38,32,0.5)] dark:border-white/10 dark:bg-[#0c1a17]">
      <WeekLegend
        weekRangeLabel={weekRangeLabel}
        totalLessons={totalLessons}
        completedLessons={completedLessons}
        viewType={context.viewType}
      />
      <div className="overflow-x-auto px-2 pb-2 pt-2">
        <div className="relative grid min-w-[760px]" style={gridStyle}>
          {todayIndex >= 0 ? (
            <TodayColumnWash column={dayColumn(todayIndex)} rowCount={rows.length} />
          ) : null}
          <div style={{ gridRow: HEADER_ROW, gridColumn: 1 }} aria-hidden />
          {dayDates.map((date, index) => (
            <div key={date.dayOfWeek} className="relative z-10 pb-1" style={{ gridRow: HEADER_ROW, gridColumn: dayColumn(index) }}>
              <WeekDayHeader
                date={date}
                lessonCount={lessonCounts[date.dayOfWeek] ?? 0}
                isToday={index === todayIndex}
              />
            </div>
          ))}
          {rows.map((row, index) =>
            row.kind === "period" ? (
              <PeriodRow key={row.key} row={row} gridRow={index + FIRST_BODY_ROW} context={context} />
            ) : (
              <BreakRow key={row.key} row={row} gridRow={index + FIRST_BODY_ROW} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function TodayColumnWash({ column, rowCount }: { column: number; rowCount: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none rounded-lg bg-[#0a2620]/[0.06] ring-1 ring-inset ring-[#0a2620]/12 dark:bg-white/[0.06] dark:ring-white/10"
      style={{ gridColumn: column, gridRow: `${HEADER_ROW} / ${rowCount + FIRST_BODY_ROW}` }}
    />
  );
}

function PeriodRow({
  row,
  gridRow,
  context,
}: {
  row: WeekPeriodRow;
  gridRow: number;
  context: GridContext;
}) {
  const isCurrentPeriod = context.currentPeriodIndex === row.slotIndex;
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none self-start border-t border-dashed border-[#1a4d42]/10 dark:border-white/8"
        style={{ gridRow, gridColumn: "1 / -1" }}
      />
      <div className="relative z-10" style={{ gridRow, gridColumn: 1 }}>
        <WeekTimeRail
          periodNumber={row.slot.periodNumber}
          startTime={row.slot.startTime}
          endTime={row.slot.endTime}
          isCurrent={isCurrentPeriod}
          isEmpty={row.isEmpty}
        />
      </div>
      {row.cells.map((cell, index) => (
        <PeriodCell key={cell.dayOfWeek} cell={cell} row={row} gridRow={gridRow} column={dayColumn(index)} context={context} />
      ))}
    </>
  );
}

function PeriodCell({
  cell,
  row,
  gridRow,
  column,
  context,
}: {
  cell: WeekCell;
  row: WeekPeriodRow;
  gridRow: number;
  column: number;
  context: GridContext;
}) {
  if (cell.kind === "covered") return null;

  const span = cell.kind === "lesson" ? cell.rowSpan : 1;
  const placement: CSSProperties = { gridRow: `${gridRow} / span ${span}`, gridColumn: column };

  return (
    <div className="relative z-10 p-[3px]" style={placement}>
      {cell.kind === "lesson" ? (
        <LessonSlot cell={cell} row={row} context={context} />
      ) : cell.kind === "break" ? (
        <WeekBreakBand breakItem={cell.breakItem} variant="chip" />
      ) : (
        <FreeSlot />
      )}
    </div>
  );
}

function LessonSlot({
  cell,
  row,
  context,
}: {
  cell: Extract<WeekCell, { kind: "lesson" }>;
  row: WeekPeriodRow;
  context: GridContext;
}) {
  const { lesson, dayOfWeek, rowSpan } = cell;
  const lastCoveredIndex = row.slotIndex + rowSpan - 1;
  const isToday = context.currentDayOfWeek === dayOfWeek;
  const coversCurrentPeriod =
    context.currentPeriodIndex >= row.slotIndex && context.currentPeriodIndex <= lastCoveredIndex;

  const state = getLessonCardState({
    isCancelled: lesson.isCancelled === true,
    isCurrent: isToday && coversCurrentPeriod,
    isCompleted: context.completedLessonIds.includes(lesson.id),
    isNext: context.nextLesson?.id === lesson.id && context.nextLesson.dayOfWeek === dayOfWeek,
  });

  const text = describeLessonCard(lesson, context.viewType, context.tints.mode, context.tints.showSubject);

  return (
    <WeekLessonCard
      title={text.title}
      detail={text.detail}
      room={lesson.room}
      accent={context.tints.accentFor(lesson)}
      state={state}
      isDoubleBlock={rowSpan > 1}
      progressPercent={context.progressPercent}
      onSelect={() => context.onLessonClick(lesson, dayOfWeek, row.slot.periodNumber)}
    />
  );
}

function FreeSlot() {
  return (
    <div className="group/free flex h-full min-h-[24px] items-center justify-center rounded-md transition-colors hover:bg-[#1a4d42]/[0.04] dark:hover:bg-white/[0.03]">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1a4d42]/80 opacity-0 transition-opacity group-hover/free:opacity-100 dark:text-white/55">
        Free
      </span>
    </div>
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
