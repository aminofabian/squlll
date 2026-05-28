/**
 * TimetableGrid
 *
 * The shared timetable grid component used by Student, Teacher, and Admin views.
 * Supports responsive layouts, current-time indicators, and configurable rendering.
 */

'use client';

import React, { useMemo } from 'react';
import { Clock, MapPin, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  TimetableDay,
  TimetableSlot,
  TimetableLesson,
  TimetableBreak,
  TimetableViewType,
} from '@/lib/timetable/types';
import {
  getSubjectPaletteColor,
  BREAK_TYPE_CONFIG,
  WEEK_DAYS,
  DAY_NAMES,
  DAY_SHORT_NAMES,
} from '@/lib/timetable/constants';
import type { BreakType } from '@/lib/timetable/types';

// ─── Props ─────────────────────────────────────────────────────

interface TimetableGridProps {
  /** The timetable days to display */
  days: TimetableDay[];
  /** Sorted time slots */
  timeSlots: TimetableSlot[];
  /** Which perspective */
  viewType: TimetableViewType;
  /** For determining "current" styling */
  currentDayOfWeek: number | null;
  currentPeriodIndex: number;
  /** Which lesson IDs are completed */
  completedLessonIds?: string[];
  /** IDs of lessons that are the "next" upcoming lesson */
  nextLessonId?: string | null;
  /** Callback when a lesson cell is clicked */
  onLessonClick?: (lesson: TimetableLesson, dayOfWeek: number, periodNumber: number) => void;
  /** Callback when an empty slot is clicked */
  onEmptySlotClick?: (dayOfWeek: number, periodNumber: number) => void;
  /** Callback when a break cell is clicked */
  onBreakClick?: (breakItem: TimetableBreak) => void;
  /** For admin: show conflict indicators */
  conflictLessonIds?: Set<string>;
  /** Show "Add" buttons on empty slots (admin mode) */
  showAddButtons?: boolean;
  /** Custom class */
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────

export function TimetableGrid({
  days,
  timeSlots,
  viewType,
  currentDayOfWeek,
  currentPeriodIndex,
  completedLessonIds = [],
  nextLessonId,
  onLessonClick,
  onEmptySlotClick,
  onBreakClick,
  conflictLessonIds,
  showAddButtons = false,
  className,
}: TimetableGridProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [activeDayIndex, setActiveDayIndex] = React.useState(
    currentDayOfWeek ? currentDayOfWeek - 1 : 0
  );

  // Build a map: dayOfWeek -> day data
  const dayMap = useMemo(() => {
    const map = new Map<number, TimetableDay>();
    days.forEach(d => map.set(d.dayOfWeek, d));
    return map;
  }, [days]);

  // Build a lookup: lesson ID -> { dayOfWeek, periodIndex }
  const lessonPositionMap = useMemo(() => {
    const map = new Map<string, { dayOfWeek: number; periodIndex: number }>();
    days.forEach(day => {
      day.cells.forEach((cell, idx) => {
        if (cell?.type === 'lesson' && cell.lesson) {
          map.set(cell.lesson.id, { dayOfWeek: day.dayOfWeek, periodIndex: idx });
        }
      });
    });
    return map;
  }, [days]);

  const daysToShow = isMobile ? [activeDayIndex + 1] : [1, 2, 3, 4, 5];

  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden', className)}>
      {/* Mobile day switcher */}
      {isMobile && (
        <div className="flex items-center border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-2 py-1.5">
          {[0, 1, 2, 3, 4].map(idx => (
            <button
              key={idx}
              onClick={() => setActiveDayIndex(idx)}
              className={cn(
                'flex-1 py-2 text-xs font-semibold uppercase tracking-wide transition-colors rounded-md mx-0.5',
                activeDayIndex === idx
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {DAY_SHORT_NAMES[idx + 1]}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b-2 border-slate-200 dark:border-slate-600 sticky top-0 z-10">
              <th className="sticky left-0 z-20 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-r border-slate-200 dark:border-slate-600 p-2.5 text-left font-bold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wide w-[150px] min-w-[150px]">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Time</span>
                </div>
              </th>
              {daysToShow.map(dayOfWeek => (
                <th
                  key={dayOfWeek}
                  className={cn(
                    'border-r border-slate-200 dark:border-slate-600 last:border-r-0 p-2.5 text-center font-bold text-xs uppercase tracking-wide min-w-[120px]',
                    currentDayOfWeek === dayOfWeek
                      ? 'text-primary dark:text-primary-foreground bg-primary/5 dark:bg-primary/10'
                      : 'text-slate-700 dark:text-slate-200'
                  )}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span>{DAY_SHORT_NAMES[dayOfWeek]}</span>
                    {currentDayOfWeek === dayOfWeek && (
                      <div className="w-6 h-0.5 bg-primary rounded-full" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, slotIndex) => {
              const isCurrentPeriod = currentPeriodIndex === slotIndex;
              const isEven = slotIndex % 2 === 0;

              return (
                <React.Fragment key={slot.id}>
                  <tr
                    className={cn(
                      'group transition-colors',
                      isEven
                        ? 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                        : 'bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-750',
                      isCurrentPeriod && 'ring-1 ring-primary/20'
                    )}
                  >
                    {/* Time column */}
                    <td className="sticky left-0 z-10 border-r border-b border-slate-200 dark:border-slate-700 p-0">
                      <div
                        className={cn(
                          'relative p-2.5 min-w-[150px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 border-r-2 border-primary/20 dark:border-primary/30',
                          isCurrentPeriod && 'from-primary/20 via-primary/10 dark:from-primary/30 dark:via-primary/20'
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center justify-center w-5 h-5 rounded bg-primary/20 dark:bg-primary/30 flex-shrink-0">
                            <Clock className="h-3 w-3 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                              {slot.displayTime}
                            </div>
                            <div className="text-[10px] font-semibold text-primary dark:text-primary-foreground">
                              P{slot.periodNumber}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Day columns */}
                    {daysToShow.map(dayOfWeek => {
                      const day = dayMap.get(dayOfWeek);
                      const cell = day?.cells[slotIndex] ?? null;
                      const isCurrentCell = isCurrentPeriod && currentDayOfWeek === dayOfWeek;
                      const isCompleted = cell?.type === 'lesson' && cell.lesson
                        ? completedLessonIds.includes(cell.lesson.id)
                        : false;
                      const isNextLesson = cell?.type === 'lesson' && cell.lesson
                        ? nextLessonId === cell.lesson.id
                        : false;
                      const hasConflict = cell?.type === 'lesson' && cell.lesson
                        ? (conflictLessonIds?.has(cell.lesson.id) ?? false)
                        : false;

                      return (
                        <td
                          key={dayOfWeek}
                          className="border-r border-b border-slate-200 dark:border-slate-700 last:border-r-0 p-1.5 align-top"
                        >
                          {cell?.type === 'lesson' && cell.lesson ? (
                            <LessonCell
                              lesson={cell.lesson}
                              isCurrent={isCurrentCell}
                              isCompleted={isCompleted}
                              isNext={isNextLesson}
                              hasConflict={hasConflict}
                              viewType={viewType}
                              onClick={() => onLessonClick?.(cell.lesson!, dayOfWeek, slot.periodNumber)}
                            />
                          ) : cell?.type === 'break' && cell.break ? (
                            <BreakCell
                              breakItem={cell.break}
                              onClick={() => onBreakClick?.(cell.break!)}
                            />
                          ) : showAddButtons ? (
                            <EmptyCell
                              onClick={() => onEmptySlotClick?.(dayOfWeek, slot.periodNumber)}
                            />
                          ) : (
                            <FreeCell />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function LessonCell({
  lesson,
  isCurrent,
  isCompleted,
  isNext,
  hasConflict,
  viewType,
  onClick,
}: {
  lesson: TimetableLesson;
  isCurrent: boolean;
  isCompleted: boolean;
  isNext: boolean;
  hasConflict: boolean;
  viewType: TimetableViewType;
  onClick?: () => void;
}) {
  const palette = getSubjectPaletteColor(lesson.subject.name);

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative group/lesson cursor-pointer rounded-md p-2 transition-all duration-200 border-l-4',
        palette.border,
        isCurrent
          ? 'bg-primary text-white shadow-lg scale-[1.02] ring-2 ring-primary/20'
          : isCompleted
            ? 'bg-gray-100 dark:bg-gray-800 opacity-60'
            : isNext
              ? `${palette.bg} shadow-md border-primary/50`
              : `${palette.bg} hover:shadow-md hover:scale-[1.01]`,
        hasConflict && 'ring-2 ring-red-400',
        onClick && 'cursor-pointer'
      )}
    >
      {/* Subject name */}
      <div className={cn(
        'font-bold text-xs leading-tight mb-1',
        isCurrent ? 'text-white' : 'text-slate-900 dark:text-slate-100'
      )}>
        {lesson.subject.name}
        {lesson.isDoublePeriod && (
          <span className="ml-1 text-[10px] opacity-60">(2x)</span>
        )}
      </div>

      {/* Teacher */}
      <div className={cn(
        'flex items-center gap-1 text-[11px]',
        isCurrent ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'
      )}>
        <Users className="h-3 w-3 flex-shrink-0" />
        <span className="truncate">
          {lesson.teacher.name}
          {lesson.isSubstitution && (
            <span className="text-[10px] text-amber-400 font-medium ml-0.5">Sub</span>
          )}
        </span>
      </div>

      {/* Room */}
      {lesson.room && (
        <div className={cn(
          'flex items-center gap-1 text-[10px] mt-0.5',
          isCurrent ? 'text-white/70' : 'text-slate-500 dark:text-slate-500'
        )}>
          <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
          <span>Room {lesson.room}</span>
        </div>
      )}

      {/* Indicators */}
      <div className="absolute top-1 right-1 flex items-center gap-0.5">
        {isCurrent && (
          <span className="text-[9px] bg-white/20 text-white px-1 py-0.5 rounded font-bold animate-pulse">
            NOW
          </span>
        )}
        {isNext && !isCurrent && (
          <span className="text-[9px] bg-primary/20 text-primary px-1 py-0.5 rounded font-bold">
            NEXT
          </span>
        )}
        {isCompleted && (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        )}
        {hasConflict && (
          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
        )}
        {lesson.isCancelled && (
          <span className="text-[9px] bg-red-100 text-red-700 px-1 py-0.5 rounded font-bold">
            CANCELLED
          </span>
        )}
      </div>
    </div>
  );
}

function BreakCell({
  breakItem,
  onClick,
}: {
  breakItem: TimetableBreak;
  onClick?: () => void;
}) {
  const config = BREAK_TYPE_CONFIG[breakItem.type as BreakType] || BREAK_TYPE_CONFIG.BREAK;

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-md p-2 border-2 text-center transition-all duration-200',
        config.bgClass,
        config.borderClass,
        onClick && 'cursor-pointer hover:shadow-md'
      )}
    >
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-lg">{config.icon}</span>
        <span className={cn('text-[10px] font-bold uppercase', config.textClass)}>
          {breakItem.name || config.label}
        </span>
        <span className={cn('text-[9px] font-medium', config.textClass)}>
          {breakItem.durationMinutes}m
        </span>
      </div>
    </div>
  );
}

function FreeCell() {
  return (
    <div className="w-full min-h-[70px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-md">
      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase">
        Free
      </span>
    </div>
  );
}

function EmptyCell({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full min-h-[70px] flex items-center justify-center gap-1 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-md hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-[10px] text-slate-400 dark:text-slate-500 font-medium"
    >
      <span className="text-lg">+</span>
      <span>Add</span>
    </button>
  );
}

export default TimetableGrid;
