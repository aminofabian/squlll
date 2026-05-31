/**
 * Admin timetable grid — dashboard-style schedule board with clear hierarchy:
 * period rail · day columns · subject-accent lesson cards · muted break bands.
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  AlertCircle,
  Apple,
  Building2,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  CupSoda,
  Loader2,
  Pause,
  Plus,
  Trophy,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { getBreakTypeOption } from "@/lib/utils/timetable-break-types";
import {
  getSubjectAccent,
  type SubjectAccentStyle,
} from "../utils/timetableSubjectColors";
/** Touch-friendly row sizing */
const T_CELL = "text-xs leading-snug";
const T_CELL_SM = "text-[11px] leading-tight";
const ROW_H = "h-11 min-h-[44px]";
const DOUBLE_ROW_H = "min-h-[88px]";
const TIME_COL_W = "w-[112px] md:w-[128px]";

const LINK_ACTION =
  "inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-30 dark:text-slate-500 dark:hover:bg-slate-800/60 dark:hover:text-slate-200";

type BreakVisual = {
  Icon: LucideIcon;
  label: string;
  rowBg: string;
  rowBorder: string;
  cellBg: string;
  cellBorder: string;
  iconWrap: string;
  iconColor: string;
  text: string;
};

function resolveBreakVisual(
  breakEntry: BreakEntry,
  cleanName: (name: string) => string,
): BreakVisual {
  const rawName = cleanName(breakEntry.name || "Break");
  const typeOpt = getBreakTypeOption(breakEntry.type);
  const haystack = `${breakEntry.type} ${rawName}`.toLowerCase();

  const base = (
    visual: Omit<BreakVisual, "label"> & { label?: string },
  ): BreakVisual => ({
    ...visual,
    label: visual.label ?? typeOpt?.label ?? rawName,
  });

  if (haystack.includes("assembly")) {
    return base({
      Icon: Building2,
      rowBg: "bg-violet-50/90 dark:bg-violet-950/25",
      rowBorder: "border-violet-200/80 dark:border-violet-800/60",
      cellBg: "bg-violet-100/60 dark:bg-violet-900/30",
      cellBorder: "border-violet-200/90 dark:border-violet-700/70",
      iconWrap: "bg-violet-200/70 dark:bg-violet-800/50",
      iconColor: "text-violet-700 dark:text-violet-200",
      text: "text-violet-800 dark:text-violet-100",
      label: "Assembly",
    });
  }

  if (haystack.includes("lunch")) {
    return base({
      Icon: UtensilsCrossed,
      rowBg: "bg-amber-50/90 dark:bg-amber-950/25",
      rowBorder: "border-amber-200/80 dark:border-amber-800/60",
      cellBg: "bg-amber-100/60 dark:bg-amber-900/30",
      cellBorder: "border-amber-200/90 dark:border-amber-700/70",
      iconWrap: "bg-amber-200/70 dark:bg-amber-800/50",
      iconColor: "text-amber-800 dark:text-amber-100",
      text: "text-amber-900 dark:text-amber-100",
      label: "Lunch",
    });
  }

  if (
    haystack.includes("short") ||
    haystack.includes("tea") ||
    haystack.includes("snack")
  ) {
    const isTea = haystack.includes("tea");
    return base({
      Icon: isTea ? CupSoda : Coffee,
      rowBg: "bg-sky-50/90 dark:bg-sky-950/25",
      rowBorder: "border-sky-200/80 dark:border-sky-800/60",
      cellBg: "bg-sky-100/60 dark:bg-sky-900/30",
      cellBorder: "border-sky-200/90 dark:border-sky-700/70",
      iconWrap: "bg-sky-200/70 dark:bg-sky-800/50",
      iconColor: "text-sky-700 dark:text-sky-200",
      text: "text-sky-800 dark:text-sky-100",
      label: isTea
        ? "Tea break"
        : haystack.includes("snack")
          ? "Snack break"
          : "Short break",
    });
  }

  if (haystack.includes("game") || haystack.includes("sport")) {
    return base({
      Icon: Trophy,
      rowBg: "bg-emerald-50/90 dark:bg-emerald-950/25",
      rowBorder: "border-emerald-200/80 dark:border-emerald-800/60",
      cellBg: "bg-emerald-100/60 dark:bg-emerald-900/30",
      cellBorder: "border-emerald-200/90 dark:border-emerald-700/70",
      iconWrap: "bg-emerald-200/70 dark:bg-emerald-800/50",
      iconColor: "text-emerald-700 dark:text-emerald-200",
      text: "text-emerald-800 dark:text-emerald-100",
    });
  }

  if (haystack.includes("recess")) {
    return base({
      Icon: Apple,
      rowBg: "bg-green-50/90 dark:bg-green-950/25",
      rowBorder: "border-green-200/80 dark:border-green-800/60",
      cellBg: "bg-green-100/60 dark:bg-green-900/30",
      cellBorder: "border-green-200/90 dark:border-green-700/70",
      iconWrap: "bg-green-200/70 dark:bg-green-800/50",
      iconColor: "text-green-700 dark:text-green-200",
      text: "text-green-800 dark:text-green-100",
      label: "Recess",
    });
  }

  if (haystack.includes("long")) {
    return base({
      Icon: Clock,
      rowBg: "bg-cyan-50/90 dark:bg-cyan-950/25",
      rowBorder: "border-cyan-200/80 dark:border-cyan-800/60",
      cellBg: "bg-cyan-100/60 dark:bg-cyan-900/30",
      cellBorder: "border-cyan-200/90 dark:border-cyan-700/70",
      iconWrap: "bg-cyan-200/70 dark:bg-cyan-800/50",
      iconColor: "text-cyan-700 dark:text-cyan-200",
      text: "text-cyan-800 dark:text-cyan-100",
      label: "Long break",
    });
  }

  return base({
    Icon: Pause,
    rowBg: "bg-slate-100/90 dark:bg-slate-800/40",
    rowBorder: "border-slate-200/80 dark:border-slate-700/60",
    cellBg: "bg-slate-100/80 dark:bg-slate-800/50",
    cellBorder: "border-slate-200/90 dark:border-slate-600/70",
    iconWrap: "bg-slate-200/70 dark:bg-slate-700/50",
    iconColor: "text-slate-600 dark:text-slate-300",
    text: "text-slate-700 dark:text-slate-200",
  });
}

function parseHHMM(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatHHMM(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

function formatCompactRange(start: string, end: string): string {
  const trim = (t: string) => t.replace(/^0(\d)/, "$1").trim();
  return `${trim(start)}–${trim(end)}`;
}

function slotTimeRange(slot: TimeSlotInfo | null | undefined): string | null {
  if (!slot) return null;
  if (slot.startTime && slot.endTime) {
    return formatCompactRange(slot.startTime, slot.endTime);
  }
  const raw = slot.displayTime || slot.time;
  if (!raw) return null;
  return raw.replace(/\s*[-–]\s*/g, "–").trim();
}

function breakTimeRange(
  breakEntry: BreakEntry,
  getSlotFor: (dayIndex: number, period: number) => TimeSlotInfo | null,
  periodNumbers: number[],
): string {
  if (breakEntry.startTime && breakEntry.endTime) {
    return formatCompactRange(breakEntry.startTime, breakEntry.endTime);
  }
  const duration = breakEntry.durationMinutes || 0;
  const afterPeriod = breakEntry.afterPeriod;

  if (afterPeriod === 0 || afterPeriod === -1) {
    const firstPeriod = periodNumbers[0];
    if (firstPeriod != null) {
      const first = getSlotFor(0, firstPeriod);
      if (first?.startTime) {
        const endMin = parseHHMM(first.startTime);
        return formatCompactRange(
          formatHHMM(endMin - duration),
          first.startTime,
        );
      }
    }
    return duration ? `${duration}m` : "";
  }

  const afterSlot = getSlotFor(0, afterPeriod);
  if (afterSlot?.endTime) {
    const startMin = parseHHMM(afterSlot.endTime);
    return formatCompactRange(
      afterSlot.endTime,
      formatHHMM(startMin + duration),
    );
  }

  return duration ? `${duration}m` : "";
}

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
  subject: { id?: string; name: string; code?: string };
  teacher: { id?: string; name: string; fullName?: string };
  roomNumber?: string | null;
  gradeId?: string;
  timeSlotId?: string;
  isDoublePeriod?: boolean;
  /** Second half of a double-period block (shown in the following slot). */
  isDoubleContinuation?: boolean;
  gradeLabel?: string;
  /** Full grade name for tooltips, e.g. Grade 7 · East */
  gradeFullLabel?: string;
  streamId?: string | null;
  streamLabel?: string | null;
  /** Grade (+ stream) label for whole-school view, e.g. G7 · East */
  gradeShortLabel?: string;
  /** Subject-grade shortcode kept for tooltips / legacy, e.g. MAT-G7 */
  shortLabel?: string;
  /** Subject code for whole-school chips, e.g. MAT */
  subjectCode?: string;
  /** Whole-school slot with no lesson scheduled yet */
  isEmpty?: boolean;
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
  conflictTooltipMap?: Map<string, string>;
  showFullSubjectName?: boolean;
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
  /** Show all classes in each cell (whole-school view). */
  schoolCombined?: boolean;
  getCombinedEntriesFor?: (dayOfWeek: number, period: number) => LessonEntry[];
  onCombinedLessonClick?: (entry: LessonEntry) => void;
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
  conflictTooltipMap,
  showFullSubjectName,
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
  schoolCombined = false,
  getCombinedEntriesFor,
  onCombinedLessonClick,
}: AdminTimetableGridProps) {
  const cleanName = getCleanBreakName || ((name: string) => name);
  const [mobileDayIndex, setMobileDayIndex] = useState(0);
  const isMobile = useIsMobile();
  const accentFor = resolveAccent ?? getSubjectAccent;

  const visibleDayIndices = useMemo(
    () => (isMobile ? [mobileDayIndex] : days.map((_, index) => index)),
    [isMobile, mobileDayIndex, days],
  );

  useEffect(() => {
    setMobileDayIndex(0);
  }, [days.length]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-950/40",
        className,
      )}
    >
      {days.length > 1 && isMobile && (
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
                T_CELL_SM,
                "flex-1 min-w-0 rounded-lg px-1.5 py-1 font-semibold tracking-tight transition-colors",
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
        <table
          className="w-full min-w-0 table-fixed border-collapse md:min-w-[520px]"
          aria-label={schoolCombined ? "Whole-school timetable" : "Timetable"}
        >
          <thead>
            <tr className="border-b border-zinc-200/90 dark:border-zinc-800">
              <th
                className={cn(
                  "sticky left-0 z-20 border-r border-zinc-200/90 bg-zinc-100/95 px-2 py-2 text-left dark:border-zinc-800 dark:bg-zinc-900/95",
                  TIME_COL_W,
                )}
                scope="col"
              >
                <span className={cn(T_CELL_SM, "font-semibold text-zinc-500")}>
                  When
                </span>
              </th>
              {visibleDayIndices.map((index) => (
                <th
                  key={days[index]}
                  scope="col"
                  className="min-w-[72px] border-r border-zinc-200/60 bg-zinc-100/70 px-1 py-2 text-center last:border-r-0 dark:border-zinc-800 dark:bg-zinc-900/70 md:min-w-[84px]"
                >
                  <span
                    className={cn(
                      T_CELL,
                      "block font-semibold text-zinc-800 dark:text-zinc-100",
                    )}
                  >
                    {days[index].slice(0, 3)}
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
                  <td className="sticky left-0 border-r border-zinc-200/90 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
                    <div
                      className={cn(
                        ROW_H,
                        "animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800",
                      )}
                    />
                  </td>
                  {visibleDayIndices.map((di) => (
                    <td key={di} className="p-1">
                      <div
                        className={cn(
                          ROW_H,
                          "animate-pulse rounded-md bg-zinc-100/80 dark:bg-zinc-800/60",
                        )}
                      />
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
                      No lesson times yet
                    </p>
                    <p className="text-[12px] leading-relaxed text-zinc-500">
                      Set when lessons start and how long they run, then add
                      subjects to the grid.
                    </p>
                    <Button
                      size="sm"
                      onClick={onCreateSchedule}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Set up lesson times
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                <BreakBeforeFirstRow
                  breaks={getBreaksBeforeFirstPeriod()}
                  visibleDayIndices={visibleDayIndices}
                  cleanName={cleanName}
                  getSlotFor={getSlotFor}
                  periodNumbers={periodNumbers}
                  onEditBreak={onEditBreak}
                  onMoveBreak={onMoveBreak}
                  movingBreakId={movingBreakId}
                />

                {periodNumbers.map((period, periodIndex) => {
                  const baseSlot = days.reduce<TimeSlotInfo | null>(
                    (found, _, dayIndex) => {
                      if (found) return found;
                      return getSlotFor(dayIndex, period);
                    },
                    null,
                  );
                  const rowSlot: TimeSlotInfo =
                    baseSlot ?? {
                      id: `period-${period}`,
                      periodNumber: period,
                      time: `Period ${period}`,
                      startTime: "",
                      endTime: "",
                    };

                  const breaksAfter = getBreaksAfterPeriod(period);
                  const prevPeriodNumber =
                    periodIndex > 0 ? periodNumbers[periodIndex - 1] : null;
                  const rowHasDoubleBlock = days.some((_, dayIndex) => {
                    if (schoolCombined) {
                      return (
                        getCombinedEntriesFor?.(dayIndex + 1, period) ?? []
                      ).some(
                        (e) => e.isDoublePeriod && !e.isDoubleContinuation,
                      );
                    }
                    const e = getEntryFor(dayIndex + 1, period);
                    return e?.isDoublePeriod === true;
                  });
                  const rowIsDoubleContinuation =
                    prevPeriodNumber != null &&
                    days.some((_, dayIndex) => {
                      if (schoolCombined) {
                        return (
                          getCombinedEntriesFor?.(dayIndex + 1, period) ?? []
                        ).some((e) => e.isDoubleContinuation);
                      }
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
                          "group/row border-b border-zinc-200/70 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/30",
                          rowIsDoubleContinuation &&
                            "bg-zinc-50/80 dark:bg-zinc-900/40",
                        )}
                      >
                        <td className="sticky left-0 z-10 border-r border-zinc-200/90 bg-white p-0 align-middle dark:border-zinc-800 dark:bg-zinc-900">
                          <TimeColumnCell
                            slot={rowSlot}
                            period={period}
                            isDoubleBlockRow={rowHasDoubleBlock}
                            isDoubleContinuation={rowIsDoubleContinuation}
                            onEdit={onEditTimeslot}
                            onAddBreak={schoolCombined ? undefined : onAddBreak}
                          />
                        </td>

                        {visibleDayIndices.map((dayIndex) => {
                          const dayOfWeek = dayIndex + 1;
                          const daySlot = getSlotFor(dayIndex, period);
                          const entry = schoolCombined
                            ? null
                            : getEntryFor(dayOfWeek, period);
                          const combinedEntries = schoolCombined
                            ? (getCombinedEntriesFor?.(dayOfWeek, period) ?? [])
                            : [];
                          const prevEntry =
                            prevPeriodNumber != null
                              ? getEntryFor(dayOfWeek, prevPeriodNumber)
                              : null;
                          const breakAfterPrev =
                            prevPeriodNumber != null
                              ? getBreaksAfterPeriod(prevPeriodNumber).length >
                                0
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

                          if (schoolCombined) {
                            return (
                              <td
                                key={dayIndex}
                                className="h-px bg-white p-1 align-top dark:bg-zinc-900/40"
                              >
                                <CombinedLessonCell
                                  entries={combinedEntries}
                                  accentFor={accentFor}
                                  conflictLessonIds={conflictLessonIds}
                                  conflictTooltipMap={conflictTooltipMap}
                                  showFullSubjectName={showFullSubjectName}
                                  highlightTeacherId={highlightTeacherId}
                                  onSelect={onCombinedLessonClick}
                                />
                              </td>
                            );
                          }

                          return (
                            <td
                              key={dayIndex}
                              rowSpan={spansDouble ? 2 : undefined}
                              className="h-px bg-white p-1 align-middle dark:bg-zinc-900/40"
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
                                    isBlockLesson={
                                      entry.isDoublePeriod === true
                                    }
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
                                  className={cn(
                                    ROW_H,
                                    "group/empty flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-zinc-300/90 bg-zinc-50/80 text-zinc-400 transition-colors",
                                    "hover:border-slate-400 hover:bg-white hover:text-slate-700",
                                    "focus-visible:border-slate-900 focus-visible:bg-white focus-visible:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20",
                                    "active:bg-slate-50 dark:border-zinc-600 dark:bg-zinc-900/40 dark:hover:border-zinc-500 dark:hover:bg-zinc-900",
                                  )}
                                  title="Add a lesson"
                                  aria-label="Add a lesson"
                                >
                                  <Plus className="h-4 w-4 opacity-50 transition-opacity group-hover/empty:opacity-100 group-focus-visible/empty:opacity-100" />
                                  <span className="text-[11px] font-medium opacity-70 transition-opacity group-hover/empty:opacity-100 group-focus-visible/empty:opacity-100">
                                    Add lesson
                                  </span>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {breaksAfter.length > 0 && (
                        <BreakRow
                          breaks={breaksAfter}
                          visibleDayIndices={visibleDayIndices}
                          cleanName={cleanName}
                          getSlotFor={getSlotFor}
                          periodNumbers={periodNumbers}
                          onEditBreak={onEditBreak}
                          onMoveBreak={onMoveBreak}
                          movingBreakId={movingBreakId}
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

function lessonTooltip(entry: LessonEntry, extra?: string) {
  const parts = [entry.subject.name, entry.teacher.name];
  if (entry.roomNumber) parts.push(`Room ${entry.roomNumber}`);
  if (extra) parts.unshift(extra);
  return parts.join(" · ");
}

function CombinedChipTooltipContent({
  entry,
  conflictTooltip,
}: {
  entry: LessonEntry;
  conflictTooltip?: string;
}) {
  const gradeName =
    entry.gradeFullLabel ??
    entry.gradeLabel ??
    entry.gradeShortLabel ??
    "Class";
  const teacherName =
    entry.teacher.fullName?.trim() || entry.teacher.name?.trim() || null;

  if (entry.isEmpty) {
    return (
      <div className="space-y-0.5 text-left">
        <p className="font-medium leading-snug">{gradeName}</p>
        <p className="text-white/70 leading-snug">No lesson scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 text-left">
      <p className="font-medium leading-snug">{gradeName}</p>
      <p className="leading-snug text-white/95">{entry.subject.name}</p>
      {teacherName ? (
        <p className="leading-snug text-white/75">{teacherName}</p>
      ) : null}
      {entry.roomNumber ? (
        <p className="text-[11px] leading-snug text-white/60">
          Room {entry.roomNumber}
        </p>
      ) : null}
      {entry.isDoublePeriod ? (
        <p className="text-[11px] leading-snug text-white/60">
          {entry.isDoubleContinuation
            ? "Double period · 2nd half"
            : "Double period"}
        </p>
      ) : null}
      {conflictTooltip ? (
        <p className="mt-1 flex gap-1 border-t border-red-400/30 pt-1 text-[11px] leading-snug text-red-300">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
          <span>{conflictTooltip}</span>
        </p>
      ) : null}
    </div>
  );
}

function TimeColumnCell({
  slot,
  period,
  isDoubleBlockRow,
  isDoubleContinuation,
  onEdit,
  onAddBreak,
}: {
  slot: TimeSlotInfo;
  period: number;
  isDoubleBlockRow?: boolean;
  isDoubleContinuation?: boolean;
  onEdit?: (slot: TimeSlotInfo) => void;
  onAddBreak?: (afterPeriod: number) => void;
}) {
  const timeLabel = slotTimeRange(slot) ?? "—";

  return (
    <div
      className={cn(
        "flex flex-col justify-center gap-0.5 px-2 py-1.5",
        TIME_COL_W,
        isDoubleBlockRow ? DOUBLE_ROW_H : "min-h-[44px]",
        "border-l-[3px] border-l-slate-300 dark:border-l-slate-600",
        isDoubleBlockRow &&
          "bg-gradient-to-b from-violet-50/80 to-transparent dark:from-violet-950/20",
        isDoubleContinuation && "border-l-violet-300 dark:border-l-violet-700",
      )}
    >
      <button
        type="button"
        onClick={() => onEdit?.(slot)}
        className="w-full rounded-md px-1 py-0.5 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
        title={`Edit times · ${timeLabel}`}
      >
        <p
          className={cn(
            T_CELL,
            "whitespace-nowrap font-mono font-medium tabular-nums text-slate-700 dark:text-slate-200",
          )}
        >
          {timeLabel}
        </p>
      </button>

      {onAddBreak ? (
        <button
          type="button"
          onClick={() => onAddBreak(period)}
          className={cn(
            LINK_ACTION,
            "self-start opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100 max-sm:opacity-100",
          )}
          title="Add a break after this lesson block"
        >
          <Plus className="h-3 w-3" />
          Add break
        </button>
      ) : null}
    </div>
  );
}

function CombinedLessonCell({
  entries,
  accentFor,
  conflictLessonIds,
  conflictTooltipMap,
  showFullSubjectName,
  highlightTeacherId,
  onSelect,
}: {
  entries: LessonEntry[];
  accentFor: (subjectId: string, subjectName: string) => SubjectAccentStyle;
  conflictLessonIds?: Set<string>;
  conflictTooltipMap?: Map<string, string>;
  showFullSubjectName?: boolean;
  highlightTeacherId?: string | null;
  onSelect?: (entry: LessonEntry) => void;
}) {
  if (entries.length === 0) {
    return (
      <div
        className="relative flex min-h-[44px] items-center justify-center overflow-hidden rounded border border-dashed border-zinc-200/70 bg-[linear-gradient(135deg,rgba(248,250,252,0.9)_25%,transparent_25%,transparent_50%,rgba(248,250,252,0.9)_50%,rgba(248,250,252,0.9)_75%,transparent_75%,transparent)] bg-[length:8px_8px] dark:border-zinc-700/60 dark:bg-zinc-900/20"
        role="presentation"
        aria-label="No classes configured"
      >
        <span
          className="text-[10px] font-medium uppercase tracking-widest text-zinc-300/80 dark:text-zinc-600"
          aria-hidden
        >
          —
        </span>
      </div>
    );
  }

  const dense = entries.length >= 6;
  const twoColumn = entries.length > 1;
  const manyEntries = entries.length >= 15;
  const [expanded, setExpanded] = useState(false);

  return (
    <TooltipProvider delayDuration={250}>
      <div
        className={cn(
          "grid min-h-[44px] grid-cols-2 overscroll-contain",
          manyEntries && !expanded
            ? "overflow-y-auto max-h-56"
            : "overflow-y-visible",
          dense ? "gap-0.5" : "gap-1",
        )}
      >
        {entries.map((entry) => (
          <TooltipPrimitive.Root
            key={`${entry.id}-${entry.isDoubleContinuation ? "cont" : "slot"}`}
          >
            <TooltipPrimitive.Trigger asChild>
              <CombinedShortcodeChip
                entry={entry}
                accent={
                  entry.isEmpty
                    ? {
                        background: "rgba(248,250,252,0.6)",
                        border: "rgba(226,232,240,0.8)",
                        accent: "rgba(148,163,184,0.5)",
                        text: "rgba(148,163,184,0.9)",
                      }
                    : accentFor(
                        entry.subject.id ?? entry.id,
                        entry.subject.name,
                      )
                }
                showFullSubjectName={showFullSubjectName}
                hasConflict={
                  !entry.isEmpty && !!conflictLessonIds?.has(entry.id)
                }
                isTeacherDimmed={
                  !entry.isEmpty &&
                  !!highlightTeacherId &&
                  entry.teacher.id !== highlightTeacherId
                }
                compact={twoColumn || dense}
                onSelect={() => onSelect?.(entry)}
              />
            </TooltipPrimitive.Trigger>
            <TooltipContent
              side="top"
              sideOffset={4}
              className="max-w-[260px] border-0 px-3 py-2 text-xs"
            >
              <CombinedChipTooltipContent
                entry={entry}
                conflictTooltip={conflictTooltipMap?.get(entry.id)}
              />
            </TooltipContent>
          </TooltipPrimitive.Root>
        ))}
        {manyEntries && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="col-span-2 flex items-center justify-center gap-1 rounded border border-dashed border-slate-200/70 bg-slate-50/60 py-1 text-[10px] font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100/80 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 dark:border-zinc-700/50 dark:bg-zinc-900/30 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/40"
            aria-expanded={expanded}
          >
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform duration-200",
                expanded && "rotate-180",
              )}
            />
            {expanded ? "Show less" : `Show all ${entries.length} classes`}
          </button>
        )}
      </div>
    </TooltipProvider>
  );
}

function CombinedShortcodeChip({
  entry,
  accent,
  hasConflict,
  isTeacherDimmed,
  compact,
  showFullSubjectName,
  onSelect,
}: {
  entry: LessonEntry;
  accent: SubjectAccentStyle;
  hasConflict: boolean;
  isTeacherDimmed: boolean;
  compact?: boolean;
  showFullSubjectName?: boolean;
  onSelect: () => void;
}) {
  const isEmpty = entry.isEmpty === true;
  const displayGrade =
    entry.gradeShortLabel?.split(" · ")[0]?.trim() ??
    entry.gradeLabel ??
    entry.shortLabel ??
    "?";
  const displayStream = entry.streamLabel?.trim() || null;
  const subjectCode = isEmpty
    ? null
    : (entry.subjectCode ??
      entry.subject.code?.trim()?.toUpperCase() ??
      entry.subject.name.slice(0, 4).toUpperCase());
  const isDoubleStart =
    !isEmpty && entry.isDoublePeriod && !entry.isDoubleContinuation;
  const isDoubleCont = !isEmpty && entry.isDoubleContinuation === true;

  const chipLabel = useMemo(() => {
    const parts = [displayGrade];
    if (displayStream) parts.push(displayStream);
    if (isEmpty) {
      parts.push("— No lesson scheduled");
    } else {
      parts.push(entry.subject.name);
      const teacherName =
        entry.teacher.fullName?.trim() || entry.teacher.name?.trim();
      if (teacherName) parts.push(teacherName);
      if (hasConflict) parts.push("conflict");
    }
    return parts.join(", ");
  }, [
    displayGrade,
    displayStream,
    isEmpty,
    entry.subject.name,
    entry.teacher.fullName,
    entry.teacher.name,
    hasConflict,
  ]);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={chipLabel}
      className={cn(
        "group/chip relative flex min-w-0 items-center overflow-hidden rounded border text-left",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50",
        compact ? "min-h-[32px]" : "min-h-[38px]",
        isEmpty
          ? "border-dashed border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 dark:border-zinc-700/70 dark:bg-zinc-900/20"
          : cn(
              "shadow-[0_1px_0_rgba(15,23,42,0.04)] hover:-translate-y-px hover:shadow-sm",
              isTeacherDimmed && "opacity-35 saturate-50",
              isDoubleCont &&
                "border-dashed opacity-90 dark:border-zinc-600/70",
              hasConflict
                ? "border-red-300/80 bg-gradient-to-r from-red-50 to-red-50/40 dark:border-red-900/60 dark:from-red-950/40 dark:to-red-950/10"
                : "border-slate-200/80 bg-white/90 dark:border-zinc-700/50 dark:bg-zinc-900/40",
            ),
      )}
      style={
        isEmpty || hasConflict
          ? undefined
          : {
              background: `linear-gradient(135deg, ${accent.background} 0%, rgba(255,255,255,0.97) 70%)`,
            }
      }
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col justify-center",
          compact ? "gap-0 px-1 py-0.5" : "gap-0.5 px-1.5 py-1",
          (isDoubleStart || isDoubleCont) && "pr-4",
        )}
      >
        <div className="flex min-w-0 items-baseline gap-1 leading-none">
          <span
            className={cn(
              "shrink-0 font-semibold uppercase tracking-wide",
              compact ? "text-[9px]" : "text-[10px]",
              isEmpty
                ? "text-slate-400 dark:text-slate-500"
                : "text-slate-800 dark:text-slate-100",
              hasConflict && "text-red-700 dark:text-red-400",
            )}
          >
            {displayGrade}
          </span>
          {displayStream ? (
            <span
              className={cn(
                "min-w-0 truncate font-medium",
                compact ? "text-[8px]" : "text-[9px]",
                isEmpty
                  ? "text-slate-400 dark:text-slate-500"
                  : "text-slate-500 dark:text-slate-400",
              )}
            >
              · {displayStream}
            </span>
          ) : null}
        </div>

        {isEmpty ? (
          <span
            className={cn(
              "font-medium leading-none text-slate-300 dark:text-slate-600",
              compact ? "text-[8px]" : "text-[9px]",
            )}
          >
            —
          </span>
        ) : subjectCode ? (
          <span
            className={cn(
              "min-w-0 truncate font-semibold leading-none tracking-wide",
              showFullSubjectName
                ? "text-[9px] normal-case"
                : "text-[8px] uppercase",
              compact
                ? showFullSubjectName
                  ? "text-[8px]"
                  : "text-[7px]"
                : "",
              hasConflict ? "text-red-600 dark:text-red-400" : "",
            )}
            style={hasConflict ? undefined : { color: accent.text }}
            title={
              showFullSubjectName ? (subjectCode ?? "") : entry.subject.name
            }
          >
            {showFullSubjectName ? entry.subject.name : subjectCode}
          </span>
        ) : null}
      </div>

      {isDoubleStart ? (
        <span
          className={cn(
            "absolute right-0.5 top-0.5 rounded px-1 font-bold leading-none text-white",
            "bg-violet-600",
            compact ? "py-px text-[7px]" : "py-0.5 text-[8px]",
          )}
        >
          2×
        </span>
      ) : null}

      {isDoubleCont ? (
        <span
          className={cn(
            "absolute right-0.5 top-0.5 rounded px-1 font-semibold leading-none",
            "bg-violet-100 text-violet-700",
            "dark:bg-violet-950/60 dark:text-violet-300",
            compact ? "py-px text-[7px]" : "py-0.5 text-[8px]",
          )}
        >
          2/2
        </span>
      ) : null}

      {hasConflict ? (
        <AlertCircle
          className={cn(
            "absolute bottom-0.5 right-0.5 shrink-0 text-red-600 dark:text-red-400",
            compact ? "h-2.5 w-2.5" : "h-3 w-3",
          )}
          aria-hidden
        />
      ) : null}
    </button>
  );
}

function AdminLessonCell({
  entry,
  accent,
  hasConflict,
  isDimmed,
  isBlockLesson,
  onEdit,
}: {
  entry: LessonEntry;
  accent: SubjectAccentStyle;
  hasConflict: boolean;
  isDimmed?: boolean;
  isBlockLesson?: boolean;
  onEdit?: (lesson: LessonEntry) => void;
  onDelete?: (lesson: LessonEntry) => void;
}) {
  const label = isBlockLesson
    ? `Double · ${entry.subject.name}`
    : entry.subject.name;

  return (
    <div
      className={cn(
        "group/lesson relative flex cursor-pointer items-center overflow-hidden rounded-md border px-2",
        ROW_H,
        isDimmed && "opacity-40 saturate-[0.65]",
        hasConflict
          ? "border-red-200/90 bg-red-50/90 dark:border-red-900/50 dark:bg-red-950/25"
          : "border-zinc-200/60 dark:border-zinc-700/70",
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
      title={lessonTooltip(entry, isBlockLesson ? "Double period" : undefined)}
      onClick={() => onEdit?.(entry)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit?.(entry);
        }
      }}
    >
      <span
        className="mr-0.5 h-1.5 w-px shrink-0 rounded-full"
        style={{ backgroundColor: hasConflict ? "#dc2626" : accent.accent }}
        aria-hidden
      />
      <p
        className={cn(T_CELL, "min-w-0 flex-1 truncate font-medium")}
        style={{ color: hasConflict ? undefined : accent.text }}
      >
        {label}
      </p>
      {hasConflict && (
        <AlertCircle className="h-3 w-3 shrink-0 text-red-500" aria-hidden />
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
        "group/lesson relative flex h-full cursor-pointer flex-col justify-center overflow-hidden rounded-md border px-2 py-1",
        DOUBLE_ROW_H,
        isDimmed && "opacity-40 saturate-[0.65]",
        hasConflict
          ? "border-red-200/90 bg-red-50/90 dark:border-red-900/50 dark:bg-red-950/25"
          : "border-zinc-200/60 dark:border-zinc-700/70",
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
      title={lessonTooltip(entry, "Double period")}
      onClick={() => onEdit?.(entry)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit?.(entry);
        }
      }}
    >
      <p
        className={cn(T_CELL, "truncate font-medium")}
        style={{ color: hasConflict ? undefined : accent.text }}
      >
        Double · {entry.subject.name}
      </p>
      {hasConflict && (
        <AlertCircle className="absolute right-px top-px h-2 w-2 text-red-500" />
      )}
    </div>
  );
}

function BreakRow({
  breaks,
  visibleDayIndices,
  cleanName,
  getSlotFor,
  periodNumbers,
  onEditBreak,
  onMoveBreak,
  movingBreakId,
}: {
  breaks: BreakEntry[];
  visibleDayIndices: number[];
  cleanName: (name: string) => string;
  getSlotFor: (dayIndex: number, period: number) => TimeSlotInfo | null;
  periodNumbers: number[];
  onEditBreak?: (breakEntry: BreakEntry) => void;
  onMoveBreak?: (breakEntry: BreakEntry, direction: -1 | 1) => void;
  movingBreakId?: string | null;
}) {
  const primary = breaks[0];
  if (!primary) return null;

  const visual = resolveBreakVisual(primary, cleanName);
  const { Icon } = visual;
  const timeLabel = breakTimeRange(primary, getSlotFor, periodNumbers);
  const afterPeriod = primary.afterPeriod ?? 0;
  const maxPeriod = periodNumbers[periodNumbers.length - 1] ?? 0;
  const isMoving = !!primary.id && movingBreakId === primary.id;
  const canMoveUp = afterPeriod > 0 && !isMoving;
  const canMoveDown = afterPeriod < maxPeriod && !isMoving;

  return (
    <tr className={cn("group/break border-y", visual.rowBorder, visual.rowBg)}>
      <td
        className={cn(
          "sticky left-0 z-10 border-r p-0",
          visual.rowBorder,
          visual.rowBg,
          TIME_COL_W,
        )}
      >
        <div className="relative flex min-h-[44px] items-center px-2">
          <button
            type="button"
            onClick={() => onEditBreak?.(primary)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-1 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
            title={`Edit ${visual.label}`}
            aria-label={`Edit ${visual.label}`}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                visual.iconWrap,
              )}
            >
              <Icon className={cn("h-4 w-4", visual.iconColor)} aria-hidden />
            </div>
            <div className="min-w-0 leading-tight">
              <p
                className={cn(
                  T_CELL,
                  "whitespace-nowrap font-semibold",
                  visual.text,
                )}
              >
                {visual.label}
              </p>
              {timeLabel ? (
                <p
                  className={cn(
                    T_CELL_SM,
                    "whitespace-nowrap font-mono tabular-nums opacity-80",
                    visual.text,
                  )}
                >
                  {timeLabel}
                </p>
              ) : null}
            </div>
          </button>

          {primary.id && onMoveBreak ? (
            <div className="ml-0.5 flex shrink-0 flex-col opacity-0 transition-opacity group-hover/break:opacity-100 focus-within:opacity-100 max-sm:opacity-100">
              <button
                type="button"
                disabled={!canMoveUp}
                onClick={() => onMoveBreak(primary, -1)}
                className={cn(
                  "rounded p-0.5 transition-colors hover:bg-black/[0.06] disabled:opacity-30",
                  visual.iconColor,
                )}
                title="Move break earlier in the day"
                aria-label="Move break earlier in the day"
              >
                {isMoving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                disabled={!canMoveDown}
                onClick={() => onMoveBreak(primary, 1)}
                className={cn(
                  "rounded p-0.5 transition-colors hover:bg-black/[0.06] disabled:opacity-30",
                  visual.iconColor,
                )}
                title="Move break later in the day"
                aria-label="Move break later in the day"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      </td>
      {visibleDayIndices.map((dayIndex) => {
        const dayBreak = breaks.find(
          (b) => b.applyToAllDays || b.dayOfWeek === dayIndex + 1,
        );
        const cellVisual = dayBreak
          ? resolveBreakVisual(dayBreak, cleanName)
          : visual;
        const CellIcon = cellVisual.Icon;

        return (
          <td
            key={dayIndex}
            className={cn(
              "border-r p-0 align-middle last:border-r-0",
              visual.rowBorder,
            )}
          >
            {dayBreak ? (
              <button
                type="button"
                onClick={() => onEditBreak?.(dayBreak)}
                className={cn(
                  ROW_H,
                  "flex w-full items-center justify-center transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05]",
                )}
                title={cleanName(dayBreak.name)}
                aria-label={`Edit ${cellVisual.label}`}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    cellVisual.iconWrap,
                  )}
                >
                  <CellIcon
                    className={cn("h-4 w-4", cellVisual.iconColor)}
                    aria-hidden
                  />
                </div>
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
                className={cn(
                  ROW_H,
                  "flex w-full items-center justify-center gap-1 border border-dashed border-zinc-300/70 bg-white/50 text-zinc-400 transition-colors hover:border-zinc-400 hover:bg-white hover:text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/20 dark:hover:border-zinc-500",
                )}
                title={`Add ${visual.label} on this day`}
                aria-label={`Add ${visual.label} on this day`}
              >
                <Plus className="h-3.5 w-3.5" />
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
  visibleDayIndices,
  cleanName,
  getSlotFor,
  periodNumbers,
  onEditBreak,
  onMoveBreak,
  movingBreakId,
}: {
  breaks: BreakEntry[];
  visibleDayIndices: number[];
  cleanName: (name: string) => string;
  getSlotFor: (dayIndex: number, period: number) => TimeSlotInfo | null;
  periodNumbers: number[];
  onEditBreak?: (breakEntry: BreakEntry) => void;
  onMoveBreak?: (breakEntry: BreakEntry, direction: -1 | 1) => void;
  movingBreakId?: string | null;
}) {
  if (breaks.length === 0) return null;
  return (
    <BreakRow
      breaks={breaks}
      visibleDayIndices={visibleDayIndices}
      cleanName={cleanName}
      getSlotFor={getSlotFor}
      periodNumbers={periodNumbers}
      onEditBreak={onEditBreak}
      onMoveBreak={onMoveBreak}
      movingBreakId={movingBreakId}
    />
  );
}

export default AdminTimetableGrid;
