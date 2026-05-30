/**
 * TimetableGrid
 *
 * The shared timetable grid component used by Student, Teacher, and Admin views.
 * Supports responsive layouts, current-time indicators, and configurable rendering.
 */

'use client';

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Clock, MapPin, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import type {
  TimetableDay,
  TimetableSlot,
  TimetableLesson,
  TimetableBreak,
  TimetableViewType,
} from '@/lib/timetable/types';
import {
  getSubjectPaletteColor,
  normalizeSubjectName,
  BREAK_TYPE_CONFIG,
  DAY_SHORT_NAMES,
} from '@/lib/timetable/constants';
import type { BreakType } from '@/lib/timetable/types';
import { TeacherMobileTimeline } from './TeacherMobileTimeline';
import {
  TeacherMobileDayPill,
  countDayLessons,
} from './TeacherMobileDayView';

const WEEKDAY_NUMBERS = [1, 2, 3, 4, 5] as const;

/** Sticky time rail — admin / non-teacher mobile table */
const STICKY_TIME_CELL = cn(
  'sticky left-0 z-30 border-r border-slate-200/90 bg-slate-50 dark:border-slate-700/90 dark:bg-slate-900',
  'shadow-[2px_0_6px_-2px_rgba(15,23,42,0.08)] dark:shadow-[2px_0_6px_-2px_rgba(0,0,0,0.35)]',
);

function trimHourLabel(time: string): string {
  return time.replace(/^0(\d)/, '$1').trim();
}

/** Compact range for the period rail, e.g. 8:15–9:00 */
function formatPeriodTimeLabel(slot: TimetableSlot): string {
  if (slot.startTime && slot.endTime) {
    return `${trimHourLabel(slot.startTime)}–${trimHourLabel(slot.endTime)}`;
  }
  const raw = slot.displayTime?.trim();
  if (!raw) return `Period ${slot.periodNumber}`;
  return raw
    .replace(/\s*[-–—]\s*/g, '–')
    .replace(/\b0(\d):/g, '$1:');
}

function formatBreakTimeLabel(
  start?: string,
  end?: string,
  durationMinutes?: number,
): string {
  if (start && end) {
    return `${trimHourLabel(start)}–${trimHourLabel(end)}`;
  }
  if (durationMinutes) return `${durationMinutes} min`;
  return '';
}

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
  /** School breaks rendered as rows after the matching period */
  breaks?: TimetableBreak[];
  /** Denser rows and padding (teacher quick-scan) */
  compact?: boolean;
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
  breaks = [],
  compact = false,
  className,
}: TimetableGridProps) {
  const isMobile = useIsMobile();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeDayIndex, setActiveDayIndex] = useState(() =>
    currentDayOfWeek && currentDayOfWeek >= 1 && currentDayOfWeek <= 5
      ? currentDayOfWeek - 1
      : 0,
  );

  const dayMap = useMemo(() => {
    const map = new Map<number, TimetableDay>();
    days.forEach(d => map.set(d.dayOfWeek, d));
    return map;
  }, [days]);

  const isTeacherCompact = compact && viewType === 'teacher';

  const thPad = compact ? 'px-2 py-1.5' : 'p-2.5';
  const tdPad = compact ? 'px-1 py-0.5' : 'p-1.5';
  const timeMinW = isTeacherCompact
    ? 'min-w-[92px] w-[92px]'
    : compact
      ? 'min-w-[108px] w-[108px]'
      : 'min-w-[150px] w-[150px]';

  const scrollToDayIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const clamped = Math.min(4, Math.max(0, index));
    setActiveDayIndex(clamped);
    const el = carouselRef.current;
    if (el && el.clientWidth > 0) {
      el.scrollTo({ left: clamped * el.clientWidth, behavior });
    }
  }, []);

  useEffect(() => {
    if (!isMobile || !currentDayOfWeek || currentDayOfWeek < 1 || currentDayOfWeek > 5) {
      return;
    }
    scrollToDayIndex(currentDayOfWeek - 1, 'auto');
  }, [isMobile, currentDayOfWeek, scrollToDayIndex]);

  const handleCarouselScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el || el.clientWidth <= 0) return;
    const index = Math.min(
      4,
      Math.max(0, Math.round(el.scrollLeft / el.clientWidth)),
    );
    setActiveDayIndex((prev) => (prev === index ? prev : index));
  }, []);

  const tableProps = {
    dayMap,
    timeSlots,
    breaks,
    compact,
    isTeacherCompact,
    currentDayOfWeek,
    currentPeriodIndex,
    completedLessonIds,
    nextLessonId,
    viewType,
    onLessonClick,
    onEmptySlotClick,
    onBreakClick,
    conflictLessonIds,
    showAddButtons,
    thPad,
    tdPad,
    timeMinW,
  };

  return (
    <div className={cn(
      'overflow-hidden',
      isTeacherCompact
        ? 'bg-transparent'
        : 'rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800',
      compact && !isTeacherCompact && 'shadow-sm',
      className,
    )}>
      {isMobile && (
        <div
          className={cn(
            'border-b px-2 py-2.5',
            isTeacherCompact
              ? 'border-slate-200/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'
              : 'border-slate-200 bg-slate-50 px-1.5 py-1.5 dark:border-slate-700 dark:bg-slate-800/50',
          )}
          role="tablist"
          aria-label="Day of week"
        >
          <div className="flex items-center gap-1">
            {WEEKDAY_NUMBERS.map((dayNum, idx) =>
              isTeacherCompact ? (
                <TeacherMobileDayPill
                  key={dayNum}
                  label={DAY_SHORT_NAMES[dayNum]}
                  lessonCount={countDayLessons(dayMap, dayNum)}
                  isActive={activeDayIndex === idx}
                  isToday={currentDayOfWeek === dayNum}
                  onClick={() => scrollToDayIndex(idx)}
                />
              ) : (
                <button
                  key={dayNum}
                  type="button"
                  role="tab"
                  aria-selected={activeDayIndex === idx}
                  onClick={() => scrollToDayIndex(idx)}
                  className={cn(
                    'flex-1 rounded-md py-2 text-xs font-semibold transition-colors',
                    activeDayIndex === idx
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:bg-slate-700',
                  )}
                >
                  {DAY_SHORT_NAMES[dayNum]}
                </button>
              ),
            )}
          </div>
          {isTeacherCompact && (
            <p className="mt-2 px-1 text-center text-[10px] text-slate-400 dark:text-slate-500">
              Swipe for other days · tap a class to mark taught
            </p>
          )}
        </div>
      )}

      {isMobile ? (
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain scroll-smooth scrollbar-none touch-pan-x"
          aria-label="Swipe between days"
        >
          {WEEKDAY_NUMBERS.map((dayOfWeek) => (
            <div
              key={dayOfWeek}
              className="w-full shrink-0 snap-start snap-always"
            >
              {isTeacherCompact ? (
                <TeacherMobileTimeline
                  dayOfWeek={dayOfWeek}
                  dayMap={dayMap}
                  timeSlots={timeSlots}
                  breaks={breaks}
                  currentDayOfWeek={currentDayOfWeek}
                  currentPeriodIndex={currentPeriodIndex}
                  completedLessonIds={completedLessonIds}
                  onLessonClick={onLessonClick}
                />
              ) : (
                <div className="max-h-[min(65dvh,520px)] overflow-y-auto overscroll-y-contain">
                  <TimetableGridTable
                    {...tableProps}
                    daysToShow={[dayOfWeek]}
                    mobileLayout
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <TimetableGridTable
            {...tableProps}
            daysToShow={[...WEEKDAY_NUMBERS]}
          />
        </div>
      )}
    </div>
  );
}

type TimetableGridTableProps = {
  daysToShow: number[];
  dayMap: Map<number, TimetableDay>;
  timeSlots: TimetableSlot[];
  breaks: TimetableBreak[];
  compact: boolean;
  isTeacherCompact: boolean;
  currentDayOfWeek: number | null;
  currentPeriodIndex: number;
  completedLessonIds: string[];
  nextLessonId?: string | null;
  viewType: TimetableViewType;
  onLessonClick?: TimetableGridProps['onLessonClick'];
  onEmptySlotClick?: TimetableGridProps['onEmptySlotClick'];
  onBreakClick?: TimetableGridProps['onBreakClick'];
  conflictLessonIds?: Set<string>;
  showAddButtons: boolean;
  thPad: string;
  tdPad: string;
  timeMinW: string;
  mobileLayout?: boolean;
};

function TimetableGridTable({
  daysToShow,
  dayMap,
  timeSlots,
  breaks,
  compact,
  isTeacherCompact,
  currentDayOfWeek,
  currentPeriodIndex,
  completedLessonIds,
  nextLessonId,
  viewType,
  onLessonClick,
  onEmptySlotClick,
  onBreakClick,
  conflictLessonIds,
  showAddButtons,
  thPad,
  tdPad,
  timeMinW,
  mobileLayout = false,
}: TimetableGridTableProps) {
  return (
        <table
          className={cn(
            'w-full border-collapse',
            mobileLayout ? 'min-w-0 table-fixed' : 'min-w-[600px]',
          )}
        >
          <thead>
            <tr
              className={cn(
                'border-b border-slate-200 dark:border-slate-600',
                mobileLayout
                  ? 'bg-white dark:bg-slate-800'
                  : cn(
                      'sticky top-0 z-10',
                      isTeacherCompact
                        ? 'bg-slate-50/95 backdrop-blur-sm dark:bg-slate-800/95'
                        : 'border-b-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700',
                    ),
              )}
            >
              <th
                className={cn(
                  'text-left',
                  mobileLayout
                    ? cn(STICKY_TIME_CELL, 'sticky top-0 z-40', thPad, timeMinW)
                    : cn(
                        'sticky left-0 z-20 border-r',
                        isTeacherCompact
                          ? 'border-slate-200/90 bg-slate-100/95 dark:border-slate-700 dark:bg-slate-900/95'
                          : 'border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 dark:border-slate-600 dark:from-slate-800 dark:to-slate-700',
                        timeMinW,
                        thPad,
                      ),
                )}
                scope="col"
              >
                <span
                  className={cn(
                    'font-semibold text-slate-500 dark:text-slate-400',
                    isTeacherCompact ? 'text-[10px]' : 'text-xs uppercase tracking-wide',
                  )}
                >
                  {isTeacherCompact ? 'When' : 'Time'}
                </span>
              </th>
              {daysToShow.map(dayOfWeek => (
                <th
                  key={dayOfWeek}
                  className={cn(
                    'border-r border-slate-200/90 dark:border-slate-600/90 last:border-r-0 text-center',
                    mobileLayout &&
                      'sticky top-0 z-20 bg-white dark:bg-slate-800',
                    mobileLayout
                      ? 'p-1.5 text-[10px]'
                      : isTeacherCompact
                        ? 'min-w-0 p-1.5 text-[11px] font-semibold'
                        : compact
                          ? 'min-w-[88px] p-1.5 text-[10px] font-bold uppercase tracking-wide'
                          : 'min-w-[120px] p-2.5 text-xs font-bold uppercase tracking-wide',
                    currentDayOfWeek === dayOfWeek
                      ? isTeacherCompact
                        ? 'bg-primary/[0.08] text-primary dark:bg-primary/12'
                        : 'text-primary dark:text-primary-foreground bg-primary/5 dark:bg-primary/10'
                      : 'text-slate-600 dark:text-slate-300',
                  )}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span>{DAY_SHORT_NAMES[dayOfWeek]}</span>
                    {currentDayOfWeek === dayOfWeek && isTeacherCompact && (
                      <span className="text-[8px] font-medium text-primary/80">
                        Today
                      </span>
                    )}
                    {currentDayOfWeek === dayOfWeek && !isTeacherCompact && (
                      <div className="h-0.5 w-6 rounded-full bg-primary" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {breaks.some((b) => b.afterPeriod === 0) && (
              <TimetableBreakRow
                afterPeriod={0}
                breaks={breaks}
                daysToShow={daysToShow}
                compact={compact}
                timeMinW={timeMinW}
                tdPad={tdPad}
                isTeacherCompact={isTeacherCompact}
                mobileLayout={mobileLayout}
              />
            )}
            {timeSlots.map((slot, slotIndex) => {
              const isCurrentPeriod = currentPeriodIndex === slotIndex;
              const isEven = slotIndex % 2 === 0;
              const breaksAfterPeriod = breaks.filter(
                (b) => b.afterPeriod === slot.periodNumber,
              );

              return (
                <React.Fragment key={slot.id}>
                  <tr
                    className={cn(
                      'group transition-colors',
                      isTeacherCompact
                        ? isCurrentPeriod
                          ? 'bg-primary/[0.04] dark:bg-primary/[0.08]'
                          : isEven
                            ? 'bg-white dark:bg-slate-800'
                            : 'bg-slate-50/40 dark:bg-slate-800/60'
                        : cn(
                            isEven
                              ? 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                              : 'bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-750',
                            isCurrentPeriod && 'ring-1 ring-primary/20',
                          ),
                    )}
                  >
                    <td
                      className={cn(
                        'border-b border-slate-200/90 p-0 dark:border-slate-700/90',
                        mobileLayout
                          ? cn(STICKY_TIME_CELL, 'z-30')
                          : 'sticky left-0 z-10 border-r',
                      )}
                    >
                      {isTeacherCompact ? (
                        <PeriodTimeRail
                          slot={slot}
                          isCurrent={isCurrentPeriod}
                          className={timeMinW}
                        />
                      ) : (
                        <PeriodTimeRailLegacy
                          slot={slot}
                          isCurrent={isCurrentPeriod}
                          compact={compact}
                          className={timeMinW}
                        />
                      )}
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
                          className={cn(
                            'border-r border-b border-slate-200/80 dark:border-slate-700/80 last:border-r-0 align-top',
                            tdPad,
                            isTeacherCompact && currentDayOfWeek === dayOfWeek && 'bg-primary/[0.03]',
                          )}
                        >
                          {cell?.type === 'lesson' && cell.lesson ? (
                            <LessonCell
                              lesson={cell.lesson}
                              isCurrent={isCurrentCell}
                              isCompleted={isCompleted}
                              isNext={isNextLesson}
                              hasConflict={hasConflict}
                              viewType={viewType}
                              compact={compact}
                              onClick={() => onLessonClick?.(cell.lesson!, dayOfWeek, slot.periodNumber)}
                            />
                          ) : cell?.type === 'break' && cell.break ? (
                            <BreakCell
                              breakItem={cell.break}
                              compact={compact}
                              onClick={() => onBreakClick?.(cell.break!)}
                            />
                          ) : showAddButtons ? (
                            <EmptyCell
                              compact={compact}
                              onClick={() => onEmptySlotClick?.(dayOfWeek, slot.periodNumber)}
                            />
                          ) : (
                            <FreeCell compact={compact} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {breaksAfterPeriod.length > 0 && (
                    <TimetableBreakRow
                      afterPeriod={slot.periodNumber}
                      breaks={breaks}
                      daysToShow={daysToShow}
                      compact={compact}
                      timeMinW={timeMinW}
                      tdPad={tdPad}
                      isTeacherCompact={isTeacherCompact}
                      mobileLayout={mobileLayout}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
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
  compact,
  onClick,
}: {
  lesson: TimetableLesson;
  isCurrent: boolean;
  isCompleted: boolean;
  isNext: boolean;
  hasConflict: boolean;
  viewType: TimetableViewType;
  compact?: boolean;
  onClick?: () => void;
}) {
  const palette = getSubjectPaletteColor(normalizeSubjectName(lesson.subject.name));
  const classLabel =
    viewType === 'teacher'
      ? lesson.grade.displayName || lesson.grade.name
      : lesson.teacher.name;
  const showRoom = lesson.room && !(compact && viewType === 'teacher');

  const isTeacherCompact = compact && viewType === 'teacher';

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative group/lesson cursor-pointer transition-all duration-200',
        compact ? 'min-h-[36px] rounded-sm p-1' : 'min-h-[52px] rounded-md border-l-[3px] p-2',
        !isTeacherCompact && palette.border,
        isCurrent
          ? 'bg-primary text-white ring-1 ring-primary/20'
          : isCompleted
            ? 'bg-slate-100/90 dark:bg-slate-800/90 opacity-75'
            : isNext
              ? `${palette.bg} ring-1 ring-primary/20`
              : palette.bg,
        hasConflict && 'ring-2 ring-red-400',
        isTeacherCompact && !isCurrent && 'hover:bg-opacity-90',
        !isTeacherCompact && !isCurrent && 'hover:shadow-sm',
        !compact && !isCurrent && 'hover:scale-[1.01]',
        isCurrent && !compact && 'scale-[1.02] shadow-md',
        (isCompleted || isCurrent) && 'pr-5',
      )}
    >
      <div className={cn(
        'flex items-start gap-1 min-w-0',
        compact ? '' : 'mb-0.5',
      )}>
        {!isCurrent && (
          <span
            className={cn('mt-0.5 shrink-0 rounded-full', compact ? 'h-1.5 w-1.5' : 'h-2 w-2')}
            style={{ backgroundColor: palette.accent }}
            aria-hidden
          />
        )}
        <div className={cn(
          'min-w-0 flex-1 font-semibold leading-tight truncate',
          compact ? 'text-[10px]' : 'text-xs font-bold',
          isCurrent ? 'text-white' : 'text-slate-900 dark:text-slate-100',
          isCompleted && 'line-through decoration-slate-400',
        )}>
        {lesson.subject.name}
        {lesson.isDoublePeriod && (
          <span className="ml-0.5 opacity-60">(2×)</span>
        )}
        </div>
      </div>

      <div className={cn(
        'flex items-center gap-0.5 truncate',
        isTeacherCompact && 'pl-2',
        compact ? 'text-[9px]' : 'text-[11px] gap-1',
        isCurrent ? 'text-white/80' : 'text-slate-600 dark:text-slate-400',
      )}>
        {!compact && <Users className="h-3 w-3 flex-shrink-0" />}
        <span className="truncate">
          {classLabel}
          {lesson.isSubstitution && viewType !== 'teacher' && (
            <span className="text-[10px] text-amber-400 font-medium ml-0.5">Sub</span>
          )}
        </span>
      </div>

      {showRoom && (
        <div className={cn(
          'flex items-center gap-0.5 truncate',
          compact ? 'text-[8px] mt-0' : 'text-[10px] mt-0.5 gap-1',
          isCurrent ? 'text-white/70' : 'text-slate-500 dark:text-slate-500',
        )}>
          <MapPin className={cn('flex-shrink-0', compact ? 'h-2 w-2' : 'h-2.5 w-2.5')} />
          <span>{compact ? lesson.room : `Room ${lesson.room}`}</span>
        </div>
      )}

      <div className="absolute top-0.5 right-0.5 flex items-center gap-0.5">
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
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          </span>
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
  compact,
  onClick,
}: {
  breakItem: TimetableBreak;
  compact?: boolean;
  onClick?: () => void;
}) {
  const config = BREAK_TYPE_CONFIG[breakItem.type as BreakType] || BREAK_TYPE_CONFIG.BREAK;
  const icon = breakItem.icon || config.icon;
  const label = formatBreakLabel(breakItem.name || config.label);

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'flex min-h-[32px] flex-col items-center justify-center rounded-sm border px-1.5 py-1 text-center',
          config.bgClass,
          config.borderClass,
          onClick && 'cursor-pointer',
        )}
      >
        <span className={cn('max-w-full truncate text-[9px] font-medium leading-tight', config.textClass)}>
          {label}
        </span>
        <span className={cn('font-mono text-[8px] tabular-nums opacity-75', config.textClass)}>
          {breakItem.durationMinutes}m
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-md p-2 border-2 text-center transition-all duration-200',
        config.bgClass,
        config.borderClass,
        onClick && 'cursor-pointer hover:shadow-md',
      )}
    >
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-lg">{icon}</span>
        <span className={cn('text-[10px] font-bold uppercase', config.textClass)}>
          {label}
        </span>
        <span className={cn('text-[9px] font-medium', config.textClass)}>
          {breakItem.durationMinutes}m
        </span>
      </div>
    </div>
  );
}

/** Full-width break band after a period (matches admin timetable). */
function PeriodTimeRail({
  slot,
  isCurrent,
  className,
}: {
  slot: TimetableSlot;
  isCurrent: boolean;
  className?: string;
}) {
  const timeLabel = formatPeriodTimeLabel(slot);

  return (
    <div
      className={cn(
        'flex min-h-[40px] items-center border-l-[3px] px-2 py-1.5',
        className,
        isCurrent
          ? 'border-l-primary bg-primary/[0.06] dark:bg-primary/10'
          : 'border-l-slate-300 bg-slate-50 dark:border-l-slate-600 dark:bg-slate-900',
      )}
    >
      <p
        className={cn(
          'whitespace-nowrap font-mono text-[11px] font-medium tabular-nums leading-tight',
          isCurrent
            ? 'text-primary dark:text-primary-foreground'
            : 'text-slate-700 dark:text-slate-200',
        )}
      >
        {timeLabel}
      </p>
    </div>
  );
}

function PeriodTimeRailLegacy({
  slot,
  isCurrent,
  compact,
  className,
}: {
  slot: TimetableSlot;
  isCurrent: boolean;
  compact?: boolean;
  className?: string;
}) {
  const timeLabel = formatPeriodTimeLabel(slot);

  return (
    <div
      className={cn(
        'relative border-r-2 border-primary/20 dark:border-primary/30',
        compact ? 'px-1.5 py-1.5' : 'p-2.5',
        className,
        isCurrent
          ? 'bg-gradient-to-br from-primary/20 via-primary/10 to-transparent dark:from-primary/30'
          : 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10',
      )}
    >
      <div className={cn('flex items-center', compact ? 'gap-1' : 'gap-1.5')}>
        {!compact && (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/20 dark:bg-primary/30">
            <Clock className="h-3 w-3 text-primary" />
          </div>
        )}
        <div className="min-w-0 leading-tight">
          <p
            className={cn(
              'truncate font-mono font-medium tabular-nums text-slate-900 dark:text-slate-100',
              compact ? 'text-[10px]' : 'text-xs',
            )}
          >
            {timeLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

function BreakTimeRail({
  label,
  timeLabel,
  visualClasses,
  compact,
  className,
}: {
  label: string;
  timeLabel: string;
  visualClasses: { text: string; rowBg: string; rowBorder: string };
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[32px] flex-col justify-center border-l-[3px] px-2 py-1',
        className,
        visualClasses.rowBorder,
        visualClasses.rowBg,
      )}
    >
      <p
        className={cn(
          'truncate font-medium leading-tight',
          compact ? 'text-[9px]' : 'text-[10px]',
          visualClasses.text,
        )}
      >
        {label}
      </p>
      {timeLabel ? (
        <p
          className={cn(
            'font-mono tabular-nums opacity-80',
            compact ? 'text-[8px]' : 'text-[9px]',
            visualClasses.text,
          )}
        >
          {timeLabel}
        </p>
      ) : null}
    </div>
  );
}

function TimetableBreakRow({
  afterPeriod,
  breaks,
  daysToShow,
  compact,
  timeMinW,
  tdPad,
  isTeacherCompact,
  mobileLayout,
}: {
  afterPeriod: number;
  breaks: TimetableBreak[];
  daysToShow: number[];
  compact?: boolean;
  timeMinW: string;
  tdPad: string;
  isTeacherCompact?: boolean;
  mobileLayout?: boolean;
}) {
  const rowBreaks = breaks.filter((b) => b.afterPeriod === afterPeriod);
  const labelBreak = rowBreaks[0];
  if (!labelBreak) return null;

  const config =
    BREAK_TYPE_CONFIG[labelBreak.type as BreakType] || BREAK_TYPE_CONFIG.BREAK;
  const timeLabel = formatBreakTimeLabel(
    labelBreak.startTime,
    labelBreak.endTime,
    labelBreak.durationMinutes,
  );
  const label = formatBreakLabel(labelBreak.name || config.label);
  const emptyH = compact ? 'min-h-[28px]' : 'min-h-[40px]';

  return (
    <tr className={cn(compact ? 'border-y' : 'border-y-2', config.borderClass, config.bgClass)}>
      <td
        className={cn(
          'border-b border-slate-200/90 p-0 dark:border-slate-700/90',
          mobileLayout
            ? cn(STICKY_TIME_CELL, 'z-30')
            : 'sticky left-0 z-10 border-r',
        )}
      >
        {isTeacherCompact ? (
          <BreakTimeRail
            label={label}
            timeLabel={timeLabel}
            compact={compact}
            className={timeMinW}
            visualClasses={{
              text: config.textClass,
              rowBg: config.bgClass,
              rowBorder: config.borderClass,
            }}
          />
        ) : (
          <div className={cn('border-r-2 px-2 py-1.5', timeMinW, config.bgClass, config.borderClass)}>
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 text-base">{labelBreak.icon || config.icon}</span>
              <div className="min-w-0 leading-tight">
                <p className={cn('truncate text-xs font-semibold', config.textClass)}>{label}</p>
                <p className={cn('font-mono text-[10px] tabular-nums opacity-80', config.textClass)}>
                  {timeLabel}
                </p>
              </div>
            </div>
          </div>
        )}
      </td>
      {daysToShow.map((dayOfWeek) => {
        const dayBreak = rowBreaks.find((b) => b.dayOfWeek === dayOfWeek);
        return (
          <td
            key={dayOfWeek}
            className={cn(
              'border-r border-b border-slate-200 dark:border-slate-700 last:border-r-0 align-middle',
              tdPad,
            )}
          >
            {dayBreak ? (
              <BreakCell breakItem={dayBreak} compact={compact} />
            ) : (
              <div className={cn(emptyH, 'flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500')}>
                —
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );
}

function FreeCell({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="w-full min-h-[36px] flex items-center justify-center text-slate-300 dark:text-slate-600">
        <span className="text-xs select-none" aria-hidden>—</span>
      </div>
    );
  }
  return (
    <div className="w-full min-h-[52px] flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 rounded-md">
      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
        Free
      </span>
    </div>
  );
}

function EmptyCell({ compact, onClick }: { compact?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-center gap-1 border border-dashed border-slate-200 dark:border-slate-700 rounded-md hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-[10px] text-slate-400 dark:text-slate-500 font-medium',
        compact ? 'min-h-[36px]' : 'min-h-[52px]',
      )}
    >
      <span className="text-lg">+</span>
      <span>Add</span>
    </button>
  );
}

function formatBreakLabel(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'Break';
  return trimmed
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default TimetableGrid;
