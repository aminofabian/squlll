/**
 * TeacherMobileDayView — single-day vertical timeline for mobile
 */

'use client';

import React, { useMemo } from 'react';
import { Check, CalendarX2 } from 'lucide-react';
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
  DAY_NAMES,
} from '@/lib/timetable/constants';
import { formatGradeShort } from './TeacherMobileWeekTable';

export const WEEKDAY_NUMBERS = [1, 2, 3, 4, 5] as const;

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

type TimelineItem =
  | {
      kind: 'lesson';
      key: string;
      slotIndex: number;
      periodNumber: number;
      time: { start: string; end: string };
      lesson: TimetableLesson;
    }
  | {
      kind: 'break';
      key: string;
      time: { start: string; end: string };
      breakItem: TimetableBreak;
    };

function buildTimelineItems(
  day: TimetableDay | undefined,
  timeSlots: TimetableSlot[],
  breaks: TimetableBreak[],
): TimelineItem[] {
  const items: TimelineItem[] = [];

  const pushBreak = (afterPeriod: number) => {
    const b = breaks.find((br) => br.afterPeriod === afterPeriod);
    if (!b) return;
    const time =
      b.startTime && b.endTime
        ? {
            start: trimHourLabel(b.startTime),
            end: trimHourLabel(b.endTime),
          }
        : { start: '', end: '' };
    items.push({ kind: 'break', key: `break-${afterPeriod}`, time, breakItem: b });
  };

  if (breaks.some((b) => b.afterPeriod === 0)) pushBreak(0);

  timeSlots.forEach((slot, slotIndex) => {
    const cell = day?.cells[slotIndex];
    if (cell?.type === 'lesson' && cell.lesson) {
      items.push({
        kind: 'lesson',
        key: slot.id,
        slotIndex,
        periodNumber: slot.periodNumber,
        time: slotTimes(slot),
        lesson: cell.lesson,
      });
    }
    if (breaks.some((b) => b.afterPeriod === slot.periodNumber)) {
      pushBreak(slot.periodNumber);
    }
  });

  return items;
}

export type TeacherMobileDayViewProps = {
  dayOfWeek: number;
  day?: TimetableDay;
  timeSlots: TimetableSlot[];
  breaks: TimetableBreak[];
  currentDayOfWeek: number | null;
  currentPeriodIndex: number;
  completedLessonIds: string[];
  onLessonClick?: (lesson: TimetableLesson, periodNumber: number) => void;
};

export function TeacherMobileDayView({
  dayOfWeek,
  day,
  timeSlots,
  breaks,
  currentDayOfWeek,
  currentPeriodIndex,
  completedLessonIds,
  onLessonClick,
}: TeacherMobileDayViewProps) {
  const items = useMemo(
    () => buildTimelineItems(day, timeSlots, breaks),
    [day, timeSlots, breaks],
  );

  const isToday = currentDayOfWeek === dayOfWeek;
  const dayLabel = DAY_NAMES[dayOfWeek]?.toUpperCase() ?? 'DAY';

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <CalendarX2 className="h-5 w-5 text-slate-400" strokeWidth={1.75} />
        </div>
        <p className="text-sm font-semibold text-slate-700">
          No classes on {DAY_NAMES[dayOfWeek]}
        </p>
        <p className="mt-1 text-xs text-slate-400">Pick another day above</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3">
      <p className="mb-3 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {dayLabel} classes
      </p>

      <div className="space-y-3">
        {items.map((item) =>
          item.kind === 'break' ? (
            <BreakDivider key={item.key} breakItem={item.breakItem} />
          ) : (
            <LessonRow
              key={item.key}
              lesson={item.lesson}
              time={item.time}
              isCurrent={isToday && currentPeriodIndex === item.slotIndex}
              isCompleted={completedLessonIds.includes(item.lesson.id)}
              onClick={() => onLessonClick?.(item.lesson, item.periodNumber)}
            />
          ),
        )}
      </div>
    </div>
  );
}

function BreakDivider({ breakItem }: { breakItem: TimetableBreak }) {
  const config =
    BREAK_TYPE_CONFIG[breakItem.type as BreakType] || BREAK_TYPE_CONFIG.BREAK;
  const name = breakItem.name?.trim() || config.label;

  return (
    <div className="relative py-1">
      <div className="border-t border-dashed border-slate-200" aria-hidden />
      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] font-medium text-slate-400">
        {name} · {breakItem.durationMinutes} min
      </p>
    </div>
  );
}

function LessonRow({
  lesson,
  time,
  isCurrent,
  isCompleted,
  onClick,
}: {
  lesson: TimetableLesson;
  time: { start: string; end: string };
  isCurrent: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) {
  const grade = formatGradeShort(
    lesson.grade.displayName || '',
    lesson.grade.name,
  );

  return (
    <div className="flex gap-3">
      <div className="flex w-11 shrink-0 flex-col items-end pt-3">
        <span className="font-mono text-xs font-bold tabular-nums leading-none text-slate-900">
          {time.start}
        </span>
        {time.end ? (
          <span className="mt-0.5 font-mono text-[10px] tabular-nums text-slate-400">
            {time.end}
          </span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onClick}
        className={cn(
          'min-w-0 flex-1 rounded-xl border-l-4 bg-emerald-50/80 py-2.5 pl-3 pr-3 text-left transition-transform active:scale-[0.99]',
          isCurrent
            ? 'border-emerald-600 shadow-sm ring-1 ring-emerald-200'
            : 'border-emerald-500',
          isCompleted && 'opacity-75',
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={cn(
                'break-words text-sm font-bold text-emerald-950',
                isCompleted && 'line-through decoration-slate-400',
              )}
            >
              {lesson.subject.name}
            </p>
            <p className="mt-0.5 break-words text-xs text-emerald-800/70">{grade}</p>
          </div>
          {isCompleted && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-3 w-3" strokeWidth={2.5} />
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

export function TeacherMobileDayPill({
  label,
  isActive,
  isToday,
  lessonCount,
  onClick,
}: {
  label: string;
  isActive: boolean;
  isToday?: boolean;
  lessonCount?: number;
  onClick: () => void;
}) {
  const count = lessonCount ?? 0;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        'relative flex flex-1 flex-col items-center gap-1 rounded-xl border py-2 transition-all',
        isActive
          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
          : 'border-slate-200/80 bg-white text-slate-700',
      )}
    >
      <span className="text-xs font-semibold leading-none">
        {label}
        {count > 0 ? ` ${count}` : ''}
      </span>
      {count > 0 && (
        <span className="flex gap-0.5" aria-hidden>
          {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1 w-1 rounded-full',
                isActive ? 'bg-white/80' : 'bg-emerald-500',
              )}
            />
          ))}
        </span>
      )}
      {isToday && !isActive && (
        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-500" aria-hidden />
      )}
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
