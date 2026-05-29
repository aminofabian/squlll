/**
 * Admin timetable grid — dashboard-style schedule board with clear hierarchy:
 * period rail · day columns · subject-accent lesson cards · muted break bands.
 */

"use client";

import React, { useEffect, useState } from "react";
import { Clock, Edit2, Trash2, Plus, AlertCircle, Layers2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getSubjectAccent,
  type SubjectAccentStyle,
} from "../utils/timetableSubjectColors";

// ─── Types ─────────────────────────────────────────────────────

interface TimeSlotInfo {
  id: string;
  periodNumber: number;
  startTime?: string;
  endTime?: string;
  displayTime?: string;
  time?: string;
}

interface LessonEntry {
  id: string;
  subject: { id?: string; name: string };
  teacher: { id?: string; name: string; fullName?: string };
  roomNumber?: string | null;
  gradeId?: string;
  timeSlotId?: string;
  isDoublePeriod?: boolean;
}

interface BreakEntry {
  id?: string;
  name: string;
  type: string;
  afterPeriod: number;
  durationMinutes: number;
  dayOfWeek?: number;
  applyToAllDays?: boolean;
  icon?: string;
  startTime?: string;
  endTime?: string;
  isNew?: boolean;
}

interface AdminTimetableGridProps {
  periodNumbers: number[];
  days: string[];
  getSlotFor: (dayIndex: number, period: number) => TimeSlotInfo | null;
  getEntryFor: (dayOfWeek: number, period: number) => LessonEntry | null;
  getBreaksAfterPeriod: (period: number) => BreakEntry[];
  getBreaksBeforeFirstPeriod: () => BreakEntry[];
  isLoading?: boolean;
  hasNoTimeSlots?: boolean;
  getCleanBreakName?: (name: string) => string;
  conflictLessonIds?: Set<string>;
  highlightTeacherId?: string | null;
  getSubjectAccent?: (
    subjectId: string,
    subjectName: string,
  ) => SubjectAccentStyle;
  onEditTimeslot?: (slot: TimeSlotInfo) => void;
  onDeleteTimeslot?: (slot: TimeSlotInfo) => void;
  onEditLesson?: (lesson: LessonEntry) => void;
  onDeleteLesson?: (lesson: LessonEntry) => void;
  onAddLesson?: (
    dayOfWeek: number,
    timeSlotId: string,
    daySlotId?: string,
  ) => void;
  onEditBreak?: (breakEntry: BreakEntry) => void;
  onAddBreak?: (afterPeriod: number, dayOfWeek?: number) => void;
  onMoveBreak?: (breakEntry: BreakEntry, direction: -1 | 1) => void;
  movingBreakId?: string | null;
  onCreateSchedule?: () => void;
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────

export function AdminTimetableGrid({
  periodNumbers,
  days,
  getSlotFor,
  getEntryFor,
  getBreaksAfterPeriod,
  getBreaksBeforeFirstPeriod,
  isLoading = false,
  hasNoTimeSlots = false,
  getCleanBreakName,
  conflictLessonIds,
  highlightTeacherId,
  getSubjectAccent: resolveAccent,
  onEditTimeslot,
  onDeleteTimeslot,
  onEditLesson,
  onDeleteLesson,
  onAddLesson,
  onEditBreak,
  onAddBreak,
  onMoveBreak,
  movingBreakId,
  onCreateSchedule,
  className,
}: AdminTimetableGridProps) {
  const cleanName = getCleanBreakName || ((name: string) => name);
  const [mobileDayIndex, setMobileDayIndex] = useState(0);
  const accentFor = resolveAccent ?? getSubjectAccent;

  useEffect(() => {
    setMobileDayIndex(0);
  }, [days.length]);

  const dayColumnClass = (dayIndex: number) =>
    cn(dayIndex !== mobileDayIndex && "hidden md:table-cell");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-950/40",
        className,
      )}
    >
      {days.length > 1 && (
        <div
          className="flex items-center gap-1 border-b border-zinc-200/90 bg-white px-2 py-2 dark:border-zinc-800 dark:bg-zinc-900 md:hidden"
          role="tablist"
          aria-label="Day of week"
        >
          {days.map((day, index) => (
            <button
              key={day}
              type="button"
              role="tab"
              aria-selected={index === mobileDayIndex}
              onClick={() => setMobileDayIndex(index)}
              className={cn(
                "flex-1 min-w-0 rounded-lg px-2 py-2 text-[11px] font-semibold tracking-tight transition-colors",
                index === mobileDayIndex
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
              )}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-0 border-collapse md:min-w-[720px]">
          <thead>
            <tr className="border-b border-zinc-200/90 dark:border-zinc-800">
              <th
                className="sticky left-0 z-20 w-[108px] border-r border-zinc-200/90 bg-zinc-100/95 px-3 py-3 text-left dark:border-zinc-800 dark:bg-zinc-900/95 md:w-[132px]"
                scope="col"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Period
                </span>
              </th>
              {days.map((day, index) => (
                <th
                  key={day}
                  scope="col"
                  className={cn(
                    "min-w-[120px] border-r border-zinc-200/60 bg-zinc-100/70 px-2 py-3 text-center last:border-r-0 dark:border-zinc-800 dark:bg-zinc-900/70 md:min-w-[140px]",
                    dayColumnClass(index),
                  )}
                >
                  <span className="block text-[13px] font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                    {day}
                  </span>
                  <span className="mt-0.5 block text-[10px] font-medium tabular-nums text-zinc-400">
                    Day {index + 1}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr
                  key={`skel-${i}`}
                  className="border-b border-zinc-100 dark:border-zinc-800/80"
                >
                  <td className="sticky left-0 border-r border-zinc-200/90 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="h-14 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                  </td>
                  {days.map((_, di) => (
                    <td key={di} className={cn("p-2", dayColumnClass(di))}>
                      <div className="h-14 animate-pulse rounded-lg bg-zinc-100/80 dark:bg-zinc-800/60" />
                    </td>
                  ))}
                </tr>
              ))
            ) : hasNoTimeSlots ? (
              <tr>
                <td colSpan={days.length + 1} className="p-12 text-center">
                  <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                      <Clock className="h-5 w-5 text-zinc-400" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      No periods yet
                    </p>
                    <p className="text-[12px] leading-relaxed text-zinc-500">
                      Configure lesson times for this term, then fill the grid.
                    </p>
                    <Button
                      size="sm"
                      onClick={onCreateSchedule}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Set up schedule
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                <BreakBeforeFirstRow
                  breaks={getBreaksBeforeFirstPeriod()}
                  days={days}
                  cleanName={cleanName}
                  onEditBreak={onEditBreak}
                  dayColumnClass={dayColumnClass}
                />

                {periodNumbers.map((period, periodIndex) => {
                  const baseSlot =
                    days.reduce<TimeSlotInfo | null>((found, _, dayIndex) => {
                      if (found) return found;
                      return getSlotFor(dayIndex, period);
                    }, null);
                  if (!baseSlot) return null;

                  const breaksAfter = getBreaksAfterPeriod(period);
                  const prevPeriodNumber =
                    periodIndex > 0 ? periodNumbers[periodIndex - 1] : null;
                  const rowHasDoubleBlock = days.some((_, dayIndex) => {
                    const e = getEntryFor(dayIndex + 1, period);
                    return e?.isDoublePeriod === true;
                  });
                  const rowIsDoubleContinuation =
                    prevPeriodNumber != null &&
                    days.some((_, dayIndex) => {
                      const prev = getEntryFor(dayIndex + 1, prevPeriodNumber);
                      return (
                        prev?.isDoublePeriod === true &&
                        getBreaksAfterPeriod(prevPeriodNumber).length === 0
                      );
                    });

                  return (
                    <React.Fragment key={`period-${period}`}>
                      <tr
                        className={cn(
                          "group/row border-b border-zinc-200/70 dark:border-zinc-800/80",
                          rowIsDoubleContinuation &&
                            "bg-zinc-50/60 dark:bg-zinc-900/20",
                        )}
                      >
                        <td className="sticky left-0 z-10 border-r border-zinc-200/90 bg-white p-0 align-top dark:border-zinc-800 dark:bg-zinc-900">
                          <TimeColumnCell
                            slot={baseSlot}
                            period={period}
                            isDoubleBlockRow={rowHasDoubleBlock}
                            isDoubleContinuation={rowIsDoubleContinuation}
                            onEdit={onEditTimeslot}
                            onDelete={onDeleteTimeslot}
                            onAddBreak={onAddBreak}
                          />
                        </td>

                        {days.map((_, dayIndex) => {
                          const dayOfWeek = dayIndex + 1;
                          const daySlot = getSlotFor(dayIndex, period);
                          const entry = getEntryFor(dayOfWeek, period);
                          const prevEntry =
                            prevPeriodNumber != null
                              ? getEntryFor(dayOfWeek, prevPeriodNumber)
                              : null;
                          const breakAfterPrev =
                            prevPeriodNumber != null
                              ? getBreaksAfterPeriod(prevPeriodNumber).length > 0
                              : false;
                          const coveredByDoubleAbove =
                            prevEntry?.isDoublePeriod === true &&
                            !breakAfterPrev;
                          const spansDouble =
                            entry?.isDoublePeriod === true &&
                            breaksAfter.length === 0;
                          const hasConflict =
                            entry && conflictLessonIds?.has(entry.id);
                          const isTeacherDimmed = !!(
                            entry &&
                            highlightTeacherId &&
                            entry.teacher.id !== highlightTeacherId
                          );

                          const nextPeriodNumber =
                            periodIndex < periodNumbers.length - 1
                              ? periodNumbers[periodIndex + 1]
                              : null;

                          if (coveredByDoubleAbove) {
                            return null;
                          }

                          return (
                            <td
                              key={dayIndex}
                              rowSpan={spansDouble ? 2 : undefined}
                              className={cn(
                                "bg-white p-1 align-top dark:bg-zinc-900/40",
                                spansDouble && "p-1",
                                dayColumnClass(dayIndex),
                              )}
                            >
                              {entry ? (
                                spansDouble && nextPeriodNumber != null ? (
                                  <DoublePeriodLessonCell
                                    entry={entry}
                                    period={period}
                                    nextPeriod={nextPeriodNumber}
                                    accent={accentFor(
                                      entry.subject.id ?? entry.id,
                                      entry.subject.name,
                                    )}
                                    hasConflict={!!hasConflict}
                                    isDimmed={isTeacherDimmed}
                                    onEdit={onEditLesson}
                                    onDelete={onDeleteLesson}
                                  />
                                ) : (
                                  <AdminLessonCell
                                    entry={entry}
                                    accent={accentFor(
                                      entry.subject.id ?? entry.id,
                                      entry.subject.name,
                                    )}
                                    hasConflict={!!hasConflict}
                                    isDimmed={isTeacherDimmed}
                                    isBlockLesson={entry.isDoublePeriod === true}
                                    onEdit={onEditLesson}
                                    onDelete={onDeleteLesson}
                                  />
                                )
                              ) : (
                                <button
                                  type="button"
                                  disabled={!daySlot?.id}
                                  onClick={() => {
                                    if (!daySlot?.id) return;
                                    onAddLesson?.(
                                      dayOfWeek,
                                      daySlot.id,
                                      daySlot.id,
                                    );
                                  }}
                                  className="flex min-h-[64px] w-full flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-zinc-200/90 bg-zinc-50/50 text-[11px] font-medium text-zinc-400 transition-colors hover:border-zinc-300 hover:bg-white hover:text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/20 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
                                  title="Add lesson"
                                >
                                  <Plus className="h-3.5 w-3.5 opacity-60" />
                                  <span>Add</span>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {breaksAfter.length > 0 && (
                        <BreakRow
                          breaks={breaksAfter}
                          days={days}
                          cleanName={cleanName}
                          onEditBreak={onEditBreak}
                          onMoveBreak={onMoveBreak}
                          movingBreakId={movingBreakId}
                          dayColumnClass={dayColumnClass}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function TimeColumnCell({
  slot,
  period,
  isDoubleBlockRow,
  isDoubleContinuation,
  onEdit,
  onDelete,
  onAddBreak,
}: {
  slot: TimeSlotInfo;
  period: number;
  isDoubleBlockRow?: boolean;
  isDoubleContinuation?: boolean;
  onEdit?: (slot: TimeSlotInfo) => void;
  onDelete?: (slot: TimeSlotInfo) => void;
  onAddBreak?: (afterPeriod: number) => void;
}) {
  const timeLabel =
    slot.displayTime ||
    slot.time ||
    `${slot.startTime ?? ""}`.trim() ||
    `P${period}`;

  return (
    <div
      className={cn(
        "group/time relative w-[108px] cursor-pointer border-b border-transparent p-3 md:w-[132px]",
        isDoubleBlockRow &&
          "bg-gradient-to-b from-violet-50/80 to-transparent dark:from-violet-950/20",
        isDoubleContinuation &&
          "border-l-2 border-dashed border-violet-200/80 dark:border-violet-800/60",
      )}
      role="button"
      tabIndex={0}
      onClick={() => onEdit?.(slot)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit?.(slot);
        }
      }}
      title="Edit lesson times"
    >
      <div className="pr-7">
        <div className="flex items-center gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
            P{period}
          </p>
          {isDoubleBlockRow && (
            <span
              className="rounded px-1 py-px text-[8px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400"
              title="Block lesson starts this period"
            >
              blk
            </span>
          )}
          {isDoubleContinuation && (
            <span
              className="rounded px-1 py-px text-[8px] font-medium uppercase tracking-wide text-zinc-400"
              title="Continuation of block above"
            >
              ↳
            </span>
          )}
        </div>
        <p className="mt-1 font-mono text-[12px] font-medium tabular-nums leading-tight text-zinc-800 dark:text-zinc-100">
          {timeLabel}
        </p>
      </div>

      <div className="absolute right-1.5 top-1.5 flex flex-col gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover/time:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddBreak?.(period);
          }}
          className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          title="Add break"
        >
          ☕
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(slot);
          }}
          className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          title="Edit"
        >
          <Edit2 className="h-2.5 w-2.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(slot);
          }}
          className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-red-50 hover:text-red-600"
          title="Delete period"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}

function AdminLessonCell({
  entry,
  accent,
  hasConflict,
  isDimmed,
  isBlockLesson,
  onEdit,
  onDelete,
}: {
  entry: LessonEntry;
  accent: SubjectAccentStyle;
  hasConflict: boolean;
  isDimmed?: boolean;
  isBlockLesson?: boolean;
  onEdit?: (lesson: LessonEntry) => void;
  onDelete?: (lesson: LessonEntry) => void;
}) {
  return (
    <div
      className={cn(
        "group/lesson relative min-h-[64px] cursor-pointer overflow-hidden rounded-lg border transition-shadow hover:shadow-sm",
        isDimmed && "opacity-40 saturate-[0.65]",
        hasConflict
          ? "border-red-200/90 bg-red-50/90 dark:border-red-900/50 dark:bg-red-950/25"
          : "border-zinc-200/70 dark:border-zinc-700/80",
      )}
      style={
        hasConflict
          ? undefined
          : {
              backgroundColor: accent.background,
              borderColor: accent.border,
            }
      }
      role="button"
      tabIndex={0}
      onClick={() => onEdit?.(entry)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit?.(entry);
        }
      }}
    >
      <div
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: hasConflict ? "#dc2626" : accent.accent }}
        aria-hidden
      />

      <div className="flex min-h-[64px] flex-col justify-center py-2 pl-3.5 pr-8">
        {isBlockLesson && !hasConflict && (
          <span
            className="mb-1 inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em]"
            style={{
              color: accent.text,
              backgroundColor: `color-mix(in srgb, ${accent.accent} 12%, white)`,
            }}
          >
            <Layers2 className="h-2.5 w-2.5" aria-hidden />
            Block
          </span>
        )}
        <p
          className="text-[13px] font-semibold leading-tight tracking-tight line-clamp-2"
          style={{ color: hasConflict ? undefined : accent.text }}
        >
          {entry.subject.name}
        </p>
        <p className="mt-1 truncate text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          {entry.teacher.name}
        </p>
        {entry.roomNumber && (
          <p className="mt-1 text-[10px] tabular-nums text-zinc-400">
            Rm {entry.roomNumber}
          </p>
        )}
      </div>

      <LessonCellActions
        entry={entry}
        hasConflict={hasConflict}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {hasConflict && (
        <AlertCircle className="absolute bottom-1.5 right-1.5 h-3.5 w-3.5 text-red-500" />
      )}
    </div>
  );
}

function DoublePeriodLessonCell({
  entry,
  period,
  nextPeriod,
  accent,
  hasConflict,
  isDimmed,
  onEdit,
  onDelete,
}: {
  entry: LessonEntry;
  period: number;
  nextPeriod: number;
  accent: SubjectAccentStyle;
  hasConflict: boolean;
  isDimmed?: boolean;
  onEdit?: (lesson: LessonEntry) => void;
  onDelete?: (lesson: LessonEntry) => void;
}) {
  return (
    <div
      className={cn(
        "group/lesson relative flex min-h-[148px] cursor-pointer flex-col overflow-hidden rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-all hover:shadow-md dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        isDimmed && "opacity-40 saturate-[0.65]",
        hasConflict
          ? "border-red-200/90 bg-red-50/90 dark:border-red-900/50 dark:bg-red-950/25"
          : "border-zinc-200/80 dark:border-zinc-700/80",
      )}
      style={
        hasConflict
          ? undefined
          : {
              backgroundColor: accent.background,
              borderColor: accent.border,
              boxShadow: `inset 3px 0 0 0 ${accent.accent}, inset 0 1px 0 rgba(255,255,255,0.5)`,
            }
      }
      role="button"
      tabIndex={0}
      onClick={() => onEdit?.(entry)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit?.(entry);
        }
      }}
    >
      {/* Header band */}
      <div
        className="flex items-center justify-between gap-2 border-b px-3 py-1.5"
        style={{
          borderColor: hasConflict ? undefined : accent.border,
          backgroundColor: hasConflict
            ? undefined
            : `color-mix(in srgb, ${accent.accent} 8%, transparent)`,
        }}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <Layers2
            className="h-3 w-3 shrink-0 opacity-70"
            style={{ color: hasConflict ? undefined : accent.accent }}
            aria-hidden
          />
          <span
            className="text-[9px] font-bold uppercase tracking-[0.14em]"
            style={{ color: hasConflict ? undefined : accent.text }}
          >
            Block lesson
          </span>
        </div>
        <span
          className="shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums"
          style={{
            color: hasConflict ? undefined : accent.text,
            backgroundColor: hasConflict
              ? undefined
              : `color-mix(in srgb, ${accent.accent} 14%, white)`,
          }}
        >
          P{period}–{nextPeriod}
        </span>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col justify-between px-3 py-2.5 pr-8">
        <div>
          <p
            className="text-[14px] font-semibold leading-snug tracking-tight line-clamp-2"
            style={{ color: hasConflict ? undefined : accent.text }}
          >
            {entry.subject.name}
          </p>
          <p className="mt-1.5 truncate text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
            {entry.teacher.name}
          </p>
          {entry.roomNumber && (
            <p className="mt-0.5 text-[10px] tabular-nums text-zinc-500">
              Room {entry.roomNumber}
            </p>
          )}
        </div>

        {/* Period timeline */}
        <div
          className="mt-3 rounded-lg border px-2.5 py-2"
          style={{
            borderColor: hasConflict ? undefined : accent.border,
            backgroundColor: hasConflict
              ? undefined
              : `color-mix(in srgb, ${accent.accent} 5%, white)`,
          }}
        >
          <div className="flex items-center gap-0">
            <PeriodNode
              label={`P${period}`}
              sublabel="Start"
              accent={accent}
              hasConflict={hasConflict}
              active
            />
            <div
              className="relative mx-1 h-px flex-1"
              style={{
                backgroundColor: hasConflict
                  ? undefined
                  : `color-mix(in srgb, ${accent.accent} 35%, transparent)`,
              }}
              aria-hidden
            >
              <div
                className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: accent.accent }}
              />
            </div>
            <PeriodNode
              label={`P${nextPeriod}`}
              sublabel="Continues"
              accent={accent}
              hasConflict={hasConflict}
            />
          </div>
        </div>
      </div>

      <LessonCellActions
        entry={entry}
        hasConflict={hasConflict}
        onEdit={onEdit}
        onDelete={onDelete}
        showDoubleBadge
      />

      {hasConflict && (
        <AlertCircle className="absolute bottom-2 right-2 h-3.5 w-3.5 text-red-500" />
      )}
    </div>
  );
}

function PeriodNode({
  label,
  sublabel,
  accent,
  hasConflict,
  active,
}: {
  label: string;
  sublabel: string;
  accent: SubjectAccentStyle;
  hasConflict: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border-2 text-[8px] font-bold",
          active && "ring-2 ring-offset-1",
        )}
        style={
          hasConflict
            ? undefined
            : {
                borderColor: accent.accent,
                backgroundColor: active
                  ? accent.accent
                  : `color-mix(in srgb, ${accent.accent} 12%, white)`,
                color: active ? "white" : accent.text,
                ...(active
                  ? { boxShadow: `0 0 0 2px color-mix(in srgb, ${accent.accent} 25%, transparent)` }
                  : {}),
              }
        }
      >
        {active ? "1" : "2"}
      </div>
      <span className="font-mono text-[9px] font-semibold tabular-nums text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      <span className="text-[8px] font-medium uppercase tracking-wide text-zinc-400">
        {sublabel}
      </span>
    </div>
  );
}

function LessonCellActions({
  entry,
  hasConflict,
  onEdit,
  onDelete,
  showDoubleBadge,
}: {
  entry: LessonEntry;
  hasConflict: boolean;
  onEdit?: (lesson: LessonEntry) => void;
  onDelete?: (lesson: LessonEntry) => void;
  showDoubleBadge?: boolean;
}) {
  return (
    <div className="absolute right-1 top-1 flex items-center gap-0.5 md:opacity-0 md:group-hover/lesson:opacity-100">
      {(showDoubleBadge || entry.isDoublePeriod) && !hasConflict && (
        <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-500 shadow-sm dark:bg-zinc-800/90">
          2×
        </span>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.(entry);
        }}
        className="rounded p-1 text-zinc-400 hover:bg-white/80 dark:hover:bg-zinc-800/80"
      >
        <Edit2 className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(entry);
        }}
        className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function BreakRow({
  breaks,
  days,
  cleanName,
  onEditBreak,
  onMoveBreak,
  movingBreakId,
  dayColumnClass,
}: {
  breaks: BreakEntry[];
  days: string[];
  cleanName: (name: string) => string;
  onEditBreak?: (breakEntry: BreakEntry) => void;
  onMoveBreak?: (breakEntry: BreakEntry, direction: -1 | 1) => void;
  movingBreakId?: string | null;
  dayColumnClass?: (dayIndex: number) => string;
}) {
  const colClass = dayColumnClass ?? (() => "");
  const label = cleanName(breaks[0]?.name || "Break");
  const first = breaks[0];
  const isMoving = first && movingBreakId === first.id;

  return (
    <tr className="border-b border-stone-200/80 bg-stone-100/50 dark:border-stone-800/60 dark:bg-stone-900/20">
      <td className="sticky left-0 z-10 border-r border-stone-200/80 bg-stone-100/80 p-2 dark:border-stone-800 dark:bg-stone-900/40">
        <div className="flex items-center gap-1">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500">
              Break
            </p>
            <p className="mt-0.5 text-[12px] font-medium text-stone-700 dark:text-stone-300 truncate">
              {label}
            </p>
            <p className="text-[10px] tabular-nums text-stone-500">
              {first?.durationMinutes} min
            </p>
          </div>
          {first && onMoveBreak && (
            <div className="flex flex-col gap-0.5 shrink-0">
              {isMoving ? (
                <div className="flex h-8 w-4 items-center justify-center">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-stone-300 border-t-stone-500" />
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveBreak(first, -1);
                    }}
                    className="flex h-4 w-4 items-center justify-center rounded text-[10px] text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                    title="Move break earlier"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveBreak(first, 1);
                    }}
                    className="flex h-4 w-4 items-center justify-center rounded text-[10px] text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                    title="Move break later"
                  >
                    ▼
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </td>
      {days.map((_, dayIndex) => {
        const dayBreak = breaks.find(
          (b) => b.applyToAllDays || b.dayOfWeek === dayIndex + 1,
        );
        return (
          <td
            key={dayIndex}
            className={cn("p-1.5 align-middle", colClass(dayIndex))}
          >
            {dayBreak ? (
              <button
                type="button"
                onClick={() => onEditBreak?.(dayBreak)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-stone-200/90 bg-white/90 px-2 py-2 text-[11px] font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-white dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-300"
              >
                <span>{dayBreak.icon || "☕"}</span>
                <span className="truncate">{cleanName(dayBreak.name)}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  onEditBreak?.({
                    isNew: true,
                    afterPeriod: breaks[0]?.afterPeriod || 0,
                    dayOfWeek: dayIndex + 1,
                    name: "Break",
                    type: "BREAK",
                    durationMinutes: 20,
                  })
                }
                className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-stone-300/80 py-2 text-[10px] font-medium text-stone-400 hover:bg-white/80"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            )}
          </td>
        );
      })}
    </tr>
  );
}

function BreakBeforeFirstRow({
  breaks,
  days,
  cleanName,
  onEditBreak,
  onMoveBreak,
  movingBreakId,
  dayColumnClass,
}: {
  breaks: BreakEntry[];
  days: string[];
  cleanName: (name: string) => string;
  onEditBreak?: (breakEntry: BreakEntry) => void;
  onMoveBreak?: (breakEntry: BreakEntry, direction: -1 | 1) => void;
  movingBreakId?: string | null;
  dayColumnClass?: (dayIndex: number) => string;
}) {
  if (breaks.length === 0) return null;
  return (
    <BreakRow
      breaks={breaks}
      days={days}
      cleanName={cleanName}
      onEditBreak={onEditBreak}
      onMoveBreak={onMoveBreak}
      movingBreakId={movingBreakId}
      dayColumnClass={dayColumnClass}
    />
  );
}

export default AdminTimetableGrid;
