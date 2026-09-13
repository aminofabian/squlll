"use client";

import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";
import type { TeacherWeeklyLesson } from "../hooks/useTimetableData";

type TimetableTeacherWorkloadProps = {
  teachers: TeacherWeeklyLesson[];
  highlightTeacherId?: string | null;
  onTeacherClick?: (teacherId: string) => void;
  className?: string;
  maxHeightClass?: string;
  showEmpty?: boolean;
};

export function TimetableTeacherWorkload({
  teachers,
  highlightTeacherId,
  onTeacherClick,
  className,
  maxHeightClass = "max-h-52",
  showEmpty = false,
}: TimetableTeacherWorkloadProps) {
  if (teachers.length === 0) {
    if (!showEmpty) return null;
    return (
      <div className={cn("px-3 py-8 text-center", className)}>
        <p className={cn(tt.text.body, "font-medium", tt.ink.strong)}>
          No teachers on this grid
        </p>
        <p className={cn("mt-1", tt.text.small, tt.ink.muted)}>
          Lessons in view will list who is teaching them.
        </p>
      </div>
    );
  }

  const maxLessons = teachers[0]?.lessonCount ?? 1;

  return (
    <div className={cn("px-4 py-3", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className={tt.eyebrow}>Teachers this week</p>
        <span
          className={cn(tt.text.micro, "font-medium", tt.numeral, tt.ink.faint)}
        >
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
                  "flex w-full items-center gap-3 rounded-none px-2.5 py-2 text-left transition-colors",
                  onTeacherClick && tt.focus,
                  onTeacherClick &&
                    "active:bg-[#e8f2ef] dark:active:bg-white/10",
                  isHighlighted
                    ? "bg-[#246a59]/10 ring-1 ring-[#246a59]/20 dark:bg-[#246a59]/20"
                    : tt.rowHover,
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-none font-bold",
                    tt.text.micro,
                    tt.numeral,
                    index === 0
                      ? "bg-[#246a59]/15 text-[#246a59] dark:bg-[#246a59]/20 dark:text-[#7eb8a8]"
                      : cn("bg-[#e8f2ef] dark:bg-white/10", tt.ink.muted),
                  )}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate font-medium",
                      tt.text.title,
                      tt.ink.strong,
                    )}
                  >
                    {teacher.name}
                  </span>
                  <span className="mt-1 block h-1 overflow-hidden rounded-none bg-[#e8f2ef] dark:bg-white/10">
                    <span
                      className="block h-full rounded-none bg-[#246a59]/60 dark:bg-[#246a59]/50"
                      style={{
                        width: `${Math.max(8, (teacher.lessonCount / maxLessons) * 100)}%`,
                      }}
                    />
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span
                    className={cn(
                      "block",
                      tt.text.title,
                      tt.numeral,
                      tt.ink.strong,
                    )}
                  >
                    {teacher.lessonCount}
                  </span>
                  <span className={cn("block", tt.text.micro, tt.ink.faint)}>
                    {teacher.lessonCount === 1 ? "lesson" : "lessons"}
                  </span>
                </span>
              </Row>
            </li>
          );
        })}
      </ul>

      {onTeacherClick ? (
        <p
          className={cn(
            "mt-2 flex items-center gap-1.5",
            tt.text.micro,
            tt.ink.faint,
          )}
        >
          <Users className="h-3 w-3 shrink-0" aria-hidden />
          Tap a teacher to highlight their lessons on the grid
        </p>
      ) : null}
    </div>
  );
}
