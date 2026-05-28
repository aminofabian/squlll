/**
 * AdminTimetableGrid
 *
 * Admin-specific timetable grid with interleaved break rows,
 * edit/delete controls on time slots, and add-buttons on empty slots.
 * Extends the shared TimetableGrid patterns for the admin workflow.
 */

"use client";

import React from "react";
import {
  Clock,
  Edit2,
  Trash2,
  Plus,
  MapPin,
  Users,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  /** Period numbers to iterate */
  periodNumbers: number[];
  /** Days to display (e.g. ["Monday", "Tuesday", ...]) */
  days: string[];
  /** Get the time slot for a given day+period */
  getSlotFor: (dayIndex: number, period: number) => TimeSlotInfo | null;
  /** Get the lesson entry for a given day+period */
  getEntryFor: (dayOfWeek: number, period: number) => LessonEntry | null;
  /** Get breaks after a period (for interleaving) */
  getBreaksAfterPeriod: (period: number) => BreakEntry[];
  /** Get breaks before Period 1 */
  getBreaksBeforeFirstPeriod: () => BreakEntry[];
  /** Loading state */
  isLoading?: boolean;
  /** Empty state: no time slots */
  hasNoTimeSlots?: boolean;
  /** Get clean break name (strip period info) */
  getCleanBreakName?: (name: string) => string;
  /** Conflict lesson IDs set */
  conflictLessonIds?: Set<string>;
  /** Show conflict warnings count */
  // Callbacks
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
  onEditTimeslot,
  onDeleteTimeslot,
  onEditLesson,
  onDeleteLesson,
  onAddLesson,
  onEditBreak,
  onAddBreak,
  onCreateSchedule,
  className,
}: AdminTimetableGridProps) {
  const cleanName = getCleanBreakName || ((name: string) => name);

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-50/95 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700 backdrop-blur-sm">
              <th className="border-r border-slate-200 dark:border-slate-700 px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider w-[170px] bg-slate-50/95 dark:bg-slate-800/95">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  <span>Time</span>
                </div>
              </th>
              {days.map((day, index) => (
                <th
                  key={index}
                  className="border-r border-slate-200 dark:border-slate-700 last:border-r-0 px-3 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider bg-slate-50/95 dark:bg-slate-800/95"
                >
                  <div className="flex flex-col">
                    <span>{day.slice(0, 3)}</span>
                    <span className="text-[10px] normal-case tracking-normal font-medium text-slate-400">
                      {day}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              /* Skeleton grid — renders immediately so layout never jumps */
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={`skel-${i}`}>
                  <td className="border-r border-b border-slate-200 dark:border-slate-700 p-1.5 w-[170px]">
                    <div className="h-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
                  </td>
                  {days.map((_, di) => (
                    <td
                      key={di}
                      className="border-r border-b border-slate-200 dark:border-slate-700 last:border-r-0 p-1.5"
                    >
                      <div className="h-8 bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : hasNoTimeSlots ? (
              /* Inline empty state — stay in context, no wizard page */
              <tr>
                <td
                  colSpan={days.length + 1}
                  className="border-b border-slate-200 dark:border-slate-700 p-8 text-center"
                >
                  <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
                    <Clock className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No periods yet
                    </p>
                    <p className="text-xs text-slate-500">
                      Set up your schedule to start building the timetable.
                    </p>
                    <Button
                      size="sm"
                      onClick={onCreateSchedule}
                      className="gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create schedule
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {/* Breaks before Period 1 */}
                <BreakBeforeFirstRow
                  breaks={getBreaksBeforeFirstPeriod()}
                  days={days}
                  cleanName={cleanName}
                  onEditBreak={onEditBreak}
                />

                {/* Period rows with interleaved breaks */}
                {periodNumbers.map((period, periodIndex) => {
                  const baseSlot = getSlotFor(0, period);
                  if (!baseSlot) return null;

                  const breaksAfter = getBreaksAfterPeriod(period);
                  const isEven = periodIndex % 2 === 0;

                  return (
                    <React.Fragment key={`period-${period}`}>
                      {/* Lesson row */}
                      <tr
                        className={cn(
                          "group transition-colors",
                          isEven
                            ? "bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-850"
                            : "bg-slate-50/40 dark:bg-slate-900/80 hover:bg-slate-100/70 dark:hover:bg-slate-850",
                        )}
                      >
                        {/* Time column with edit/delete */}
                        <td className="border-r border-b border-slate-200 dark:border-slate-700 p-0 w-[170px]">
                          <TimeColumnCell
                            slot={baseSlot}
                            period={period}
                            onEdit={onEditTimeslot}
                            onDelete={onDeleteTimeslot}
                            onAddBreak={onAddBreak}
                          />
                        </td>

                        {/* Day columns */}
                        {days.map((_, dayIndex) => {
                          const dayOfWeek = dayIndex + 1;
                          const daySlot = getSlotFor(dayIndex, period);
                          const entry = getEntryFor(dayOfWeek, period);
                          const prevEntry =
                            period > 1
                              ? getEntryFor(dayOfWeek, period - 1)
                              : null;
                          const isContinuation =
                            prevEntry?.isDoublePeriod === true;
                          const hasConflict =
                            entry && conflictLessonIds?.has(entry.id);

                          return (
                            <td
                              key={dayIndex}
                              className="border-r border-b border-slate-200 dark:border-slate-700 last:border-r-0 p-2 align-top"
                            >
                              {entry ? (
                                <AdminLessonCell
                                  entry={entry}
                                  hasConflict={!!hasConflict}
                                  onEdit={onEditLesson}
                                  onDelete={onDeleteLesson}
                                />
                              ) : isContinuation ? (
                                <div className="w-full h-full min-h-[58px] flex items-center justify-center text-[10px] text-slate-300 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/30">
                                  <span className="font-medium">
                                    ↳ continued
                                  </span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    onAddLesson?.(
                                      dayOfWeek,
                                      baseSlot.id,
                                      daySlot?.id,
                                    );
                                  }}
                                  className="w-full h-full min-h-[58px] flex items-center justify-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary-foreground border border-dashed border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group/empty"
                                  title="Click to schedule a lesson"
                                >
                                  <Plus className="h-3 w-3 opacity-50 group-hover/empty:opacity-100 transition-opacity" />
                                  <span className="font-medium">Add</span>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Break rows after this period */}
                      {breaksAfter.length > 0 && (
                        <BreakRow
                          breaks={breaksAfter}
                          days={days}
                          cleanName={cleanName}
                          onEditBreak={onEditBreak}
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

/** Time column cell with period info and inline controls */
function TimeColumnCell({
  slot,
  period,
  onEdit,
  onDelete,
  onAddBreak,
}: {
  slot: TimeSlotInfo;
  period: number;
  onEdit?: (slot: TimeSlotInfo) => void;
  onDelete?: (slot: TimeSlotInfo) => void;
  onAddBreak?: (afterPeriod: number) => void;
}) {
  return (
    <div className="relative bg-white dark:bg-slate-900 p-2.5 w-[170px] group/time border-r border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 pr-6">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 flex-shrink-0">
          <Clock className="h-3 w-3 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[11px] text-slate-900 dark:text-slate-100 tracking-tight leading-tight truncate">
            {slot.displayTime || slot.time || `P${period}`}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Period {period}
          </div>
        </div>
      </div>

      {/* Hover controls */}
      <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover/time:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddBreak?.(Math.max(0, period - 1));
          }}
          className="flex items-center justify-center w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-orange-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all"
          title="Add break before this period"
        >
          <span className="text-[9px] leading-none">☕</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(slot);
          }}
          className="flex items-center justify-center w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-all"
          title="Edit timeslot"
        >
          <Edit2 className="h-2.5 w-2.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(slot);
          }}
          className="flex items-center justify-center w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
          title="Delete timeslot"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}

/** Lesson cell with polished styling */
function AdminLessonCell({
  entry,
  hasConflict,
  onEdit,
  onDelete,
}: {
  entry: LessonEntry;
  hasConflict: boolean;
  onEdit?: (lesson: LessonEntry) => void;
  onDelete?: (lesson: LessonEntry) => void;
}) {
  return (
    <div
      className={cn(
        "group/lesson relative cursor-pointer rounded-lg p-2 hover:shadow-md transition-all duration-150 border",
        hasConflict
          ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
          : "bg-blue-50/60 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700",
      )}
      onClick={() => onEdit?.(entry)}
      title="Click to edit"
    >
      <div className="space-y-1">
        <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 leading-tight line-clamp-2">
          {entry.subject.name}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
          <span>{entry.teacher.name}</span>
        </div>
        {entry.roomNumber && (
          <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            <span>{entry.roomNumber}</span>
          </div>
        )}
      </div>

      {/* Hover controls */}
      <div className="absolute top-1 right-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity flex items-center gap-0.5">
        {entry.isDoublePeriod && (
          <span className="text-[9px] bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded-md">
            2x
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(entry);
          }}
          className="p-1 rounded-md hover:bg-white/80 dark:hover:bg-slate-700 transition-colors"
          title="Edit lesson"
        >
          <Edit2 className="h-3 w-3 text-slate-500" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(entry);
          }}
          className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          title="Delete lesson"
        >
          <Trash2 className="h-3 w-3 text-red-400" />
        </button>
      </div>

      {hasConflict && (
        <div className="absolute bottom-1 right-1">
          <AlertCircle className="h-3 w-3 text-red-500" />
        </div>
      )}
    </div>
  );
}

/** Break row interleaved between periods */
function BreakRow({
  breaks,
  days,
  cleanName,
  onEditBreak,
}: {
  breaks: BreakEntry[];
  days: string[];
  cleanName: (name: string) => string;
  onEditBreak?: (breakEntry: BreakEntry) => void;
}) {
  return (
    <tr className="bg-amber-50/60 dark:bg-amber-950/10 border-y border-amber-100 dark:border-amber-900/30">
      <td className="border-r border-amber-100 dark:border-amber-900/30 p-0">
        <div className="p-2 w-[170px]">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-xs flex-shrink-0">
              {breaks[0]?.icon || "☕"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[11px] text-amber-800 dark:text-amber-200 leading-tight truncate">
                {cleanName(breaks[0]?.name || "Break")}
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400">
                {breaks[0]?.durationMinutes}m
              </div>
            </div>
          </div>
        </div>
      </td>
      {days.map((_, dayIndex) => {
        const dayBreak = breaks.find(
          (b) => b.applyToAllDays || b.dayOfWeek === dayIndex + 1,
        );
        return (
          <td
            key={dayIndex}
            className="border-r border-amber-100 dark:border-amber-900/30 last:border-r-0 p-1.5 text-center align-middle"
          >
            {dayBreak ? (
              <div
                className="inline-flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 rounded-lg px-2.5 py-1.5 hover:shadow-sm hover:border-amber-300 dark:hover:border-amber-700 transition-all group/break"
                onClick={() => onEditBreak?.(dayBreak)}
                title="Click to edit break"
              >
                <span className="text-sm">{dayBreak.icon || "☕"}</span>
                <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-200">
                  {cleanName(dayBreak.name)}
                </span>
                <span className="text-[9px] text-amber-500">
                  {dayBreak.durationMinutes}m
                </span>
                <Edit2 className="h-2.5 w-2.5 text-amber-400 opacity-0 group-hover/break:opacity-100 transition-opacity" />
              </div>
            ) : (
              <button
                onClick={() => {
                  onEditBreak?.({
                    isNew: true,
                    afterPeriod: breaks[0]?.afterPeriod || 0,
                    dayOfWeek: dayIndex + 1,
                    name: "New Break",
                    type: "BREAK",
                    durationMinutes: 20,
                  });
                }}
                className="inline-flex items-center gap-1 text-[10px] text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 border border-dashed border-amber-200 dark:border-amber-800 rounded-lg px-2 py-1 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all"
                title="Add break for this day"
              >
                <Plus className="h-3 w-3" />
                <span className="font-medium">Add</span>
              </button>
            )}
          </td>
        );
      })}
    </tr>
  );
}

/** Breaks before Period 1 */
function BreakBeforeFirstRow({
  breaks,
  days,
  cleanName,
  onEditBreak,
}: {
  breaks: BreakEntry[];
  days: string[];
  cleanName: (name: string) => string;
  onEditBreak?: (breakEntry: BreakEntry) => void;
}) {
  if (breaks.length === 0) return null;

  return (
    <BreakRow
      breaks={breaks}
      days={days}
      cleanName={cleanName}
      onEditBreak={onEditBreak}
    />
  );
}

export default AdminTimetableGrid;
