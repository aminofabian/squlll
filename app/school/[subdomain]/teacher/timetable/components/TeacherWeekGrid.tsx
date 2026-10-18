"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { TimetableLesson } from "@/lib/timetable/types";
import type {
  TeacherWeekBreakRow,
  TeacherWeekCell,
  TeacherWeekPeriodRow,
  TeacherWeekRow,
} from "../lib/buildTeacherWeekRows";
import type { WeekDayDate } from "../lib/getWeekDayDates";
import { getLessonCardState } from "../lib/getLessonCardState";
import { TeacherWeekDayHeader } from "./TeacherWeekDayHeader";
import { TeacherWeekTimeRail } from "./TeacherWeekTimeRail";
import { TeacherWeekLessonCard } from "./TeacherWeekLessonCard";
import { TeacherWeekBreakBand } from "./TeacherWeekBreakBand";
import { TeacherWeekLegend } from "./TeacherWeekLegend";

const RAIL_WIDTH_PX = 92;
const PERIOD_ROW_MIN_PX = 92;
const HEADER_ROW = 1;
const FIRST_BODY_ROW = 2;
const FIRST_DAY_COLUMN = 2;

type LessonTarget = { id: string; dayOfWeek: number } | null;

type GridContext = {
  currentDayOfWeek: number | null;
  currentPeriodIndex: number;
  progressPercent: number;
  completedLessonIds: string[];
  nextLesson: LessonTarget;
  onLessonClick: (lesson: TimetableLesson, dayOfWeek: number, periodNumber: number) => void;
};

type TeacherWeekGridProps = GridContext & {
  rows: TeacherWeekRow[];
  dayDates: WeekDayDate[];
  lessonCounts: Record<number, number>;
  weekRangeLabel: string;
  totalLessons: number;
  completedLessons: number;
};

function buildRowTemplate(rows: TeacherWeekRow[]): string {
  const body = rows.map((row) =>
    row.kind === "period" ? `minmax(${PERIOD_ROW_MIN_PX}px, auto)` : "auto",
  );
  return ["auto", ...body].join(" ");
}

function dayColumn(dayIndex: number): number {
  return dayIndex + FIRST_DAY_COLUMN;
}

export function TeacherWeekGrid({
  rows,
  dayDates,
  lessonCounts,
  weekRangeLabel,
  totalLessons,
  completedLessons,
  ...context
}: TeacherWeekGridProps) {
  const todayIndex = dayDates.findIndex((d) => d.dayOfWeek === context.currentDayOfWeek);
  const gridStyle: CSSProperties = {
    gridTemplateColumns: `${RAIL_WIDTH_PX}px repeat(${dayDates.length}, minmax(0, 1fr))`,
    gridTemplateRows: buildRowTemplate(rows),
  };

  return (
    <section className="overflow-hidden rounded-[26px] bg-[#fffdf8] shadow-[0_1px_0_rgba(10,38,32,0.04),0_40px_80px_-56px_rgba(10,38,32,0.55)] ring-1 ring-[#1a4d42]/10 dark:bg-[#0c1a17] dark:ring-white/10">
      <TeacherWeekLegend
        weekRangeLabel={weekRangeLabel}
        totalLessons={totalLessons}
        completedLessons={completedLessons}
      />
      <div className="overflow-x-auto px-3 pb-4 pt-3">
        <div className="relative grid min-w-[760px]" style={gridStyle}>
          {todayIndex >= 0 ? (
            <TodayColumnWash column={dayColumn(todayIndex)} rowCount={rows.length} />
          ) : null}
          <div style={{ gridRow: HEADER_ROW, gridColumn: 1 }} aria-hidden />
          {dayDates.map((date, index) => (
            <div key={date.dayOfWeek} className="relative z-10 pb-2" style={{ gridRow: HEADER_ROW, gridColumn: dayColumn(index) }}>
              <TeacherWeekDayHeader
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
      className="pointer-events-none mx-0.5 rounded-[20px] bg-gradient-to-b from-[#0a2620]/[0.06] via-[#0a2620]/[0.03] to-[#0a2620]/[0.015] dark:from-white/[0.06] dark:via-white/[0.03] dark:to-transparent"
      style={{ gridColumn: column, gridRow: `${HEADER_ROW} / ${rowCount + FIRST_BODY_ROW}` }}
    />
  );
}

function PeriodRow({
  row,
  gridRow,
  context,
}: {
  row: TeacherWeekPeriodRow;
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
        <TeacherWeekTimeRail
          periodNumber={row.slot.periodNumber}
          startTime={row.slot.startTime}
          endTime={row.slot.endTime}
          isCurrent={isCurrentPeriod}
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
  cell: TeacherWeekCell;
  row: TeacherWeekPeriodRow;
  gridRow: number;
  column: number;
  context: GridContext;
}) {
  if (cell.kind === "covered") return null;

  const span = cell.kind === "lesson" ? cell.rowSpan : 1;
  const placement: CSSProperties = { gridRow: `${gridRow} / span ${span}`, gridColumn: column };

  return (
    <div className="relative z-10 p-1" style={placement}>
      {cell.kind === "lesson" ? (
        <LessonSlot cell={cell} row={row} context={context} />
      ) : cell.kind === "break" ? (
        <TeacherWeekBreakBand breakItem={cell.breakItem} variant="chip" />
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
  cell: Extract<TeacherWeekCell, { kind: "lesson" }>;
  row: TeacherWeekPeriodRow;
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

  return (
    <TeacherWeekLessonCard
      lesson={lesson}
      state={state}
      isDoubleBlock={rowSpan > 1}
      progressPercent={context.progressPercent}
      onSelect={() => context.onLessonClick(lesson, dayOfWeek, row.slot.periodNumber)}
    />
  );
}

function FreeSlot() {
  return (
    <div className="group/free relative flex h-full min-h-[76px] items-center justify-center rounded-[14px] transition-colors hover:bg-[#1a4d42]/[0.03] dark:hover:bg-white/[0.02]">
      <span className="h-1 w-1 rounded-full bg-[#1a4d42]/15 transition-opacity group-hover/free:opacity-0 dark:bg-white/15" aria-hidden />
      <span className="absolute text-[9.5px] font-semibold uppercase tracking-[0.2em] text-[#1a4d42]/30 opacity-0 transition-opacity group-hover/free:opacity-100 dark:text-white/25">
        Free
      </span>
    </div>
  );
}

function BreakRow({ row, gridRow }: { row: TeacherWeekBreakRow; gridRow: number }) {
  const { labelBreak } = row;
  return (
    <>
      <div className="relative z-10" style={{ gridRow, gridColumn: 1 }}>
        <TeacherWeekTimeRail periodNumber={null} startTime={labelBreak.startTime} endTime={labelBreak.endTime} />
      </div>
      {row.isUniform ? (
        <div className="relative z-10 p-1" style={{ gridRow, gridColumn: `${FIRST_DAY_COLUMN} / -1` }}>
          <TeacherWeekBreakBand breakItem={labelBreak} />
        </div>
      ) : (
        row.perDay.map((item, index) => (
          <div key={index} className={cn("relative z-10 p-1", !item && "opacity-0")} style={{ gridRow, gridColumn: dayColumn(index) }}>
            {item ? <TeacherWeekBreakBand breakItem={item} variant="chip" /> : null}
          </div>
        ))
      )}
    </>
  );
}
