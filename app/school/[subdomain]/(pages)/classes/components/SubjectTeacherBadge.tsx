"use client";

import { cn } from "@/lib/utils";

interface SubjectTeacherBadgeProps {
  teacherName?: string;
  onAssign?: () => void;
  className?: string;
}

export function SubjectTeacherBadge({
  teacherName,
  onAssign,
  className,
}: SubjectTeacherBadgeProps) {
  if (teacherName) {
    return (
      <span
        className={cn(
          "max-w-[6.5rem] shrink-0 truncate text-xs font-medium text-slate-800 dark:text-slate-100",
          className,
        )}
        title={teacherName}
      >
        {teacherName}
      </span>
    );
  }

  if (onAssign) {
    return (
      <button
        type="button"
        onClick={onAssign}
        title="Assign teacher"
        className={cn(
          "shrink-0 whitespace-nowrap text-[11px] text-slate-400 transition-colors hover:text-slate-600 hover:underline dark:hover:text-slate-300",
          className,
        )}
      >
        — unassigned
      </button>
    );
  }

  return (
    <span
      className={cn(
        "shrink-0 whitespace-nowrap text-[11px] text-slate-400",
        className,
      )}
    >
      — unassigned
    </span>
  );
}
