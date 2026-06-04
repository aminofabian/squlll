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
  getGradeStreamAccent,
  getSubjectAccent,
  type SubjectAccentStyle,
} from "../utils/timetableSubjectColors";
/** Compact row sizing — min-height only on lessons so wrapped names can grow */
const T_CELL = "text-[11px] leading-snug";
const T_CELL_SM = "text-[10px] leading-tight";
const ROW_H = "h-9 min-h-[36px]";
const LESSON_CELL_MIN = "min-h-[36px] py-1";
const DOUBLE_ROW_H = "min-h-[72px]";
const TIME_COL_W = "w-[108px] md:w-[120px]";
const TIME_RAIL_MIN = "min-h-[36px]";
const TD_PAD = "p-0.5";

const BREAK_ROW_H = "min-h-[36px]";
const BREAK_LABEL =
  "text-[10px] font-semibold uppercase tracking-[0.12em] leading-none";
const BREAK_TIME =
  "text-[10px] font-medium font-mono tabular-nums leading-none tracking-tight opacity-60";
const BREAK_CHANNEL =
  "max-lg:py-2 max-lg:px-0 dark:max-lg:bg-transparent";

const LINK_ACTION =
  "inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-30 dark:text-slate-500 dark:hover:bg-slate-800/60 dark:hover:text-slate-200";

type BreakVisual = {
  Icon: LucideIcon;
  label: string;
  cellBg: string;
  cellBorder: string;
  rowBand: string;
  rowBorder: string;
  divider: string;
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
      cellBg: "bg-white dark:bg-violet-950/40",
      cellBorder: "border-violet-200/75 dark:border-violet-800/45",
      rowBand: "bg-violet-50/90 dark:bg-violet-950/25",
      rowBorder: "lg:border-violet-200/80 dark:lg:border-violet-800/50",
      divider: "border-violet-200/70 dark:border-violet-800/35",
      iconWrap: "bg-violet-50 ring-1 ring-violet-100 dark:bg-violet-900/40 dark:ring-violet-800/50",
      iconColor: "text-violet-600 dark:text-violet-300",
      text: "text-violet-900 dark:text-violet-100",
      label: "Assembly",
    });
  }

  if (haystack.includes("lunch")) {
    return base({
      Icon: UtensilsCrossed,
      cellBg: "bg-white dark:bg-amber-950/40",
      cellBorder: "border-amber-200/75 dark:border-amber-800/45",
      rowBand: "bg-amber-50/90 dark:bg-amber-950/25",
      rowBorder: "lg:border-amber-200/80 dark:lg:border-amber-800/50",
      divider: "border-amber-200/70 dark:border-amber-800/35",
      iconWrap: "bg-amber-50 ring-1 ring-amber-100 dark:bg-amber-900/40 dark:ring-amber-800/50",
      iconColor: "text-amber-700 dark:text-amber-300",
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
      cellBg: "bg-white dark:bg-sky-950/40",
      cellBorder: "border-sky-200/75 dark:border-sky-800/45",
      rowBand: "bg-sky-50/90 dark:bg-sky-950/25",
      rowBorder: "lg:border-sky-200/80 dark:lg:border-sky-800/50",
      divider: "border-sky-200/70 dark:border-sky-800/35",
      iconWrap: "bg-sky-50 ring-1 ring-sky-100 dark:bg-sky-900/40 dark:ring-sky-800/50",
      iconColor: "text-sky-600 dark:text-sky-300",
      text: "text-sky-900 dark:text-sky-100",
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
      cellBg: "bg-white dark:bg-emerald-950/40",
      cellBorder: "border-emerald-200/75 dark:border-emerald-800/45",
      rowBand: "bg-emerald-50/90 dark:bg-emerald-950/25",
      rowBorder: "lg:border-emerald-200/80 dark:lg:border-emerald-800/50",
      divider: "border-emerald-200/70 dark:border-emerald-800/35",
      iconWrap: "bg-emerald-50 ring-1 ring-emerald-100 dark:bg-emerald-900/40 dark:ring-emerald-800/50",
      iconColor: "text-emerald-600 dark:text-emerald-300",
      text: "text-emerald-900 dark:text-emerald-100",
    });
  }

  if (haystack.includes("recess")) {
    return base({
      Icon: Apple,
      cellBg: "bg-white dark:bg-green-950/40",
      cellBorder: "border-green-200/75 dark:border-green-800/45",
      rowBand: "bg-green-50/90 dark:bg-green-950/25",
      rowBorder: "lg:border-green-200/80 dark:lg:border-green-800/50",
      divider: "border-green-200/70 dark:border-green-800/35",
      iconWrap: "bg-green-50 ring-1 ring-green-100 dark:bg-green-900/40 dark:ring-green-800/50",
      iconColor: "text-green-600 dark:text-green-300",
      text: "text-green-900 dark:text-green-100",
      label: "Recess",
    });
  }

  if (haystack.includes("long")) {
    return base({
      Icon: Clock,
      cellBg: "bg-white dark:bg-cyan-950/40",
      cellBorder: "border-cyan-200/75 dark:border-cyan-800/45",
      rowBand: "bg-cyan-50/90 dark:bg-cyan-950/25",
      rowBorder: "lg:border-cyan-200/80 dark:lg:border-cyan-800/50",
      divider: "border-cyan-200/70 dark:border-cyan-800/35",
      iconWrap: "bg-cyan-50 ring-1 ring-cyan-100 dark:bg-cyan-900/40 dark:ring-cyan-800/50",
      iconColor: "text-cyan-600 dark:text-cyan-300",
      text: "text-cyan-900 dark:text-cyan-100",
      label: "Long break",
    });
  }

  return base({
    Icon: Pause,
    cellBg: "bg-white dark:bg-slate-900/50",
    cellBorder: "border-slate-200/75 dark:border-slate-700/45",
    rowBand: "bg-slate-100/90 dark:bg-slate-800/35",
    rowBorder: "lg:border-slate-200/80 dark:lg:border-slate-700/50",
    divider: "border-slate-200/70 dark:border-slate-700/35",
    iconWrap: "bg-slate-50 ring-1 ring-slate-100 dark:bg-slate-800/40 dark:ring-slate-700/50",
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

/**
 * Extra minutes not yet reflected in stored period times.
 * School-wide breaks are already applied when periods were recalculated.
 */
function breakMinutesAtPosition(breaks: BreakEntry[]): number {
  const notInBellSchedule = breaks.filter((b) => !b.applyToAllDays);
  if (notInBellSchedule.length === 0) return 0;
  return notInBellSchedule[0].durationMinutes || 0;
}

/** Minutes from breaks that shift the bell schedule before this period. */
function breakMinutesBeforePeriod(
  period: number,
  periodNumbers: number[],
  getBreaksAfterPeriod: (p: number) => BreakEntry[],
  getBreaksBeforeFirstPeriod: () => BreakEntry[],
): number {
  let total = breakMinutesAtPosition(getBreaksBeforeFirstPeriod());

  for (const p of periodNumbers) {
    if (p >= period) break;
    total += breakMinutesAtPosition(getBreaksAfterPeriod(p));
  }

  return total;
}

function slotTimeRangeWithBreaks(
  slot: TimeSlotInfo | null | undefined,
  period: number,
  periodNumbers: number[],
  getBreaksAfterPeriod: (p: number) => BreakEntry[],
  getBreaksBeforeFirstPeriod: () => BreakEntry[],
): string | null {
  if (!slot?.startTime || !slot?.endTime) {
    return slotTimeRange(slot);
  }

  const shift = breakMinutesBeforePeriod(
    period,
    periodNumbers,
    getBreaksAfterPeriod,
    getBreaksBeforeFirstPeriod,
  );
  if (shift <= 0) {
    return slotTimeRange(slot);
  }

  return formatCompactRange(
    formatHHMM(parseHHMM(slot.startTime) + shift),
    formatHHMM(parseHHMM(slot.endTime) + shift),
  );
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

function breakBlocksDoubleSpan(
  getBreaksAfterPeriod: (period: number) => BreakEntry[],
  dayOfWeek: number,
  afterPeriod: number,
): boolean {
  return getBreaksAfterPeriod(afterPeriod).some(
    (b) => b.applyToAllDays || b.dayOfWeek === dayOfWeek,
  );
}

/** Subtle paired styling so double-lesson halves read as one block. */
function doubleBlockSurfaceClass({
  isDoubleStart,
  isDoubleContinuation,
  connectsBelow,
  hasConflict,
}: {
  isDoubleStart?: boolean;
  isDoubleContinuation?: boolean;
  connectsBelow?: boolean;
  hasConflict?: boolean;
}) {
  if (hasConflict || (!isDoubleStart && !isDoubleContinuation)) return "";

  return cn(
    "ring-1 ring-inset ring-violet-200/40 dark:ring-violet-800/30",
    connectsBelow && "rounded-b-none border-b-0",
    isDoubleContinuation && "rounded-t-none border-t-0",
  );
}

function doubleBlockTdPadding(
  connectsBelow?: boolean,
  isDoubleContinuation?: boolean,
) {
  return cn(connectsBelow && "pb-0", isDoubleContinuation && "pt-0");
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
          className={cn(
            "w-full min-w-0 border-collapse",
            schoolCombined
              ? "table-fixed md:min-w-[520px]"
              : "table-auto md:min-w-[580px]",
          )}
          aria-label={schoolCombined ? "Whole-school timetable" : "Timetable"}
        >
          <thead>
            <tr className="border-b border-zinc-200/90 dark:border-zinc-800">
              <th
                className={cn(
                  "sticky left-0 z-20 border-r border-zinc-200/90 bg-zinc-100/95 px-1.5 py-1.5 text-left dark:border-zinc-800 dark:bg-zinc-900/95",
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
                  className={cn(
                    "border-r border-zinc-200/60 bg-zinc-100/70 px-1 py-1.5 text-center last:border-r-0 dark:border-zinc-800 dark:bg-zinc-900/70",
                    schoolCombined
                      ? "min-w-[68px] md:min-w-[76px]"
                      : "min-w-[80px] md:min-w-[92px]",
                  )}
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
                  const nextPeriodNumber =
                    periodIndex < periodNumbers.length - 1
                      ? periodNumbers[periodIndex + 1]
                      : null;
                  const rowHasDoubleBlock = days.some((_, dayIndex) => {
                    if (schoolCombined) {
                      return (
                        getCombinedEntriesFor?.(dayIndex + 1, period) ?? []
                      ).some(
                        (e) => e.isDoublePeriod && !e.isDoubleContinuation,
                      );
                    }
                    const dayOfWeek = dayIndex + 1;
                    const e = getEntryFor(dayOfWeek, period);
                    if (e?.isDoublePeriod && !e.isDoubleContinuation) {
                      return true;
                    }
                    if (prevPeriodNumber == null) return false;
                    const prev = getEntryFor(dayOfWeek, prevPeriodNumber);
                    return (
                      prev?.isDoublePeriod === true &&
                      !breakBlocksDoubleSpan(
                        getBreaksAfterPeriod,
                        dayOfWeek,
                        prevPeriodNumber,
                      )
                    );
                  });
                  const rowIsDoubleContinuation =
                    prevPeriodNumber != null &&
                    days.some((_, dayIndex) => {
                      if (schoolCombined) {
                        return (
                          getCombinedEntriesFor?.(dayIndex + 1, period) ?? []
                        ).some((e) => e.isDoubleContinuation);
                      }
                      const dayOfWeek = dayIndex + 1;
                      const prev = getEntryFor(dayOfWeek, prevPeriodNumber);
                      return (
                        prev?.isDoublePeriod === true &&
                        !breakBlocksDoubleSpan(
                          getBreaksAfterPeriod,
                          dayOfWeek,
                          prevPeriodNumber,
                        )
                      );
                    });

                  return (
                    <React.Fragment key={`period-${period}`}>
                      <tr
                        className="group/row border-b border-zinc-200/70 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/30"
                      >
                        <td className="sticky left-0 z-10 border-r border-zinc-200/90 bg-white p-0 align-middle dark:border-zinc-800 dark:bg-zinc-900">
                          <TimeColumnCell
                            slot={rowSlot}
                            period={period}
                            periodNumbers={periodNumbers}
                            getBreaksAfterPeriod={getBreaksAfterPeriod}
                            getBreaksBeforeFirstPeriod={getBreaksBeforeFirstPeriod}
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
                            prevPeriodNumber != null &&
                            breakBlocksDoubleSpan(
                              getBreaksAfterPeriod,
                              dayOfWeek,
                              prevPeriodNumber,
                            );

                          let displayEntry: LessonEntry | null = entry;
                          let isDoubleContinuation = false;

                          if (
                            !schoolCombined &&
                            !entry &&
                            prevEntry?.isDoublePeriod &&
                            !breakAfterPrev
                          ) {
                            displayEntry = {
                              ...prevEntry,
                              isDoubleContinuation: true,
                            };
                            isDoubleContinuation = true;
                          }

                          const isDoubleStart =
                            !!displayEntry?.isDoublePeriod &&
                            !isDoubleContinuation &&
                            !displayEntry?.isDoubleContinuation;

                          const connectsDoubleBelow =
                            isDoubleStart &&
                            nextPeriodNumber != null &&
                            !breakBlocksDoubleSpan(
                              getBreaksAfterPeriod,
                              dayOfWeek,
                              period,
                            );

                          const hasConflict =
                            displayEntry &&
                            conflictLessonIds?.has(displayEntry.id);
                          const isTeacherDimmed = !!(
                            displayEntry &&
                            highlightTeacherId &&
                            displayEntry.teacher.id !== highlightTeacherId
                          );

                          if (schoolCombined) {
                            return (
                              <td
                                key={dayIndex}
                                className={cn("h-px bg-white align-top dark:bg-zinc-900/40", TD_PAD)}
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
                              className={cn(
                                "h-px bg-white align-top dark:bg-zinc-900/40",
                                TD_PAD,
                                doubleBlockTdPadding(
                                  connectsDoubleBelow,
                                  isDoubleContinuation,
                                ),
                              )}
                            >
                              {displayEntry ? (
                                <AdminLessonCell
                                  entry={displayEntry}
                                  accent={accentFor(
                                    displayEntry.subject.id ?? displayEntry.id,
                                    displayEntry.subject.name,
                                  )}
                                  hasConflict={!!hasConflict}
                                  isDimmed={isTeacherDimmed}
                                  isDoubleStart={isDoubleStart}
                                  isDoubleContinuation={isDoubleContinuation}
                                  connectsDoubleBelow={connectsDoubleBelow}
                                  showFullSubjectName
                                  onEdit={onEditLesson}
                                  onDelete={onDeleteLesson}
                                />
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
                                  <Plus className="h-3.5 w-3.5 opacity-50 transition-opacity group-hover/empty:opacity-100 group-focus-visible/empty:opacity-100" />
                                  <span className="text-[10px] font-medium opacity-70 transition-opacity group-hover/empty:opacity-100 group-focus-visible/empty:opacity-100">
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
  periodNumbers,
  getBreaksAfterPeriod,
  getBreaksBeforeFirstPeriod,
  isDoubleBlockRow,
  isDoubleContinuation,
  onEdit,
  onAddBreak,
}: {
  slot: TimeSlotInfo;
  period: number;
  periodNumbers: number[];
  getBreaksAfterPeriod: (p: number) => BreakEntry[];
  getBreaksBeforeFirstPeriod: () => BreakEntry[];
  isDoubleBlockRow?: boolean;
  isDoubleContinuation?: boolean;
  onEdit?: (slot: TimeSlotInfo) => void;
  onAddBreak?: (afterPeriod: number) => void;
}) {
  const timeLabel =
    slotTimeRangeWithBreaks(
      slot,
      period,
      periodNumbers,
      getBreaksAfterPeriod,
      getBreaksBeforeFirstPeriod,
    ) ?? "—";

  return (
    <div
      className={cn(
        "flex flex-col justify-center gap-0.5 px-1.5 py-1",
        TIME_COL_W,
        isDoubleBlockRow ? DOUBLE_ROW_H : TIME_RAIL_MIN,
        isDoubleBlockRow &&
          "bg-gradient-to-b from-violet-50/80 to-transparent dark:from-violet-950/20",
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
        className="relative flex min-h-[36px] items-center justify-center overflow-hidden rounded border border-dashed border-zinc-200/70 bg-[linear-gradient(135deg,rgba(248,250,252,0.9)_25%,transparent_25%,transparent_50%,rgba(248,250,252,0.9)_50%,rgba(248,250,252,0.9)_75%,transparent_75%,transparent)] bg-[length:8px_8px] dark:border-zinc-700/60 dark:bg-zinc-900/20"
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
  const multiClass = entries.length > 1;
  const [expanded, setExpanded] = useState(false);

  return (
    <TooltipProvider delayDuration={250}>
      <div
        className={cn(
          "grid min-h-[36px] overscroll-contain",
          multiClass
            ? "gap-1 max-lg:rounded-lg max-lg:bg-zinc-100/50 max-lg:p-1 max-lg:ring-1 max-lg:ring-inset max-lg:ring-zinc-200/60 dark:max-lg:bg-zinc-900/30 dark:max-lg:ring-zinc-700/50"
            : "",
          twoColumn ? "grid-cols-2" : "grid-cols-1",
          manyEntries && !expanded
            ? "overflow-y-auto max-h-56"
            : "overflow-y-visible",
          dense && multiClass ? "gap-0.5" : multiClass ? "gap-1" : "",
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
                connectsDoubleBelow={
                  !entry.isEmpty &&
                  !!entry.isDoublePeriod &&
                  !entry.isDoubleContinuation
                }
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
  connectsDoubleBelow,
  onSelect,
}: {
  entry: LessonEntry;
  accent: SubjectAccentStyle;
  hasConflict: boolean;
  isTeacherDimmed: boolean;
  compact?: boolean;
  showFullSubjectName?: boolean;
  connectsDoubleBelow?: boolean;
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
  const classAccent = getGradeStreamAccent(entry.gradeId ?? entry.id, entry.streamId);

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
        "group/chip relative flex min-w-0 items-stretch overflow-hidden rounded-md border text-left",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50",
        compact ? "min-h-[30px]" : "min-h-[34px]",
        isEmpty
          ? "border-dashed border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 dark:border-zinc-700/70 dark:bg-zinc-900/25"
          : cn(
              "shadow-[0_1px_0_rgba(15,23,42,0.04)] hover:-translate-y-px hover:shadow-sm",
              isTeacherDimmed && "opacity-35 saturate-50",
              doubleBlockSurfaceClass({
                isDoubleStart,
                isDoubleContinuation: isDoubleCont,
                connectsBelow: connectsDoubleBelow,
                hasConflict,
              }),
              hasConflict
                ? "border-red-300/80 bg-gradient-to-r from-red-50 to-red-50/40 dark:border-red-900/60 dark:from-red-950/40 dark:to-red-950/10"
                : "bg-white/95 dark:bg-zinc-900/50",
            ),
      )}
      style={
        isEmpty
          ? { borderColor: `${classAccent.stripe}55` }
          : hasConflict
            ? undefined
            : {
                borderColor: accent.border,
                backgroundColor: accent.background,
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
        <div className="flex min-w-0 items-center gap-1 leading-none">
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded px-1 py-px font-semibold uppercase tracking-wide",
              compact ? "text-[8px]" : "text-[9px]",
            )}
            style={{
              backgroundColor: classAccent.background,
              color: classAccent.text,
            }}
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
              {displayStream}
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
            No lesson
          </span>
        ) : subjectCode ? (
          <span
            className={cn(
              "min-w-0 font-semibold leading-snug tracking-wide",
              showFullSubjectName
                ? "whitespace-normal break-words text-[9px] normal-case"
                : "truncate text-[8px] uppercase",
              compact && !showFullSubjectName && "text-[7px]",
              compact && showFullSubjectName && "text-[8px]",
              hasConflict ? "text-red-600 dark:text-red-400" : "",
            )}
            style={hasConflict ? undefined : { color: accent.text }}
            title={entry.subject.name}
          >
            {showFullSubjectName ? entry.subject.name : subjectCode}
          </span>
        ) : null}
      </div>

      {isDoubleStart ? (
        <span
          className={cn(
            "absolute right-0.5 top-0.5 rounded px-1 font-semibold leading-none",
            "bg-violet-100/90 text-violet-700 ring-1 ring-violet-200/80",
            "dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-800/60",
            compact ? "py-px text-[7px]" : "py-0.5 text-[8px]",
          )}
        >
          2×
        </span>
      ) : null}

      {isDoubleCont ? (
        <span
          className={cn(
            "absolute right-0.5 top-0.5 rounded px-1 font-medium leading-none",
            "text-violet-600/80 dark:text-violet-400/80",
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
  isDoubleStart,
  isDoubleContinuation,
  connectsDoubleBelow,
  showFullSubjectName = true,
  onEdit,
}: {
  entry: LessonEntry;
  accent: SubjectAccentStyle;
  hasConflict: boolean;
  isDimmed?: boolean;
  isDoubleStart?: boolean;
  isDoubleContinuation?: boolean;
  connectsDoubleBelow?: boolean;
  showFullSubjectName?: boolean;
  onEdit?: (lesson: LessonEntry) => void;
  onDelete?: (lesson: LessonEntry) => void;
}) {
  const tooltipExtra = isDoubleContinuation
    ? "Double period · 2nd half"
    : isDoubleStart
      ? "Double period"
      : undefined;

  return (
    <div
      className={cn(
        "group/lesson relative flex cursor-pointer items-start gap-0.5 rounded-md border px-2",
        LESSON_CELL_MIN,
        (isDoubleStart || isDoubleContinuation) && "pr-6",
        isDimmed && "opacity-40 saturate-[0.65]",
        doubleBlockSurfaceClass({
          isDoubleStart,
          isDoubleContinuation,
          connectsBelow: connectsDoubleBelow,
          hasConflict,
        }),
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
      title={lessonTooltip(entry, tooltipExtra)}
      onClick={() => onEdit?.(entry)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit?.(entry);
        }
      }}
    >
      <p
        className={cn(
          T_CELL,
          "min-w-0 flex-1 py-px font-medium leading-tight",
          showFullSubjectName ? "whitespace-normal break-words" : "truncate",
        )}
        style={{ color: hasConflict ? undefined : accent.text }}
      >
        {entry.subject.name}
      </p>
      {isDoubleStart ? (
        <span className="absolute right-0.5 top-0.5 rounded bg-violet-100/90 px-1 py-0.5 text-[8px] font-semibold leading-none text-violet-700 ring-1 ring-violet-200/80 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-800/60">
          2×
        </span>
      ) : null}
      {isDoubleContinuation ? (
        <span className="absolute right-0.5 top-0.5 px-1 py-0.5 text-[8px] font-medium leading-none text-violet-600/75 dark:text-violet-400/75">
          2/2
        </span>
      ) : null}
      {hasConflict && (
        <AlertCircle className="h-3 w-3 shrink-0 text-red-500" aria-hidden />
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
  const appliesAllDays = !!primary.applyToAllDays;
  const colSpan = 1 + visibleDayIndices.length;
  // Per-day "+ Add" is only for building a partial schedule, not an existing break row
  const showPerDayAddButtons =
    !appliesAllDays &&
    !primary.id &&
    visibleDayIndices.some(
      (dayIndex) =>
        !breaks.find(
          (b) => b.applyToAllDays || b.dayOfWeek === dayIndex + 1,
        ),
    );

  return (
    <tr className={cn("group/break", visual.rowBand)}>
      <td
        colSpan={colSpan}
        className={cn(
          "relative p-0",
          BREAK_CHANNEL,
          visual.rowBand,
        )}
      >
        <button
          type="button"
          onClick={() => onEditBreak?.(primary)}
          className={cn(
            BREAK_ROW_H,
            "flex w-full items-center justify-center gap-2 px-4 py-2.5 text-center transition-colors",
            "hover:bg-black/[0.03] dark:hover:bg-white/[0.04]",
            primary.id && onMoveBreak ? "lg:pr-10" : undefined,
          )}
          title={`Edit ${visual.label}`}
          aria-label={`Edit ${visual.label}${timeLabel ? `, ${timeLabel}` : ""}`}
        >
          <Icon
            className={cn("h-4 w-4 shrink-0 opacity-80", visual.iconColor)}
            aria-hidden
          />
          <span className={cn(BREAK_LABEL, visual.text)}>{visual.label}</span>
          {timeLabel ? (
            <>
              <span className={cn("opacity-40", visual.text)} aria-hidden>
                ·
              </span>
              <span className={cn(BREAK_TIME, visual.text)}>{timeLabel}</span>
            </>
          ) : null}
        </button>

        {primary.id && onMoveBreak ? (
          <div className="pointer-events-none absolute right-2 top-1/2 z-10 flex -translate-y-1/2 flex-col opacity-0 transition-opacity group-hover/break:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              disabled={!canMoveUp}
              onClick={() => onMoveBreak(primary, -1)}
              className={cn(
                "pointer-events-auto rounded p-0.5 transition-colors hover:bg-black/[0.06] disabled:opacity-30",
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
                "pointer-events-auto rounded p-0.5 transition-colors hover:bg-black/[0.06] disabled:opacity-30",
                visual.iconColor,
              )}
              title="Move break later in the day"
              aria-label="Move break later in the day"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        {showPerDayAddButtons ? (
          <div className="flex flex-wrap items-center justify-center gap-2 px-3 pb-2 pt-0">
            {visibleDayIndices.map((dayIndex) => {
              const dayBreak = breaks.find(
                (b) => b.applyToAllDays || b.dayOfWeek === dayIndex + 1,
              );
              if (dayBreak) return null;
              return (
                <button
                  key={dayIndex}
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
                    "rounded-full px-2.5 py-1 text-[10px] font-medium text-slate-500 transition-colors",
                    "hover:bg-black/[0.04] hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
                  )}
                  title={`Add ${visual.label} on this day`}
                >
                  + Add
                </button>
              );
            })}
          </div>
        ) : null}
      </td>
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
