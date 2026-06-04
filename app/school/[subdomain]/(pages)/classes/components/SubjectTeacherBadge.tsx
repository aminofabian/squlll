"use client";

import { UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

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
          "inline-flex max-w-[11rem] items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50/90 py-0.5 pl-0.5 pr-2.5 dark:border-slate-600 dark:bg-slate-800/60",
          className,
        )}
        title={teacherName}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0073ea]/15 text-[10px] font-bold text-[#0073ea]">
          {initials(teacherName)}
        </span>
        <span className="truncate text-xs font-medium text-slate-800 dark:text-slate-100">
          {teacherName}
        </span>
      </span>
    );
  }

  if (onAssign) {
    return (
      <button
        type="button"
        onClick={onAssign}
        title="Assign teacher for this subject"
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-amber-300/90 bg-amber-50/90 px-2.5 py-1 text-[11px] font-medium text-amber-800 transition-colors hover:border-amber-400 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
          className,
        )}
      >
        <UserPlus className="h-3 w-3" />
        Assign
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
      Unassigned
    </span>
  );
}
