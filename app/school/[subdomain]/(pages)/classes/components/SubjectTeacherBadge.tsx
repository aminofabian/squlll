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
          "inline-flex max-w-[11rem] items-center gap-1.5 rounded-none border border-[#1a4d42]/12 bg-[#f8fbfa] py-0.5 pl-0.5 pr-2.5 dark:border-slate-600 dark:bg-slate-800/60",
          className,
        )}
        title={teacherName}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-[#246a59]/15 text-[10px] font-bold text-[#246a59]">
          {initials(teacherName)}
        </span>
        <span className="truncate text-xs font-medium text-[#0a1f1a] dark:text-white">
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
          "inline-flex shrink-0 items-center gap-1 rounded-none border border-dashed border-amber-300/90 bg-amber-50/90 px-2.5 py-1 text-[11px] font-medium text-amber-800 transition-colors hover:border-amber-400 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
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
        "shrink-0 whitespace-nowrap text-[11px] text-[#1a4d42]/45",
        className,
      )}
    >
      Unassigned
    </span>
  );
}
