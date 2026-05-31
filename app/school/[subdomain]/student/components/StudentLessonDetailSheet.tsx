"use client";

import React from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DAY_NAMES,
  getSubjectPaletteColor,
  normalizeSubjectName,
} from "@/lib/timetable/constants";
import { getSubjectShortCode } from "@/lib/timetable/lessonShortcodes";
import type { TimetableLesson, TimetableSlot } from "@/lib/timetable/types";

export type StudentLessonSelection = {
  lesson: TimetableLesson;
  dayOfWeek: number;
  periodNumber: number;
};

export type StudentLessonDetailSheetProps = {
  selection: StudentLessonSelection | null;
  timeSlots: TimetableSlot[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCompleted?: boolean;
  onToggleComplete?: (lessonId: string) => void;
};

export function StudentLessonDetailSheet({
  selection,
  timeSlots,
  open,
  onOpenChange,
  isCompleted = false,
  onToggleComplete,
}: StudentLessonDetailSheetProps) {
  const lesson = selection?.lesson;
  const dayOfWeek = selection?.dayOfWeek;
  const periodNumber = selection?.periodNumber;

  const slot =
    periodNumber != null
      ? timeSlots.find((s) => s.periodNumber === periodNumber)
      : undefined;

  const shortCode = lesson
    ? getSubjectShortCode(lesson.subject.name, lesson.subject.code)
    : "";
  const palette = lesson
    ? getSubjectPaletteColor(normalizeSubjectName(lesson.subject.name))
    : null;
  const dayLabel = dayOfWeek ? DAY_NAMES[dayOfWeek] : "";
  const timeLabel = slot?.displayTime ?? "";

  const detailItems = lesson
    ? [
        {
          key: "teacher",
          icon: Users,
          label: "Teacher",
          value: lesson.teacher.name,
        },
        lesson.room
          ? {
              key: "room",
              icon: MapPin,
              label: "Room",
              value: lesson.room,
            }
          : null,
        slot
          ? {
              key: "period",
              icon: Clock,
              label: "Period",
              value: `Period ${periodNumber} · ${slot.displayTime}`,
            }
          : null,
        lesson.isDoublePeriod
          ? {
              key: "duration",
              icon: BookOpen,
              label: "Duration",
              value: lesson.isDoubleContinuation
                ? "Double period (2nd half)"
                : "Double period",
            }
          : null,
        lesson.isSubstitution
          ? {
              key: "sub",
              icon: Users,
              label: "Note",
              value: "Substitute teacher",
            }
          : null,
      ].filter(Boolean)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden rounded-lg border border-slate-200/80 bg-white p-0 shadow-xl",
          "dark:border-slate-700/80 dark:bg-slate-900",
          "max-h-[min(85dvh,640px)] max-w-md overflow-y-auto sm:max-w-md",
        )}
      >
        {lesson && palette ? (
          <>
            <DialogHeader className="space-y-0 border-b border-slate-100 p-4 text-left dark:border-slate-800">
              <div className="flex items-start gap-3 pr-6">
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded border border-slate-200/60 text-xs font-bold uppercase tracking-wider",
                    palette.bg,
                  )}
                  style={{ color: palette.accent }}
                >
                  {shortCode}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <DialogTitle className="break-words text-[17px] font-semibold leading-snug text-slate-900 dark:text-slate-100">
                    {lesson.subject.name}
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {dayLabel ? <MetaChip>{dayLabel}</MetaChip> : null}
                      {timeLabel ? (
                        <MetaChip icon={<Clock className="h-3 w-3" />}>
                          {timeLabel}
                        </MetaChip>
                      ) : null}
                      {periodNumber ? (
                        <MetaChip>P{periodNumber}</MetaChip>
                      ) : null}
                    </div>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-2 p-4">
              {detailItems.map((item) =>
                item ? (
                  <DetailRow
                    key={item.key}
                    icon={<item.icon className="h-4 w-4" />}
                    label={item.label}
                    value={item.value}
                    accent={palette.accent}
                  />
                ) : null,
              )}
            </div>

            {onToggleComplete ? (
              <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                <Button
                  type="button"
                  variant={isCompleted ? "outline" : "default"}
                  className={cn(
                    "h-11 w-full rounded-lg text-sm font-semibold shadow-sm",
                    isCompleted &&
                      "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60",
                  )}
                  onClick={() => onToggleComplete(lesson.id)}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Marked as attended
                    </>
                  ) : (
                    "Mark as attended"
                  )}
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function MetaChip({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
      {icon}
      {children}
    </span>
  );
}

function DetailRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-slate-50/50 px-3 py-2.5 dark:border-slate-700/80 dark:bg-slate-800/50">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-slate-200/60 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
        style={{ color: accent }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-medium text-slate-900 dark:text-slate-100">
          {value}
        </p>
      </div>
    </div>
  );
}
