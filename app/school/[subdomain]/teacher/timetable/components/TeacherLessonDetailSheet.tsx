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
import { formatGradeShort } from "@/components/timetable/TeacherMobileWeekTable";
import type { TimetableLesson, TimetableSlot } from "@/lib/timetable/types";

export type TeacherLessonSelection = {
  lesson: TimetableLesson;
  dayOfWeek: number;
  periodNumber: number;
};

export type TeacherLessonDetailSheetProps = {
  selection: TeacherLessonSelection | null;
  timeSlots: TimetableSlot[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCompleted?: boolean;
  onToggleComplete?: (lessonId: string) => void;
};

function formatClassLabel(lesson: TimetableLesson): string {
  const grade = formatGradeShort(
    lesson.grade.displayName || "",
    lesson.grade.name,
  );
  if (grade && lesson.stream) return `${grade} · ${lesson.stream}`;
  if (grade) return grade;
  if (lesson.stream) return lesson.stream;
  return lesson.grade.displayName || lesson.grade.name || "—";
}

export function TeacherLessonDetailSheet({
  selection,
  timeSlots,
  open,
  onOpenChange,
  isCompleted = false,
  onToggleComplete,
}: TeacherLessonDetailSheetProps) {
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
  const classLabel = lesson ? formatClassLabel(lesson) : "";

  const headerMeta = [classLabel, dayLabel, timeLabel].filter(Boolean);

  const detailItems = lesson
    ? [
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
              value: `P${periodNumber} · ${slot.displayTime}`,
            }
          : null,
        lesson.studentCount != null
          ? {
              key: "students",
              icon: Users,
              label: "Students",
              value: String(lesson.studentCount),
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
              value: lesson.originalTeacher
                ? `Substitute for ${lesson.originalTeacher}`
                : "Substitute class",
            }
          : null,
      ].filter(Boolean)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "relative gap-0 overflow-hidden border-0 bg-white p-0 shadow-none dark:bg-slate-950",
          "max-h-[min(88dvh,640px)] overflow-y-auto",
          "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto max-lg:max-w-full max-lg:translate-x-0 max-lg:translate-y-0 max-lg:rounded-none max-lg:border-t max-lg:border-slate-100 max-lg:pb-[env(safe-area-inset-bottom)] dark:max-lg:border-slate-800",
          "max-lg:data-[state=closed]:slide-out-to-bottom max-lg:data-[state=open]:slide-in-from-bottom max-lg:data-[state=open]:zoom-in-100 max-lg:data-[state=closed]:zoom-out-100",
          "lg:top-[50%] lg:left-[50%] lg:max-w-md lg:translate-x-[-50%] lg:translate-y-[-50%] lg:rounded-lg lg:border lg:border-slate-200/80 lg:shadow-xl dark:lg:border-slate-700/80",
        )}
      >
        {lesson && palette ? (
          <>
            <div className="flex items-stretch border-b border-slate-100 dark:border-slate-800">
              <div
                className="w-0.5 shrink-0"
                style={{ backgroundColor: palette.accent }}
                aria-hidden
              />
              <DialogHeader className="min-w-0 flex-1 space-y-0 px-3 py-3 pr-12 text-left">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                  {shortCode}
                </p>
                <DialogTitle className="mt-1 break-words text-[15px] font-semibold leading-snug text-slate-900 dark:text-slate-100">
                  {lesson.subject.name}
                </DialogTitle>
                {headerMeta.length > 0 ? (
                  <DialogDescription asChild>
                    <MetaLine items={headerMeta} />
                  </DialogDescription>
                ) : null}
              </DialogHeader>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="absolute right-0 top-0 flex h-[58px] w-11 shrink-0 items-center justify-center border-l border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:text-slate-300"
                aria-label="Close"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {detailItems.map((item) =>
                item ? (
                  <DetailRow
                    key={item.key}
                    icon={<item.icon className="h-3.5 w-3.5" />}
                    label={item.label}
                    value={item.value}
                    accent={palette.accent}
                  />
                ) : null,
              )}
            </div>

            {onToggleComplete ? (
              <div className="border-t border-slate-100 p-3 dark:border-slate-800">
                <Button
                  type="button"
                  variant={isCompleted ? "outline" : "default"}
                  className={cn(
                    "h-11 w-full rounded-none text-[13px] font-semibold shadow-none",
                    !isCompleted && "bg-primary hover:bg-primary/90",
                    isCompleted &&
                      "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60",
                  )}
                  onClick={() => onToggleComplete(lesson.id)}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Marked as taught
                    </>
                  ) : (
                    "Mark as taught"
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

function MetaLine({ items }: { items: string[] }) {
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
      {items.map((value, index) => (
        <React.Fragment key={`${value}-${index}`}>
          {index > 0 ? (
            <span className="text-slate-300 dark:text-slate-600" aria-hidden>
              ·
            </span>
          ) : null}
          <span className="break-words">{value}</span>
        </React.Fragment>
      ))}
    </p>
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
    <div className="flex items-center gap-3 px-3 py-2.5">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center text-slate-400 dark:text-slate-500"
        style={{ color: accent }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 break-words text-[13px] font-medium leading-snug text-slate-900 dark:text-slate-100">
          {value}
        </p>
      </div>
    </div>
  );
}
