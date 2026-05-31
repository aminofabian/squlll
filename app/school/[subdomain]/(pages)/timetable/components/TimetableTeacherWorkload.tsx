"use client";

import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeacherWeeklyLesson } from "../hooks/useTimetableData";

type TimetableTeacherWorkloadProps = {
  teachers: TeacherWeeklyLesson[];
  highlightTeacherId?: string | null;
  onTeacherClick?: (teacherId: string) => void;
  className?: string;
  maxHeightClass?: string;
};

export function TimetableTeacherWorkload({
  teachers,
  highlightTeacherId,
  onTeacherClick,
  className,
  maxHeightClass = "max-h-52",
}: TimetableTeacherWorkloadProps) {
  if (teachers.length === 0) return null;

  const maxLessons = teachers[0]?.lessonCount ?? 1;

  return (
    <div className={cn("px-4 py-3", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Teachers this week
        </p>
        <span className="text-[10px] font-medium tabular-nums text-slate-400 dark:text-slate-500">
          {teachers.length} teaching
        </span>
      </div>

      <ul
        className={cn(
          "space-y-1 overflow-y-auto overscroll-contain",
          maxHeightClass,
        )}
      >
        {teachers.map((teacher, index) => {
          const isHighlighted = highlightTeacherId === teacher.teacherId;
          const Row = onTeacherClick ? "button" : "div";

          return (
            <li key={teacher.teacherId}>
              <Row
                {...(onTeacherClick
                  ? {
                      type: "button" as const,
                      onClick: () => onTeacherClick(teacher.teacherId),
                    }
                  : {})}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                  onTeacherClick &&
                    "active:bg-slate-100 dark:active:bg-slate-800/60",
                  isHighlighted
                    ? "bg-primary/10 ring-1 ring-primary/20 dark:bg-primary/15"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums",
                    index === 0
                      ? "bg-primary/15 text-primary dark:bg-primary/20"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                  )}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {teacher.name}
                  </span>
                  <span className="mt-1 block h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <span
                      className="block h-full rounded-full bg-primary/60 dark:bg-primary/50"
                      style={{
                        width: `${Math.max(8, (teacher.lessonCount / maxLessons) * 100)}%`,
                      }}
                    />
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {teacher.lessonCount}
                  </span>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500">
                    {teacher.lessonCount === 1 ? "lesson" : "lessons"}
                  </span>
                </span>
              </Row>
            </li>
          );
        })}
      </ul>

      {onTeacherClick ? (
        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
          <Users className="h-3 w-3 shrink-0" aria-hidden />
          Tap a teacher to highlight their lessons on the grid
        </p>
      ) : null}
    </div>
  );
}
