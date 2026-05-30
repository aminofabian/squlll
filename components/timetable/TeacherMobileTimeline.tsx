/**
 * TeacherMobileTimeline — compact mobile day schedule
 */

'use client';

import React, { useMemo } from 'react';
import {
  Check,
  Coffee,
  GraduationCap,
  UtensilsCrossed,
  Sun,
  ClipboardList,
} from 'lucide-react';
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

const WEEKDAY_NUMBERS = [1, 2, 3, 4, 5] as const;

function trimHourLabel(time: string): string {
  return time.replace(/^0(\d)/, '$1').trim();
}

function slotTimes(slot: TimetableSlot): { start: string; end: string } {
  if (slot.startTime && slot.endTime) {
    return {
      start: trimHourLabel(slot.startTime),
      end: trimHourLabel(slot.endTime),
    };
  }
  const raw = slot.displayTime?.trim() ?? '';
  const parts = raw.split(/\s*[-–—]\s*/);
  if (parts.length >= 2) {
    return { start: trimHourLabel(parts[0]), end: trimHourLabel(parts[1]) };
  }
  return { start: raw || '—', end: '' };
}

function breakTimes(breakItem: TimetableBreak): { start: string; end: string } {
  if (breakItem.startTime && breakItem.endTime) {
    return {
      start: trimHourLabel(breakItem.startTime),
      end: trimHourLabel(breakItem.endTime),
    };
  }
  return { start: '', end: '' };
}

function formatBreakLabel(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'Break';
  const lower = trimmed.toLowerCase();
  if (lower === 'break') return 'Short break';
  return lower.replace(/\b\w/g, (c) => c.toUpperCase());
}

function getBreakLucideIcon(type: BreakType) {
  switch (type) {
    case 'LUNCH':
      return UtensilsCrossed;
    case 'RECESS':
      return Sun;
    case 'ASSEMBLY':
      return GraduationCap;
    case 'EXAM':
      return ClipboardList;
    default:
      return Coffee;
  }
}

function breakTone(type: BreakType) {
  switch (type) {
    case 'ASSEMBLY':
      return 'bg-violet-100/90 text-violet-800';
    case 'LUNCH':
      return 'bg-orange-100/90 text-orange-900';
    case 'RECESS':
      return 'bg-sky-100/90 text-sky-800';
    default:
      return 'bg-blue-100/90 text-blue-800';
  }
}

type RowItem =
  | { kind: 'break'; key: string; breakItem: TimetableBreak }
  | {
      kind: 'lesson';
      key: string;
      slot: TimetableSlot;
      lesson: TimetableLesson;
      isCurrent: boolean;
      isCompleted: boolean;
    };

function buildDayRows(
  day: TimetableDay | undefined,
  timeSlots: TimetableSlot[],
  breaks: TimetableBreak[],
  dayOfWeek: number,
  isToday: boolean,
  currentPeriodIndex: number,
  completedLessonIds: string[],
): RowItem[] {
  const rows: RowItem[] = [];

  const pushBreak = (afterPeriod: number) => {
    const rowBreaks = breaks.filter((b) => b.afterPeriod === afterPeriod);
    const dayBreak =
      rowBreaks.find((b) => b.dayOfWeek === dayOfWeek) ?? rowBreaks[0];
    if (!dayBreak) return;
    rows.push({ kind: 'break', key: `break-${afterPeriod}`, breakItem: dayBreak });
  };

  if (breaks.some((b) => b.afterPeriod === 0)) pushBreak(0);

  timeSlots.forEach((slot, slotIndex) => {
    const cell = day?.cells[slotIndex] ?? null;
    if (cell?.type === 'lesson' && cell.lesson) {
      rows.push({
        kind: 'lesson',
        key: slot.id,
        slot,
        lesson: cell.lesson,
        isCurrent: isToday && currentPeriodIndex === slotIndex,
        isCompleted: completedLessonIds.includes(cell.lesson.id),
      });
    }
    if (breaks.some((b) => b.afterPeriod === slot.periodNumber)) {
      pushBreak(slot.periodNumber);
    }
  });

  return rows;
}

function TimeRail({
  start,
  end,
  isCurrent,
}: {
  start: string;
  end: string;
  isCurrent?: boolean;
}) {
  return (
    <div className="flex w-10 shrink-0 flex-col items-end justify-center pr-1.5 text-right leading-none">
      <span
        className={cn(
          'font-mono text-[11px] font-semibold tabular-nums',
          isCurrent ? 'text-primary' : 'text-slate-600',
        )}
      >
        {start}
      </span>
      {end ? (
        <span className="mt-0.5 font-mono text-[10px] tabular-nums text-slate-400">
          {end}
        </span>
      ) : null}
    </div>
  );
}

export type TeacherMobileTimelineProps = {
  dayOfWeek: number;
  dayMap: Map<number, TimetableDay>;
  timeSlots: TimetableSlot[];
  breaks: TimetableBreak[];
  currentDayOfWeek: number | null;
  currentPeriodIndex: number;
  completedLessonIds: string[];
  fillHeight?: boolean;
  onLessonClick?: (
    lesson: TimetableLesson,
    dayOfWeek: number,
    periodNumber: number,
  ) => void;
};

export function TeacherMobileTimeline({
  dayOfWeek,
  dayMap,
  timeSlots,
  breaks,
  currentDayOfWeek,
  currentPeriodIndex,
  completedLessonIds,
  fillHeight = false,
  onLessonClick,
}: TeacherMobileTimelineProps) {
  const day = dayMap.get(dayOfWeek);
  const isToday = currentDayOfWeek === dayOfWeek;

  const rows = useMemo(
    () =>
      buildDayRows(
        day,
        timeSlots,
        breaks,
        dayOfWeek,
        isToday,
        currentPeriodIndex,
        completedLessonIds,
      ),
    [
      day,
      timeSlots,
      breaks,
      dayOfWeek,
      isToday,
      currentPeriodIndex,
      completedLessonIds,
    ],
  );

  if (rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <p className="text-center text-sm text-slate-500">
          No classes on {DAY_SHORT_NAMES[dayOfWeek]}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative',
        fillHeight
          ? 'flex h-full min-h-0 flex-col gap-1'
          : 'space-y-1.5 py-1',
      )}
      aria-label={`${DAY_SHORT_NAMES[dayOfWeek]} schedule`}
    >
      <div
        className="pointer-events-none absolute bottom-0 left-[2.35rem] top-0 w-px bg-slate-200"
        aria-hidden
      />
      {rows.map((row) => (
        <ScheduleRow
          key={row.key}
          row={row}
          dayOfWeek={dayOfWeek}
          fillHeight={fillHeight}
          onLessonClick={onLessonClick}
        />
      ))}
    </div>
  );
}

function ScheduleRow({
  row,
  dayOfWeek,
  fillHeight,
  onLessonClick,
}: {
  row: RowItem;
  dayOfWeek: number;
  fillHeight?: boolean;
  onLessonClick?: TeacherMobileTimelineProps['onLessonClick'];
}) {
  const shell = cn(
    'flex min-h-0 items-stretch',
    fillHeight && 'min-h-[2rem] flex-1 basis-0',
  );

  if (row.kind === 'break') {
    const config =
      BREAK_TYPE_CONFIG[row.breakItem.type as BreakType] ||
      BREAK_TYPE_CONFIG.BREAK;
    const label = formatBreakLabel(row.breakItem.name || config.label);
    const Icon = getBreakLucideIcon(row.breakItem.type as BreakType);
    const tone = breakTone(row.breakItem.type as BreakType);
    const { start, end } = breakTimes(row.breakItem);

    return (
      <div className={shell}>
        <TimeRail start={start || '—'} end={end} />
        <div className="flex min-w-0 flex-1 items-center py-0.5">
          <div
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5',
              tone,
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-75" strokeWidth={2} />
            <span className="min-w-0 flex-1 truncate text-xs font-semibold">
              {label}
            </span>
            <span className="shrink-0 text-[10px] font-medium tabular-nums opacity-80">
              {row.breakItem.durationMinutes}m
            </span>
          </div>
        </div>
      </div>
    );
  }

  const { lesson, slot, isCurrent, isCompleted } = row;
  const palette = getSubjectPaletteColor(normalizeSubjectName(lesson.subject.name));
  const { start, end } = slotTimes(slot);
  const gradeLabel = lesson.grade.displayName || lesson.grade.name;
  const stream = lesson.stream?.trim();
  const classLine =
    stream && !gradeLabel.toLowerCase().includes(stream.toLowerCase())
      ? `${gradeLabel} · ${stream}`
      : gradeLabel;

  return (
    <div className={shell}>
      <TimeRail start={start} end={end} isCurrent={isCurrent} />
      <div className="flex min-w-0 flex-1 items-center py-0.5">
        <button
          type="button"
          onClick={() => onLessonClick?.(lesson, dayOfWeek, slot.periodNumber)}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left transition-colors active:bg-slate-50',
            fillHeight && 'min-h-0 h-full',
            isCurrent && 'border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20',
            isCompleted && 'opacity-75',
          )}
          style={{ borderLeftWidth: 3, borderLeftColor: palette.accent }}
        >
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'truncate text-xs font-bold text-slate-900',
                isCompleted && 'line-through decoration-slate-400',
              )}
            >
              {lesson.subject.name}
            </p>
            <p className="truncate text-[10px] text-slate-500">{classLine}</p>
          </div>
          <span
            className={cn(
              'flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
              isCompleted
                ? 'bg-emerald-100 text-emerald-700'
                : isCurrent
                  ? 'bg-primary/15 text-primary'
                  : 'text-slate-500',
            )}
          >
            <Check className="h-3 w-3" strokeWidth={2.5} />
            {isCompleted ? 'Done' : 'Taught'}
          </span>
        </button>
      </div>
    </div>
  );
}

export function TeacherMobileDayPill({
  label,
  isActive,
  isToday,
  onClick,
}: {
  label: string;
  isActive: boolean;
  isToday?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        'flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all',
        isActive
          ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
          : 'text-slate-500',
        isToday && !isActive && 'text-slate-700',
      )}
    >
      {label}
    </button>
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

export { WEEKDAY_NUMBERS, DAY_SHORT_NAMES };
