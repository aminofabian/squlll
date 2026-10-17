/**
 * Admin timetable grid — dashboard-style schedule board with clear hierarchy:
 * period rail · day columns · subject-accent lesson cards · muted break bands.
 */

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
const T_CELL_SM = "text-[10px] leading-tight";
const T_SUBJECT = "text-[12.5px] font-semibold leading-tight";
const T_TEACHER = "text-[11px] leading-tight";
const ROW_H = "h-full min-h-[52px]";
const LESSON_CELL_MIN = "min-h-[52px] py-1.5";
const DOUBLE_ROW_H = "min-h-[104px]";
const TIME_COL_W = "max-md:w-[108px]";
const TIME_RAIL_MIN = "min-h-[52px]";
const TD_PAD = "p-1";
const CARD_RADIUS = "rounded-lg";
const DOUBLE_ROW_SPAN = 2;
const TRIPLE_ROW_SPAN = 3;

// Resizable column widths (desktop). Widths are persisted per school.
const TIME_COL_DEFAULT_W = 120;
const DAY_COL_DEFAULT_W = 96;
const COL_W_MIN = 60;
const COL_W_MAX = 420;
const TIME_COL_W_MIN = 88;
const TIME_COL_W_MAX = 280;

/** Column key: the time rail, or a day index. */
type ColKey = "time" | number;

const clampColumnWidth = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(value)));

/**
 * Drag handle on a column's right edge (desktop only). Drag to resize,
 * double-click to reset, or focus it and use ←/→ (Shift for bigger steps).
 */
function ColumnResizeHandle({
  label,
  width,
  min,
  max,
  active,
  onPointerDown,
  onKeyDown,
  onReset,
}: {
  label: string;
  width: number;
  min: number;
  max: number;
  active: boolean;
  onPointerDown: (event: React.PointerEvent) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onReset: () => void;
}) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${label} column`}
      aria-valuenow={clampColumnWidth(width, min, max)}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      title="Drag to resize · double-click to reset"
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onReset();
      }}
      className={cn(
        "absolute right-0 top-0 z-30 hidden h-full w-2 cursor-col-resize touch-none select-none md:block",
        "before:absolute before:inset-y-0 before:right-0 before:w-px before:bg-transparent before:transition-colors",
        // Reveal the grip when the whole header cell is hovered, so the affordance
        // is discoverable without adding always-on chrome to every column edge.
        "group-hover/col:before:bg-[#246a59]/30 hover:before:bg-[#246a59]/50 focus-visible:outline-none focus-visible:before:bg-[#246a59]",
        active && "before:w-0.5 before:bg-[#246a59]",
      )}
    />
  );
}

const BREAK_ROW_H = "min-h-[36px]";
const BREAK_LABEL =
  "text-[10px] font-semibold uppercase tracking-[0.12em] leading-none";
const BREAK_TIME =
  "text-[10px] font-medium font-mono tabular-nums leading-none tracking-tight opacity-60";
const BREAK_CHANNEL =
  "max-lg:py-2 max-lg:px-0 dark:max-lg:bg-transparent";

const LINK_ACTION =
  "inline-flex items-center gap-0.5 rounded-none px-1 py-0.5 text-[10px] font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-30 dark:text-slate-500 dark:hover:bg-slate-800/60 dark:hover:text-slate-200";

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

const RANGE_SEPARATOR = "–";

function formatCompactRange(start: string, end: string): string {
  const trim = (t: string) => t.replace(/^0(\d)/, "$1").trim();
  return `${trim(start)}${RANGE_SEPARATOR}${trim(end)}`;
}

function minutesBetween(start?: string, end?: string): number | null {
  if (!start || !end) return null;
  const minutes = parseHHMM(end) - parseHHMM(start);
  return minutes > 0 ? minutes : null;
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
    connectsBelow && "rounded-none border-b-0",
    isDoubleContinuation && "rounded-none border-t-0",
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

/** A double followed by the same lesson in the next free period is a triple. */
function sameLessonRun(a: LessonEntry, b: LessonEntry): boolean {
  const aSubject = a.subject.id ?? a.subject.name;
  const bSubject = b.subject.id ?? b.subject.name;
  const aTeacher = a.teacher.id ?? a.teacher.fullName ?? a.teacher.name;
  const bTeacher = b.teacher.id ?? b.teacher.fullName ?? b.teacher.name;
  return (
    aSubject === bSubject &&
    aTeacher === bTeacher &&
    (a.gradeId ?? "") === (b.gradeId ?? "") &&
    (a.streamId ?? null) === (b.streamId ?? null)
  );
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
  /** Lesson currently open in the editor — matched by id. */
  activeLessonId?: string | null;
  /** Slot currently open in the editor — used for new (empty) cells. */
  activeSlot?: { dayOfWeek: number; timeSlotId?: string } | null;
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
  /** localStorage key (per school) under which resized column widths are saved. */
  columnWidthStorageKey?: string;
  getCombinedEntriesFor?: (dayOfWeek: number, period: number) => LessonEntry[];
  onCombinedLessonClick?: (entry: LessonEntry) => void;
  /**
   * Class-view drag/drop. Omit targetEntryId for an empty slot (move), or pass
   * the occupied lesson id to swap the two lessons.
   */
  onMoveLesson?: (
    entryId: string,
    target: {
      dayOfWeek: number;
      timeSlotId: string;
      targetEntryId?: string;
    },
  ) => void | Promise<void>;
  /** Lessons in a run of one subject on the same day ("3 in a row"). */
  runLessonIds?: Set<string>;
  /** Dim every lesson except this subject's. */
  highlightSubjectId?: string | null;
  /** A free slot SQUL recommends filling, shown as "+ Place {subject}". */
  suggestedSlot?: {
    dayOfWeek: number;
    timeSlotId: string;
    subjectName: string;
  } | null;
  onPlaceSuggested?: () => void;
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
  activeLessonId,
  activeSlot,
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
  columnWidthStorageKey,
  getCombinedEntriesFor,
  onCombinedLessonClick,
  onMoveLesson,
  runLessonIds,
  highlightSubjectId,
  suggestedSlot,
  onPlaceSuggested,
}: AdminTimetableGridProps) {
  const cleanName = getCleanBreakName || ((name: string) => name);
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const handleDragStart = (entryId: string) => (event: React.DragEvent) => {
    setDraggedLessonId(entryId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/timetable-lesson", entryId);
    event.dataTransfer.setData("text/plain", entryId);
  };
  const clearDrag = () => {
    setDraggedLessonId(null);
    setDropTarget(null);
  };
  const handleCellDrop = (
    event: React.DragEvent,
    dayOfWeek: number,
    timeSlotId: string,
    targetEntryId?: string,
  ) => {
    event.preventDefault();
    const entryId =
      event.dataTransfer.getData("text/timetable-lesson") ||
      event.dataTransfer.getData("text/plain") ||
      draggedLessonId;
    clearDrag();
    if (!entryId || !timeSlotId || !onMoveLesson) return;
    if (targetEntryId && targetEntryId === entryId) return;
    void onMoveLesson(entryId, { dayOfWeek, timeSlotId, targetEntryId });
  };
  const [mobileDayIndex, setMobileDayIndex] = useState(0);
  const isMobile = useIsMobile();
  const accentFor = resolveAccent ?? getSubjectAccent;

  // Resolved after mount so server and client markup match.
  const [todayIndex, setTodayIndex] = useState<number | null>(null);

  const visibleDayIndices = useMemo(
    () => (isMobile ? [mobileDayIndex] : days.map((_, index) => index)),
    [isMobile, mobileDayIndex, days],
  );

  // ── Resizable columns (desktop) ─────────────────────────────
  const [timeColWidth, setTimeColWidth] = useState(TIME_COL_DEFAULT_W);
  const [dayColWidths, setDayColWidths] = useState<Record<number, number>>({});
  const [resizingCol, setResizingCol] = useState<ColKey | null>(null);
  const resizeDragRef = useRef<{
    key: ColKey;
    startX: number;
    startWidth: number;
  } | null>(null);
  const widthsHydratedRef = useRef(false);

  // Restore this school's saved widths.
  useEffect(() => {
    if (!columnWidthStorageKey || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(columnWidthStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { time?: unknown; days?: unknown };
      if (typeof parsed.time === "number") {
        setTimeColWidth(
          clampColumnWidth(parsed.time, TIME_COL_W_MIN, TIME_COL_W_MAX),
        );
      }
      if (parsed.days && typeof parsed.days === "object") {
        const next: Record<number, number> = {};
        for (const [rawIndex, value] of Object.entries(
          parsed.days as Record<string, unknown>,
        )) {
          const index = Number(rawIndex);
          if (Number.isInteger(index) && typeof value === "number") {
            next[index] = clampColumnWidth(value, COL_W_MIN, COL_W_MAX);
          }
        }
        setDayColWidths(next);
      }
    } catch {
      // Ignore malformed / unavailable storage.
    }
  }, [columnWidthStorageKey]);

  // Persist on change, but skip the initial mount write.
  useEffect(() => {
    if (!widthsHydratedRef.current) {
      widthsHydratedRef.current = true;
      return;
    }
    if (!columnWidthStorageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        columnWidthStorageKey,
        JSON.stringify({ time: timeColWidth, days: dayColWidths }),
      );
    } catch {
      // Ignore quota / private-mode failures.
    }
  }, [timeColWidth, dayColWidths, columnWidthStorageKey]);

  const getColumnWidth = (key: ColKey) =>
    key === "time" ? timeColWidth : (dayColWidths[key] ?? DAY_COL_DEFAULT_W);

  const setColumnWidthValue = (key: ColKey, next: number) => {
    if (key === "time") setTimeColWidth(next);
    else setDayColWidths((prev) => ({ ...prev, [key]: next }));
  };

  const resetColumn = (key: ColKey) => {
    if (key === "time") {
      setTimeColWidth(TIME_COL_DEFAULT_W);
      return;
    }
    setDayColWidths((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const beginColumnResize = (event: React.PointerEvent, key: ColKey) => {
    if (isMobile) return;
    event.preventDefault();
    event.stopPropagation();
    resizeDragRef.current = {
      key,
      startX: event.clientX,
      startWidth: getColumnWidth(key),
    };
    setResizingCol(key);
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is best-effort.
    }
  };

  const nudgeColumn = (event: React.KeyboardEvent, key: ColKey) => {
    if (isMobile) return;
    const isTime = key === "time";
    const min = isTime ? TIME_COL_W_MIN : COL_W_MIN;
    const max = isTime ? TIME_COL_W_MAX : COL_W_MAX;
    const current = getColumnWidth(key);
    const step = event.shiftKey ? 24 : 8;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setColumnWidthValue(key, clampColumnWidth(current - step, min, max));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setColumnWidthValue(key, clampColumnWidth(current + step, min, max));
    } else if (event.key === "Home" || event.key === "Enter") {
      event.preventDefault();
      resetColumn(key);
    }
  };

  useEffect(() => {
    if (!resizingCol) return;
    const isTime = resizingCol === "time";
    const min = isTime ? TIME_COL_W_MIN : COL_W_MIN;
    const max = isTime ? TIME_COL_W_MAX : COL_W_MAX;

    const onMove = (event: PointerEvent) => {
      const drag = resizeDragRef.current;
      if (!drag) return;
      const next = clampColumnWidth(
        drag.startWidth + (event.clientX - drag.startX),
        min,
        max,
      );
      const key = drag.key;
      if (key === "time") setTimeColWidth(next);
      else setDayColWidths((prev) => ({ ...prev, [key]: next }));
    };
    const onEnd = () => {
      resizeDragRef.current = null;
      setResizingCol(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      document.body.style.userSelect = previousUserSelect;
    };
  }, [resizingCol]);

  const tableStyle = isMobile
    ? undefined
    : {
        width:
          timeColWidth +
          visibleDayIndices.reduce(
            (sum, dayIndex) =>
              sum + (dayColWidths[dayIndex] ?? DAY_COL_DEFAULT_W),
            0,
          ),
        minWidth: "100%",
      };

  useEffect(() => {
    setTodayIndex((new Date().getDay() + 6) % 7);
  }, []);

  useEffect(() => {
    setMobileDayIndex(
      todayIndex != null && todayIndex < days.length ? todayIndex : 0,
    );
  }, [days.length, todayIndex]);

  useEffect(() => {
    if (activeLessonId || !activeSlot?.timeSlotId) return;
    const el = document.querySelector("[data-editing-slot]");
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [activeLessonId, activeSlot?.dayOfWeek, activeSlot?.timeSlotId]);

  return (
    <div
      className={cn(
        "overflow-hidden border border-zinc-200/90 dark:border-zinc-800",
        schoolCombined
          ? "rounded-2xl bg-white/70 dark:bg-zinc-950/40"
          : "rounded-2xl bg-white p-2.5 shadow-[0_1px_2px_rgba(10,31,26,0.04),0_18px_40px_-30px_rgba(10,31,26,0.22)] dark:bg-zinc-900/60",
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
                "relative flex-1 min-w-0 rounded-none px-1.5 py-1 font-semibold tracking-tight transition-colors",
                index === mobileDayIndex
                  ? "bg-[#246a59] text-white"
                  : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
              )}
            >
              {day.slice(0, 3)}
              {todayIndex === index && index !== mobileDayIndex ? (
                <span
                  className="absolute left-1/2 bottom-0.5 h-1 w-1 -translate-x-1/2 rounded-none bg-[#246a59]"
                  aria-hidden
                />
              ) : null}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full min-w-0 border-collapse table-auto md:table-fixed",
            schoolCombined ? "md:min-w-[520px]" : "md:min-w-[580px]",
          )}
          style={tableStyle}
          aria-label={schoolCombined ? "Whole-school timetable" : "Timetable"}
        >
          {!isMobile ? (
            <colgroup>
              <col style={{ width: timeColWidth }} />
              {visibleDayIndices.map((dayIndex) => (
                <col
                  key={dayIndex}
                  style={{ width: dayColWidths[dayIndex] ?? DAY_COL_DEFAULT_W }}
                />
              ))}
            </colgroup>
          ) : null}
          <thead>
            <tr className="border-b border-zinc-200/90 dark:border-zinc-800">
              <th
                className={cn(
                  "group/col sticky left-0 z-20 bg-white px-1.5 py-2.5 text-left dark:bg-zinc-900/95",
                  TIME_COL_W,
                )}
                scope="col"
              >
                <span className="sr-only">Time</span>
                <ColumnResizeHandle
                  label="time"
                  width={timeColWidth}
                  min={TIME_COL_W_MIN}
                  max={TIME_COL_W_MAX}
                  active={resizingCol === "time"}
                  onPointerDown={(event) => beginColumnResize(event, "time")}
                  onKeyDown={(event) => nudgeColumn(event, "time")}
                  onReset={() => resetColumn("time")}
                />
              </th>
              {visibleDayIndices.map((index) => {
                const isToday = todayIndex === index;
                return (
                  <th
                    key={days[index]}
                    scope="col"
                    aria-current={isToday ? "date" : undefined}
                    className={cn(
                      "group/col relative border-b-2 px-1 py-2.5 text-center dark:border-zinc-600",
                      isToday
                        ? "border-[#246a59] bg-[#246a59]/[0.06] dark:bg-[#246a59]/15"
                        : "border-[#0a1f1a]/70 bg-white dark:bg-zinc-900/70",
                      schoolCombined
                        ? "max-md:min-w-[68px]"
                        : "max-md:min-w-[80px]",
                    )}
                  >
                    <span
                      className={cn(
                        "block text-[13px] font-semibold",
                        isToday
                          ? "text-[#246a59] dark:text-[#7eb8a8]"
                          : "text-zinc-800 dark:text-zinc-100",
                      )}
                    >
                      {days[index].slice(0, 3)}
                    </span>
                    {isToday ? (
                      <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.1em] text-[#246a59]/70 dark:text-[#7eb8a8]/70">
                        Today
                      </span>
                    ) : null}
                    <ColumnResizeHandle
                      label={days[index]}
                      width={dayColWidths[index] ?? DAY_COL_DEFAULT_W}
                      min={COL_W_MIN}
                      max={COL_W_MAX}
                      active={resizingCol === index}
                      onPointerDown={(event) =>
                        beginColumnResize(event, index)
                      }
                      onKeyDown={(event) => nudgeColumn(event, index)}
                      onReset={() => resetColumn(index)}
                    />
                  </th>
                );
              })}
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
                        "animate-pulse rounded-none bg-zinc-100 dark:bg-zinc-800",
                      )}
                    />
                  </td>
                  {visibleDayIndices.map((di) => (
                    <td key={di} className="p-1">
                      <div
                        className={cn(
                          ROW_H,
                          "animate-pulse rounded-none bg-zinc-100/80 dark:bg-zinc-800/60",
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-none bg-zinc-100 dark:bg-zinc-800">
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
                        className={cn(
                          "group/row bg-white dark:bg-zinc-900/30",
                          schoolCombined && "border-b border-zinc-200/70 dark:border-zinc-800/80",
                        )}
                      >
                        <td className="sticky left-0 z-10 bg-white p-0 align-top dark:bg-zinc-900">
                          <TimeColumnCell
                            slot={rowSlot}
                            period={period}
                            periodNumbers={periodNumbers}
                            getBreaksAfterPeriod={getBreaksAfterPeriod}
                            getBreaksBeforeFirstPeriod={getBreaksBeforeFirstPeriod}
                            isDoubleBlockRow={schoolCombined && rowHasDoubleBlock}
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

                          const coveredByDoubleAbove =
                            !schoolCombined &&
                            !entry &&
                            !!prevEntry?.isDoublePeriod;

                          if (coveredByDoubleAbove && !breakAfterPrev) {
                            return null;
                          }

                          const prevPrevEntry =
                            periodIndex >= 2
                              ? getEntryFor(
                                  dayOfWeek,
                                  periodNumbers[periodIndex - 2],
                                )
                              : null;
                          const coveredByTripleAbove =
                            !schoolCombined &&
                            !!entry &&
                            !!prevPrevEntry?.isDoublePeriod &&
                            !prevEntry &&
                            sameLessonRun(entry, prevPrevEntry) &&
                            !breakBlocksDoubleSpan(
                              getBreaksAfterPeriod,
                              dayOfWeek,
                              periodNumbers[periodIndex - 2],
                            ) &&
                            !breakBlocksDoubleSpan(
                              getBreaksAfterPeriod,
                              dayOfWeek,
                              periodNumbers[periodIndex - 1],
                            );
                          if (coveredByTripleAbove) {
                            return null;
                          }

                          let displayEntry: LessonEntry | null = entry;
                          let isDoubleContinuation = false;

                          if (coveredByDoubleAbove && prevEntry) {
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

                          const nextEntry =
                            nextPeriodNumber != null
                              ? getEntryFor(dayOfWeek, nextPeriodNumber)
                              : null;
                          const spansBothPeriods =
                            !schoolCombined &&
                            isDoubleStart &&
                            nextPeriodNumber != null &&
                            !nextEntry &&
                            !breakBlocksDoubleSpan(
                              getBreaksAfterPeriod,
                              dayOfWeek,
                              period,
                            );

                          const thirdPeriodNumber =
                            periodIndex + 2 < periodNumbers.length
                              ? periodNumbers[periodIndex + 2]
                              : null;
                          const thirdEntry =
                            thirdPeriodNumber != null
                              ? getEntryFor(dayOfWeek, thirdPeriodNumber)
                              : null;
                          const isTripleStart =
                            !!isDoubleStart &&
                            spansBothPeriods &&
                            !schoolCombined &&
                            !!thirdPeriodNumber &&
                            !!thirdEntry &&
                            !!displayEntry &&
                            sameLessonRun(displayEntry, thirdEntry) &&
                            !breakBlocksDoubleSpan(
                              getBreaksAfterPeriod,
                              dayOfWeek,
                              period + 1,
                            );
                          const spanRows = isTripleStart
                            ? TRIPLE_ROW_SPAN
                            : spansBothPeriods
                              ? DOUBLE_ROW_SPAN
                              : 1;
                          const doubleBlocked =
                            !!isDoubleStart &&
                            !isTripleStart &&
                            (nextPeriodNumber == null ||
                              (!!nextEntry &&
                                !!displayEntry &&
                                !sameLessonRun(displayEntry, nextEntry)));
                          const hasConflict =
                            !!doubleBlocked ||
                            !!(
                              displayEntry &&
                              conflictLessonIds?.has(displayEntry.id)
                            );
                          const isTeacherDimmed = !!(
                            displayEntry &&
                            ((highlightTeacherId &&
                              displayEntry.teacher.id !== highlightTeacherId) ||
                              (highlightSubjectId &&
                                displayEntry.subject.id !== highlightSubjectId))
                          );
                          const spanEndPeriod =
                            period + Math.max(spanRows - 1, 0);
                          const lessonMinutes =
                            spanRows > 1
                              ? minutesBetween(
                                  daySlot?.startTime,
                                  getSlotFor(dayIndex, spanEndPeriod)?.endTime,
                                )
                              : null;

                          const isActiveLesson = !!(
                            displayEntry &&
                            (activeLessonId
                              ? displayEntry.id === activeLessonId
                              : activeSlot &&
                                activeSlot.dayOfWeek === dayOfWeek &&
                                !!activeSlot.timeSlotId &&
                                displayEntry.timeSlotId === activeSlot.timeSlotId)
                          );
                          const isActiveEmpty = !!(
                            !displayEntry &&
                            !activeLessonId &&
                            activeSlot &&
                            activeSlot.dayOfWeek === dayOfWeek &&
                            !!activeSlot.timeSlotId &&
                            daySlot?.id === activeSlot.timeSlotId
                          );
                          const isEditingSomething = !!(
                            activeLessonId || activeSlot
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
                              rowSpan={spanRows > 1 ? spanRows : undefined}
                              onDragOver={(event) => {
                                if (!draggedLessonId || !daySlot?.id || !onMoveLesson) {
                                  return;
                                }
                                event.preventDefault();
                                event.dataTransfer.dropEffect = "move";
                                setDropTarget(`${dayOfWeek}:${period}`);
                              }}
                              onDragLeave={() => setDropTarget(null)}
                              onDrop={(event) =>
                                handleCellDrop(
                                  event,
                                  dayOfWeek,
                                  daySlot?.id ?? "",
                                  displayEntry?.id,
                                )
                              }
                              className={cn(
                                "h-px bg-white align-top transition-colors dark:bg-zinc-900/40",
                                TD_PAD,
                                doubleBlockTdPadding(false, isDoubleContinuation),
                                dropTarget === `${dayOfWeek}:${period}` &&
                                  "bg-[#246a59]/10 ring-2 ring-inset ring-[#246a59]/60",
                              )}
                            >
                              {displayEntry ? (
                                <AdminLessonCell
                                  spansBothPeriods={spansBothPeriods}
                                  isTripleStart={isTripleStart}
                                  entry={displayEntry}
                                  accent={accentFor(
                                    displayEntry.subject.id ?? displayEntry.id,
                                    displayEntry.subject.name,
                                  )}
                                  hasConflict={!!hasConflict}
                                  doubleBlocked={doubleBlocked}
                                  isDimmed={isTeacherDimmed}
                                  isActive={isActiveLesson}
                                  isFaded={
                                    isEditingSomething && !isActiveLesson
                                  }
                                  isDoubleStart={isDoubleStart}
                                  isDoubleContinuation={isDoubleContinuation}
                                  showFullSubjectName
                                  onEdit={onEditLesson}
                                  onDelete={onDeleteLesson}
                                  draggable={
                                    !!onMoveLesson &&
                                    !displayEntry.isDoublePeriod &&
                                    !isDoubleContinuation
                                  }
                                  isDragging={draggedLessonId === displayEntry.id}
                                  onDragStart={handleDragStart(displayEntry.id)}
                                  onDragEnd={clearDrag}
                                  dropHint={!!onMoveLesson}
                                  lessonMinutes={lessonMinutes}
                                  inARow={!!runLessonIds?.has(displayEntry.id)}
                                />
                              ) : (
                                <FreeSlotCell
                                  disabled={!daySlot?.id}
                                  isActive={isActiveEmpty}
                                  isFaded={isEditingSomething && !isActiveEmpty}
                                  suggestedSubject={
                                    suggestedSlot &&
                                    suggestedSlot.dayOfWeek === dayOfWeek &&
                                    suggestedSlot.timeSlotId === daySlot?.id
                                      ? suggestedSlot.subjectName
                                      : null
                                  }
                                  onPlaceSuggested={onPlaceSuggested}
                                  onAdd={() => {
                                    if (!daySlot?.id) return;
                                    onAddLesson?.(dayOfWeek, daySlot.id, daySlot.id);
                                  }}
                                />
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
  const [startLabel, endLabel] = timeLabel.split(RANGE_SEPARATOR);

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
        className="w-full rounded-none px-1 py-0.5 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
        title={`Edit times · ${timeLabel}`}
      >
        <p className="whitespace-nowrap text-[12.5px] font-semibold tabular-nums leading-tight text-slate-900 dark:text-slate-100">
          {startLabel}
        </p>
        {endLabel ? (
          <p className="whitespace-nowrap text-[11px] tabular-nums leading-tight text-slate-500 dark:text-slate-400">
            {endLabel}
          </p>
        ) : null}
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
  // Declared before the empty-cell early return so hook order stays stable when
  // a slot goes from 0 → 1 entries (adding the first lesson in combined view).
  const [expanded, setExpanded] = useState(false);

  if (entries.length === 0) {
    return (
      <div
        className="relative flex min-h-[36px] items-center justify-center overflow-hidden rounded-none border border-dashed border-zinc-200/70 bg-[linear-gradient(135deg,rgba(248,250,252,0.9)_25%,transparent_25%,transparent_50%,rgba(248,250,252,0.9)_50%,rgba(248,250,252,0.9)_75%,transparent_75%,transparent)] bg-[length:8px_8px] dark:border-zinc-700/60 dark:bg-zinc-900/20"
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

  return (
    <TooltipProvider delayDuration={250}>
      <div
        className={cn(
          "grid min-h-[36px] overscroll-contain",
          multiClass
            ? "gap-1 max-lg:rounded-none max-lg:bg-zinc-100/50 max-lg:p-1 max-lg:ring-1 max-lg:ring-inset max-lg:ring-zinc-200/60 dark:max-lg:bg-zinc-900/30 dark:max-lg:ring-zinc-700/50"
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
            className="col-span-2 flex items-center justify-center gap-1 rounded-none border border-dashed border-slate-200/70 bg-slate-50/60 py-1 text-[10px] font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100/80 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 dark:border-zinc-700/50 dark:bg-zinc-900/30 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/40"
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
        "group/chip relative flex min-w-0 items-stretch overflow-hidden rounded-none border text-left",
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
              "inline-flex shrink-0 items-center rounded-none px-1 py-px font-semibold uppercase tracking-wide",
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
            "absolute right-0.5 top-0.5 rounded-none px-1 font-semibold leading-none",
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
            "absolute right-0.5 top-0.5 rounded-none px-1 font-medium leading-none",
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
  doubleBlocked,
  isDimmed,
  isActive,
  isFaded,
  isDoubleStart,
  isDoubleContinuation,
  isTripleStart,
  connectsDoubleBelow,
  spansBothPeriods,
  showFullSubjectName = true,
  onEdit,
  draggable,
  isDragging,
  onDragStart,
  onDragEnd,
  dropHint,
  lessonMinutes,
  inARow,
}: {
  lessonMinutes?: number | null;
  inARow?: boolean;
  entry: LessonEntry;
  accent: SubjectAccentStyle;
  hasConflict: boolean;
  doubleBlocked?: boolean;
  isDimmed?: boolean;
  isActive?: boolean;
  isFaded?: boolean;
  isDoubleStart?: boolean;
  isDoubleContinuation?: boolean;
  isTripleStart?: boolean;
  connectsDoubleBelow?: boolean;
  /** One block stretched across both periods of a double. */
  spansBothPeriods?: boolean;
  showFullSubjectName?: boolean;
  onEdit?: (lesson: LessonEntry) => void;
  onDelete?: (lesson: LessonEntry) => void;
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (event: React.DragEvent) => void;
  onDragEnd?: () => void;
  dropHint?: boolean;
}) {
  const cellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;
    cellRef.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [isActive]);

  const tooltipExtra = isTripleStart
    ? "Triple period · three lessons back to back"
    : isDoubleContinuation
      ? "Double period · 2nd half"
      : spansBothPeriods
        ? "Double period · two lessons back to back"
        : isDoubleStart
          ? "Double period"
          : undefined;

  return (
    <div
      ref={cellRef}
      className={cn(
        "group/lesson relative flex h-full flex-col justify-between gap-1 border border-l-[3px] px-2.5 shadow-[0_1px_0_rgba(15,23,42,0.03)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_8px_20px_-14px_rgba(10,31,26,0.35)]",
        CARD_RADIUS,
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isDragging && "opacity-40 ring-2 ring-[#246a59]/40",
        LESSON_CELL_MIN,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/25",
        isFaded && !isActive
          ? "opacity-45"
          : isDimmed && !isActive && "opacity-40 saturate-[0.65]",
        doubleBlockSurfaceClass({
          isDoubleStart,
          isDoubleContinuation,
          connectsBelow: connectsDoubleBelow,
          hasConflict,
        }),
        hasConflict
          ? "border-red-200/90 bg-red-50/90 dark:border-red-900/50 dark:bg-red-950/25"
          : "border-zinc-200/60 dark:border-zinc-700/70",
        isActive &&
          "z-[1] ring-2 ring-[#0a1f1a] ring-offset-1 ring-offset-white dark:ring-[#7eb8a8] dark:ring-offset-[#071411]",
      )}
      style={
        hasConflict
          ? undefined
          : {
              backgroundColor: accent.background,
              borderColor: isActive ? "#0a1f1a" : accent.border,
              borderLeftColor: accent.accent,
            }
      }
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      data-timetable-lesson={entry.id}
      aria-current={isActive ? "true" : undefined}
      title={
        isActive
          ? `Editing · ${lessonTooltip(entry, tooltipExtra)}`
          : `${doubleBlocked ? "Double lesson needs the next period free · " : ""}${dropHint ? "Drag to move · drop on another lesson to swap · " : ""}${lessonTooltip(entry, tooltipExtra)}`
      }
      onClick={() => onEdit?.(entry)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit?.(entry);
        }
      }}
    >
      <div className={cn("min-w-0", (inARow || hasConflict) && "pr-14")}>
        <p
          className={cn(
            T_SUBJECT,
            "min-w-0",
            showFullSubjectName ? "whitespace-normal break-words" : "truncate",
          )}
          style={{ color: hasConflict ? undefined : accent.text }}
        >
          {entry.subject.name}
        </p>
        {entry.teacher.fullName?.trim() || entry.teacher.name?.trim() ? (
          <p className={cn(T_TEACHER, "mt-0.5 truncate text-zinc-600 dark:text-zinc-300")}>
            {entry.teacher.fullName?.trim() || entry.teacher.name?.trim()}
          </p>
        ) : null}
      </div>
      <LessonCardBadges
        accent={accent}
        hasConflict={hasConflict}
        inARow={inARow}
        doubleLabel={doublePillLabel({
          isDoubleStart,
          isDoubleContinuation,
          isTripleStart,
          spansBothPeriods,
          lessonMinutes,
        })}
      />
    </div>
  );
}

function doublePillLabel({
  isDoubleStart,
  isDoubleContinuation,
  isTripleStart,
  spansBothPeriods,
  lessonMinutes,
}: {
  isDoubleStart?: boolean;
  isDoubleContinuation?: boolean;
  isTripleStart?: boolean;
  spansBothPeriods?: boolean;
  lessonMinutes?: number | null;
}): string | null {
  if (isTripleStart) {
    return lessonMinutes ? `Triple · ${lessonMinutes} min` : "Triple";
  }
  if (isDoubleContinuation) return "Double · 2nd half";
  if (!isDoubleStart) return null;
  if (!spansBothPeriods) return "Double · 1st half";
  return lessonMinutes ? `Double · ${lessonMinutes} min` : "Double";
}

function LessonCardBadges({
  accent,
  hasConflict,
  inARow,
  doubleLabel,
}: {
  accent: SubjectAccentStyle;
  hasConflict: boolean;
  inARow?: boolean;
  doubleLabel: string | null;
}) {
  return (
    <>
      {hasConflict ? (
        <span className="absolute right-1 top-1 inline-flex items-center gap-1 rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
          <AlertCircle className="h-2.5 w-2.5" aria-hidden />
          Clash
        </span>
      ) : inARow ? (
        <span className="absolute right-1 top-1 rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-900 ring-1 ring-amber-300/70 dark:bg-amber-950/60 dark:text-amber-200">
          In a row
        </span>
      ) : null}
      {doubleLabel ? (
        <span
          className="shrink-0 self-start whitespace-nowrap rounded-full border bg-white/80 px-2 py-1 text-[9px] font-semibold uppercase leading-none tracking-[0.04em] dark:bg-black/20"
          style={{ borderColor: accent.border, color: accent.text }}
        >
          {doubleLabel}
        </span>
      ) : null}
    </>
  );
}

function FreeSlotCell({
  disabled,
  isActive,
  isFaded,
  suggestedSubject,
  onPlaceSuggested,
  onAdd,
}: {
  disabled: boolean;
  isActive: boolean;
  isFaded: boolean;
  suggestedSubject: string | null;
  onPlaceSuggested?: () => void;
  onAdd: () => void;
}) {
  const hasSuggestion = !!suggestedSubject && !!onPlaceSuggested;
  return (
    <div
      className={cn(
        ROW_H,
        CARD_RADIUS,
        "group/empty flex w-full items-center justify-center border border-transparent px-1.5 transition-colors",
        hasSuggestion
          ? "border-[#246a59]/35 bg-[#246a59]/[0.045]"
          : "hover:border-[#246a59]/20 hover:bg-[#246a59]/[0.035]",
        isActive && "border-solid border-[#246a59] bg-[#246a59]/10 ring-2 ring-[#0a1f1a]",
        isFaded && "opacity-40",
      )}
      data-editing-slot={isActive ? "" : undefined}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={hasSuggestion ? onPlaceSuggested : onAdd}
        aria-current={isActive ? "true" : undefined}
        aria-label={
          hasSuggestion ? `Place ${suggestedSubject} here` : "Add a lesson here"
        }
        className={cn(
          "inline-flex items-center justify-center gap-1 rounded-full border text-[11px] font-semibold transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/30 disabled:cursor-not-allowed disabled:opacity-50",
          hasSuggestion
            ? "border-[#246a59]/40 bg-white px-2.5 py-1 text-[#1a4d42] shadow-sm hover:bg-[#246a59] hover:text-white dark:bg-[#0c1a17] dark:text-[#9dcec1]"
            : "h-7 w-7 border-transparent text-[#1a4d42]/25 hover:border-[#246a59]/25 hover:bg-white hover:text-[#246a59] hover:shadow-sm focus-visible:border-[#246a59]/30 focus-visible:bg-white focus-visible:text-[#246a59] dark:text-white/20 dark:hover:bg-white/5 dark:hover:text-[#9dcec1]",
        )}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        {hasSuggestion ? <span>Place {suggestedSubject}</span> : null}
      </button>
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
                "pointer-events-auto rounded-none p-0.5 transition-colors hover:bg-black/[0.06] disabled:opacity-30",
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
                "pointer-events-auto rounded-none p-0.5 transition-colors hover:bg-black/[0.06] disabled:opacity-30",
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
                    "rounded-none px-2.5 py-1 text-[10px] font-medium text-slate-500 transition-colors",
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
