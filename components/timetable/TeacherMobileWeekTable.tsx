/**
 * TeacherMobileWeekTable — mobile week grid (Mon–Fri, no horizontal scroll)
 */

'use client';

import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  TimetableDay,
  TimetableSlot,
  TimetableLesson,
  TimetableBreak,
} from '@/lib/timetable/types';
import type { BreakType } from '@/lib/timetable/types';
import {
  BREAK_TYPE_CONFIG,
  DAY_SHORT_NAMES,
  getSubjectPaletteColor,
  normalizeSubjectName,
} from '@/lib/timetable/constants';
import { getSubjectShortCode } from '@/lib/timetable/lessonShortcodes';

export const WEEKDAY_NUMBERS = [1, 2, 3, 4, 5] as const;

function trimHourLabel(time: string): string {
  return time.replace(/^0(\d)/, '$1').trim();
}

function slotTimeLabel(slot: TimetableSlot): string {
  if (slot.startTime && slot.endTime) {
    return trimHourLabel(slot.startTime);
  }
  const raw = slot.displayTime?.trim() ?? '';
  const parts = raw.split(/\s*[-–—]\s*/);
  return trimHourLabel(parts[0] || raw || '—');
}

function slotEndLabel(slot: TimetableSlot): string {
  if (slot.endTime) return trimHourLabel(slot.endTime);
  const raw = slot.displayTime?.trim() ?? '';
  const parts = raw.split(/\s*[-–—]\s*/);
  return parts.length >= 2 ? trimHourLabel(parts[1]) : '';
}

function displayBreakName(name: string | undefined, fallback: string): string {
  const trimmed = name?.trim();
  if (trimmed) return trimmed;
  return fallback.trim() || 'Break';
}

/** "Grade 7 · A" → "G7·A" */
export function formatGradeShort(displayName: string, name: string): string {
  const label = (displayName || name).trim();
  if (!label) return '';
  return label
    .replace(/\bGrade\s+/gi, 'G')
    .replace(/^G\s+(\d)/, 'G$1')
    .replace(/\s*·\s*/g, '·');
}

type GridRow =
  | { kind: 'break'; key: string; breakItem: TimetableBreak }
  | { kind: 'period'; key: string; slot: TimetableSlot; slotIndex: number };

function buildGridRows(
  timeSlots: TimetableSlot[],
  breaks: TimetableBreak[],
): GridRow[] {
  const rows: GridRow[] = [];

  const pushBreak = (afterPeriod: number) => {
    const b = breaks.find((br) => br.afterPeriod === afterPeriod);
    if (b) rows.push({ kind: 'break', key: `break-${afterPeriod}`, breakItem: b });
  };

  if (breaks.some((b) => b.afterPeriod === 0)) pushBreak(0);

  timeSlots.forEach((slot, slotIndex) => {
    rows.push({ kind: 'period', key: slot.id, slot, slotIndex });
    if (breaks.some((b) => b.afterPeriod === slot.periodNumber)) {
      pushBreak(slot.periodNumber);
    }
  });

  return rows;
}

export type TeacherMobileWeekTableProps = {
  dayMap: Map<number, TimetableDay>;
  timeSlots: TimetableSlot[];
  breaks: TimetableBreak[];
  currentDayOfWeek: number | null;
  currentPeriodIndex: number;
  completedLessonIds: string[];
  viewType?: "student" | "teacher" | "admin";
  weekDays?: readonly number[];
  dayShortNames?: Record<number, string>;
  conflictLessonIds?: Set<string>;
  onLessonClick?: (
    lesson: TimetableLesson,
    dayOfWeek: number,
    periodNumber: number,
  ) => void;
  onEmptyCellClick?: (dayOfWeek: number, periodNumber: number) => void;
};

export function TeacherMobileWeekTable({
  dayMap,
  timeSlots,
  breaks,
  currentDayOfWeek,
  currentPeriodIndex,
  completedLessonIds,
  viewType = "teacher",
  weekDays = WEEKDAY_NUMBERS,
  dayShortNames = DAY_SHORT_NAMES,
  conflictLessonIds,
  onLessonClick,
  onEmptyCellClick,
}: TeacherMobileWeekTableProps) {
  const rows = useMemo(
    () => buildGridRows(timeSlots, breaks),
    [timeSlots, breaks],
  );
  const isStudent = viewType === "student";
  const isAdmin = viewType === "admin";
  const dayCount = weekDays.length;
  const dayColWidth = dayCount <= 5 ? (isStudent ? 17.6 : 17.8) : 100 / (1 + dayCount);

  if (rows.length === 0) {
    return (
      <p className="px-3 py-10 text-center text-sm text-slate-500">No classes</p>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 max-w-full flex-1 basis-0 flex-col overflow-hidden">
      <div
        className={cn(
          'min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain scroll-smooth',
          'px-0 pb-0 pt-0 [-webkit-overflow-scrolling:touch]',
          isAdmin && 'px-4 pt-3 pb-5',
        )}
      >
        <table
          className={cn(
            'w-full max-w-full table-fixed border-separate border-spacing-0 leading-tight',
            isStudent ? 'text-[10px]' : 'text-[10px]',
          )}
        >
          <colgroup>
            <col className={isStudent ? "w-[12%]" : "w-[11%]"} />
            {weekDays.map((day) => (
              <col
                key={day}
                style={{ width: `${dayColWidth}%` }}
              />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th
                className={cn(
                  "sticky top-0 z-10 pr-0.5 text-left font-medium",
                  "border-b border-slate-100 bg-white text-[9px] text-slate-400 dark:border-slate-800 dark:bg-slate-950",
                  isAdmin ? "pb-3 pt-2" : "pb-1 pt-1",
                )}
                scope="col"
              />
              {weekDays.map((day) => {
                const isToday = currentDayOfWeek === day;
                return (
                  <th
                    key={day}
                    scope="col"
                    className={cn(
                      "sticky top-0 z-10 text-center font-semibold",
                      "border-b border-slate-100 bg-white text-[10px] dark:border-slate-800 dark:bg-slate-950",
                      isAdmin ? "pb-3 pt-2" : "pb-1 pt-1",
                      isToday ? "text-primary" : "text-slate-400",
                    )}
                  >
                    {dayShortNames[day] ?? DAY_SHORT_NAMES[day] ?? `D${day}`}
                  </th>
                );
              })}
            </tr>
          </thead>
        <tbody>
          {rows.map((row) =>
            row.kind === "break" ? (
              <BreakTableRow
                key={row.key}
                breakItem={row.breakItem}
                viewType={viewType}
                weekDays={weekDays}
              />
            ) : (
              <PeriodTableRow
                key={row.key}
                slot={row.slot}
                slotIndex={row.slotIndex}
                dayMap={dayMap}
                weekDays={weekDays}
                currentDayOfWeek={currentDayOfWeek}
                currentPeriodIndex={currentPeriodIndex}
                completedLessonIds={completedLessonIds}
                viewType={viewType}
                conflictLessonIds={conflictLessonIds}
                onLessonClick={onLessonClick}
                onEmptyCellClick={onEmptyCellClick}
              />
            ),
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function BreakTableRow({
  breakItem,
  viewType = "teacher",
  weekDays = WEEKDAY_NUMBERS,
}: {
  breakItem: TimetableBreak;
  viewType?: "student" | "teacher" | "admin";
  weekDays?: readonly number[];
}) {
  const config =
    BREAK_TYPE_CONFIG[breakItem.type as BreakType] || BREAK_TYPE_CONFIG.BREAK;
  const label = displayBreakName(breakItem.name, config.label);
  const isStudent = viewType === 'student';
  const isAdmin = viewType === 'admin';

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800">
      <td
        className={cn(
          'max-w-0 overflow-hidden align-middle',
          'border-b border-slate-100 pr-1 dark:border-slate-800',
          isAdmin ? 'py-3' : 'py-1',
        )}
      >
        <span
          className={cn(
            'block text-right font-mono tabular-nums text-slate-400',
            isStudent ? 'text-[9px]' : 'text-[10px]',
          )}
        >
          {breakItem.durationMinutes}m
        </span>
      </td>
      <td
        colSpan={weekDays.length}
        className={cn(
          "max-w-0 overflow-hidden",
          "border-b border-slate-100 dark:border-slate-800",
          isAdmin ? "py-3" : "py-1",
        )}
      >
        <p
          className={cn(
            'text-center font-medium text-slate-400',
            isStudent
              ? 'text-[9px] uppercase tracking-wider'
              : 'text-[9px] uppercase tracking-wider',
          )}
        >
          {label}
        </p>
      </td>
    </tr>
  );
}

function PeriodTableRow({
  slot,
  slotIndex,
  dayMap,
  weekDays = WEEKDAY_NUMBERS,
  currentDayOfWeek,
  currentPeriodIndex,
  completedLessonIds,
  viewType = "teacher",
  conflictLessonIds,
  onLessonClick,
  onEmptyCellClick,
}: {
  slot: TimetableSlot;
  slotIndex: number;
  dayMap: Map<number, TimetableDay>;
  weekDays?: readonly number[];
  currentDayOfWeek: number | null;
  currentPeriodIndex: number;
  completedLessonIds: string[];
  viewType?: "student" | "teacher" | "admin";
  conflictLessonIds?: Set<string>;
  onLessonClick?: TeacherMobileWeekTableProps["onLessonClick"];
  onEmptyCellClick?: TeacherMobileWeekTableProps["onEmptyCellClick"];
}) {
  const isCurrentPeriod = currentPeriodIndex === slotIndex;
  const start = slotTimeLabel(slot);
  const end = slotEndLabel(slot);
  const isStudent = viewType === 'student';
  const isAdmin = viewType === 'admin';

  return (
    <tr>
      <td
        className={cn(
          'max-w-0 overflow-hidden align-middle',
          'border-b border-slate-100 pr-1 dark:border-slate-800',
          isAdmin ? 'py-3.5' : 'py-1.5',
        )}
      >
        <div className="flex flex-col items-end leading-none">
          <span
            className={cn(
              'font-mono tabular-nums',
              isStudent ? 'text-[11px] font-medium' : 'text-[11px] font-medium',
              isCurrentPeriod
                ? 'font-semibold text-primary'
                : 'text-slate-700 dark:text-slate-300',
            )}
          >
            {start}
          </span>
          {end ? (
            <span
              className={cn(
                'font-mono tabular-nums text-slate-400',
                isStudent ? 'mt-0.5 text-[9px]' : 'text-[9px]',
              )}
            >
              {end}
            </span>
          ) : null}
        </div>
      </td>
      {weekDays.map((dayOfWeek) => {
        const day = dayMap.get(dayOfWeek);
        const cell = day?.cells[slotIndex] ?? null;
        const isToday = currentDayOfWeek === dayOfWeek;
        const isCurrent = isToday && isCurrentPeriod;

        return (
          <td
            key={dayOfWeek}
            className={cn(
              "max-w-0 overflow-hidden align-top",
              "border-b border-slate-100 p-0 dark:border-slate-800",
              isToday && !isCurrent && "bg-primary/[0.03]",
              isCurrent && "bg-primary",
            )}
          >
            <LessonCell
              cell={cell}
              dayOfWeek={dayOfWeek}
              periodNumber={slot.periodNumber}
              isCurrent={isCurrent}
              completedLessonIds={completedLessonIds}
              viewType={viewType}
              conflictLessonIds={conflictLessonIds}
              onLessonClick={onLessonClick}
              onEmptyCellClick={onEmptyCellClick}
            />
          </td>
        );
      })}
    </tr>
  );
}

function LessonCell({
  cell,
  dayOfWeek,
  periodNumber,
  isCurrent,
  completedLessonIds,
  viewType = "teacher",
  conflictLessonIds,
  onLessonClick,
  onEmptyCellClick,
}: {
  cell: TimetableDay["cells"][number] | null;
  dayOfWeek: number;
  periodNumber: number;
  isCurrent: boolean;
  completedLessonIds: string[];
  viewType?: "student" | "teacher" | "admin";
  conflictLessonIds?: Set<string>;
  onLessonClick?: TeacherMobileWeekTableProps["onLessonClick"];
  onEmptyCellClick?: TeacherMobileWeekTableProps["onEmptyCellClick"];
}) {
  if (cell?.type === "lesson" && cell.lesson) {
    const lesson = cell.lesson;
    const isCompleted = completedLessonIds.includes(lesson.id);
    const hasConflict = conflictLessonIds?.has(lesson.id) ?? false;

    const palette = getSubjectPaletteColor(
      normalizeSubjectName(lesson.subject.name),
    );
    const shortCode = getSubjectShortCode(
      lesson.subject.name,
      lesson.subject.code,
    );

    if (viewType === "student") {
      return (
        <button
          type="button"
          onClick={() => onLessonClick?.(lesson, dayOfWeek, periodNumber)}
          aria-label={`${lesson.subject.name}, tap for details`}
          className={cn(
            "flex min-h-[30px] w-full min-w-0 max-w-full items-center justify-center px-0 py-1.5 text-center active:opacity-80",
            isCurrent ? "bg-transparent" : palette.bg,
            isCompleted && !isCurrent && "opacity-50",
            hasConflict && !isCurrent && "ring-1 ring-inset ring-red-400/80",
          )}
        >
          <span
            className={cn(
              "font-semibold uppercase leading-none tracking-wider",
              isCurrent
                ? "text-[10px] text-white"
                : "text-[9px] text-slate-800 dark:text-slate-100",
              isCompleted && "line-through decoration-slate-400",
            )}
          >
            {shortCode}
          </span>
        </button>
      );
    }

    if (viewType === "admin") {
      const teacherInitials = lesson.teacher.name
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2);

      return (
        <button
          type="button"
          onClick={() => onLessonClick?.(lesson, dayOfWeek, periodNumber)}
          aria-label={`${lesson.subject.name}, ${lesson.teacher.name}, tap to edit`}
          className={cn(
            "flex min-h-[42px] w-full min-w-0 max-w-full flex-col items-center justify-center px-1 py-2 text-center active:opacity-80",
            isCurrent ? "bg-transparent" : palette.bg,
            lesson.isDoubleContinuation && !isCurrent && "opacity-70",
            hasConflict && !isCurrent && "ring-1 ring-inset ring-red-400/80",
          )}
        >
          <span
            className={cn(
              "font-semibold uppercase leading-none tracking-wider",
              isCurrent
                ? "text-[10px] text-white"
                : "text-[9px] text-slate-800 dark:text-slate-100",
            )}
          >
            {shortCode}
          </span>
          {teacherInitials && !isCurrent ? (
            <span className="mt-1.5 text-[8px] leading-none text-slate-500 dark:text-slate-400">
              {teacherInitials}
            </span>
          ) : null}
        </button>
      );
    }

    const subtitle = formatGradeShort(
      lesson.grade.displayName || "",
      lesson.grade.name,
    );

    return (
      <button
        type="button"
        onClick={() => onLessonClick?.(lesson, dayOfWeek, periodNumber)}
        aria-label={`${lesson.subject.name}${subtitle ? `, ${subtitle}` : ''}, tap for details`}
        className={cn(
          'flex min-h-[30px] w-full min-w-0 max-w-full flex-col items-center justify-center px-0 py-1 text-center active:opacity-80',
          isCurrent ? 'bg-transparent' : palette.bg,
          isCompleted && !isCurrent && 'opacity-50',
        )}
      >
        <span
          className={cn(
            'font-semibold uppercase leading-none tracking-wider',
            isCurrent
              ? 'text-[10px] text-white'
              : 'text-[9px] text-slate-800 dark:text-slate-100',
            isCompleted && 'line-through decoration-slate-400',
          )}
        >
          {shortCode}
        </span>
        {subtitle && !isCurrent ? (
          <span className="mt-0.5 text-[8px] leading-none text-slate-500 dark:text-slate-400">
            {subtitle}
          </span>
        ) : null}
      </button>
    );
  }

  if (viewType === "student") {
    return (
      <div className="flex min-h-[30px] w-full items-center justify-center" aria-hidden>
        <span className="text-[8px] text-slate-200 dark:text-slate-700">·</span>
      </div>
    );
  }

  if (viewType === "admin") {
    return (
      <button
        type="button"
        onClick={() => onEmptyCellClick?.(dayOfWeek, periodNumber)}
        className={cn(
          "flex min-h-[42px] w-full items-center justify-center rounded-md border border-dashed transition-colors active:scale-[0.98]",
          isCurrent
            ? "border-white/40 bg-white/10 text-white/80 active:bg-white/20"
            : "border-slate-200/90 bg-slate-50/60 text-slate-300 active:bg-slate-100 active:text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/25 dark:active:bg-slate-800",
        )}
        aria-label="Add lesson"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    );
  }

  return (
    <div className="flex min-h-[30px] w-full items-center justify-center" aria-hidden>
      <span className="text-[8px] text-slate-200 dark:text-slate-700">·</span>
    </div>
  );
}

export function countDayLessons(
  dayMap: Map<number, TimetableDay>,
  dayOfWeek: number,
): number {
  const day = dayMap.get(dayOfWeek);
  if (!day) return 0;
  return day.cells.filter((c) => c?.type === 'lesson' && c.lesson).length;
}

export { DAY_SHORT_NAMES };
