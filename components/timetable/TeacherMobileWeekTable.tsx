/**
 * TeacherMobileWeekTable — mobile week grid (Mon–Fri, no horizontal scroll)
 */

'use client';

import React, { useMemo } from 'react';
import { Check } from 'lucide-react';
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
} from '@/lib/timetable/constants';

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
  onLessonClick?: (
    lesson: TimetableLesson,
    dayOfWeek: number,
    periodNumber: number,
  ) => void;
};

export function TeacherMobileWeekTable({
  dayMap,
  timeSlots,
  breaks,
  currentDayOfWeek,
  currentPeriodIndex,
  completedLessonIds,
  onLessonClick,
}: TeacherMobileWeekTableProps) {
  const rows = useMemo(
    () => buildGridRows(timeSlots, breaks),
    [timeSlots, breaks],
  );

  if (rows.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-slate-500">No classes</p>
    );
  }

  return (
    <div className="min-h-0 min-w-0 flex-1 basis-0 overflow-x-hidden overflow-y-auto px-2 pb-2 pt-1.5">
      <table className="w-full max-w-full table-fixed border-separate border-spacing-0 text-[11px] leading-normal">
        <colgroup>
          <col style={{ width: '13%' }} />
          <col span={5} />
        </colgroup>
        <thead>
          <tr>
            <th
              className="sticky top-0 z-10 border-b border-slate-100 bg-white pb-1.5 pr-0.5 pt-1 text-left text-[10px] font-medium text-slate-400"
              scope="col"
            />
            {WEEKDAY_NUMBERS.map((day) => {
              const isToday = currentDayOfWeek === day;
              return (
                <th
                  key={day}
                  scope="col"
                  className={cn(
                    'sticky top-0 z-10 border-b border-slate-100 pb-1.5 pt-1 text-center text-[11px] font-semibold',
                    isToday ? 'bg-white text-emerald-600' : 'bg-white text-slate-400',
                  )}
                >
                  {DAY_SHORT_NAMES[day]}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) =>
            row.kind === 'break' ? (
              <BreakTableRow key={row.key} breakItem={row.breakItem} />
            ) : (
              <PeriodTableRow
                key={row.key}
                slot={row.slot}
                slotIndex={row.slotIndex}
                dayMap={dayMap}
                currentDayOfWeek={currentDayOfWeek}
                currentPeriodIndex={currentPeriodIndex}
                completedLessonIds={completedLessonIds}
                onLessonClick={onLessonClick}
              />
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

function BreakTableRow({ breakItem }: { breakItem: TimetableBreak }) {
  const config =
    BREAK_TYPE_CONFIG[breakItem.type as BreakType] || BREAK_TYPE_CONFIG.BREAK;
  const label = displayBreakName(breakItem.name, config.label);

  return (
    <tr>
      <td className="max-w-0 overflow-hidden border-b border-slate-100 py-1.5 pr-0.5 align-middle">
        <span className="block text-right font-mono text-[10px] tabular-nums text-slate-400">
          {breakItem.durationMinutes}m
        </span>
      </td>
      <td
        colSpan={WEEKDAY_NUMBERS.length}
        className="max-w-0 overflow-hidden border-b border-slate-100 bg-slate-50/80 py-1.5"
      >
        <p className="text-center text-[10px] font-medium text-slate-400">{label}</p>
      </td>
    </tr>
  );
}

function PeriodTableRow({
  slot,
  slotIndex,
  dayMap,
  currentDayOfWeek,
  currentPeriodIndex,
  completedLessonIds,
  onLessonClick,
}: {
  slot: TimetableSlot;
  slotIndex: number;
  dayMap: Map<number, TimetableDay>;
  currentDayOfWeek: number | null;
  currentPeriodIndex: number;
  completedLessonIds: string[];
  onLessonClick?: TeacherMobileWeekTableProps['onLessonClick'];
}) {
  const isCurrentPeriod = currentPeriodIndex === slotIndex;
  const start = slotTimeLabel(slot);
  const end = slotEndLabel(slot);

  return (
    <tr>
      <td className="max-w-0 overflow-hidden border-b border-slate-100 py-1 pr-0.5 align-middle">
        <div className="flex flex-col items-end leading-tight">
          <span
            className={cn(
              'font-mono text-[10px] font-semibold tabular-nums text-slate-700',
              isCurrentPeriod && 'text-emerald-600',
            )}
          >
            {start}
          </span>
          {end ? (
            <span className="font-mono text-[9px] tabular-nums text-slate-400">{end}</span>
          ) : null}
        </div>
      </td>
      {WEEKDAY_NUMBERS.map((dayOfWeek) => {
        const day = dayMap.get(dayOfWeek);
        const cell = day?.cells[slotIndex] ?? null;
        const isToday = currentDayOfWeek === dayOfWeek;
        const isCurrent = isToday && isCurrentPeriod;

        return (
          <td
            key={dayOfWeek}
            className={cn(
              'max-w-0 overflow-hidden border-b border-slate-100 p-0.5 align-top',
              isToday && 'bg-emerald-50/30',
            )}
          >
            <LessonCell
              cell={cell}
              dayOfWeek={dayOfWeek}
              periodNumber={slot.periodNumber}
              isCurrent={isCurrent}
              completedLessonIds={completedLessonIds}
              onLessonClick={onLessonClick}
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
  onLessonClick,
}: {
  cell: TimetableDay['cells'][number] | null;
  dayOfWeek: number;
  periodNumber: number;
  isCurrent: boolean;
  completedLessonIds: string[];
  onLessonClick?: TeacherMobileWeekTableProps['onLessonClick'];
}) {
  if (cell?.type === 'lesson' && cell.lesson) {
    const lesson = cell.lesson;
    const isCompleted = completedLessonIds.includes(lesson.id);

    return (
      <button
        type="button"
        onClick={() => onLessonClick?.(lesson, dayOfWeek, periodNumber)}
        className={cn(
          'flex w-full min-w-0 max-w-full flex-col rounded-sm border border-emerald-200/80 bg-emerald-50 px-1 py-1 text-left transition-transform active:scale-[0.98]',
          isCurrent && 'border-emerald-400 ring-1 ring-emerald-100',
          isCompleted && 'opacity-70',
        )}
      >
        <div className="flex items-start justify-between gap-0.5">
          <span
            className={cn(
              'break-words text-[10px] font-bold leading-snug text-emerald-950',
              isCompleted && 'line-through decoration-slate-400',
            )}
          >
            {lesson.subject.name}
          </span>
          {isCompleted && (
            <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-2 w-2" strokeWidth={3} />
            </span>
          )}
        </div>
        <span className="mt-0.5 break-words text-[9px] leading-tight text-emerald-800/70">
          {formatGradeShort(lesson.grade.displayName || '', lesson.grade.name)}
        </span>
      </button>
    );
  }

  return <div className="min-h-[1.5rem]" aria-hidden />;
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
