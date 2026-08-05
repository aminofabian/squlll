"use client";

import { Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function teacherInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

interface ClassTeacherSpotlightProps {
  roleLabel: string;
  teacherName?: string;
  teacherEmail?: string | null;
  loading?: boolean;
  onAssign?: () => void;
  className?: string;
}

export function ClassTeacherSpotlight({
  roleLabel,
  teacherName,
  teacherEmail,
  loading,
  onAssign,
  className,
}: ClassTeacherSpotlightProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "rounded-none border border-[#1a4d42]/12 bg-[#f8fbfa] p-4 dark:border-white/15 dark:bg-[#071411]",
          className,
        )}
      >
        <div className="h-3 w-24 animate-pulse rounded bg-[#e8f2ef] dark:bg-slate-700" />
        <div className="mt-4 flex gap-3">
          <div className="h-12 w-12 animate-pulse rounded-none bg-[#e8f2ef] dark:bg-slate-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-[#e8f2ef] dark:bg-slate-700" />
            <div className="h-3 w-40 animate-pulse rounded bg-[#e8f2ef] dark:bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  if (!teacherName) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-none border border-dashed border-amber-200/90 bg-gradient-to-br from-amber-50/90 via-white to-slate-50/80 p-4 dark:border-amber-900/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900/80",
          className,
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700/90 dark:text-amber-300/90">
          {roleLabel}
        </p>
        <p className="mt-2 text-sm font-medium text-[#0a1f1a] dark:text-white">
          No teacher assigned yet
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[#1a4d42]/55">
          Assign a homeroom teacher so parents and staff know who leads this class.
        </p>
        {onAssign ? (
          <Button
            type="button"
            size="sm"
            className="mt-4 h-8 gap-1.5 bg-[#246a59] text-xs hover:bg-[#1a4d42]"
            onClick={onAssign}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Assign teacher
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-none border border-[#1a4d42]/12 bg-gradient-to-br from-[#246a59]/[0.06] via-white to-slate-50/60 p-4 dark:border-white/15 dark:from-[#246a59]/10 dark:via-slate-900 dark:to-slate-900/80",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#246a59]/80">
        {roleLabel}
      </p>
      <div className="mt-3 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-gradient-to-br from-[#246a59] to-[#005bb5] text-sm font-bold text-white shadow-none">
          {teacherInitials(teacherName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#0a1f1a] dark:text-white">
            {teacherName}
          </p>
          {teacherEmail ? (
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-[#1a4d42]/55">
              <Mail className="h-3 w-3 shrink-0 opacity-60" />
              <span className="truncate">{teacherEmail}</span>
            </p>
          ) : (
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              Assigned · active
            </p>
          )}
        </div>
      </div>
      {onAssign ? (
        <button
          type="button"
          onClick={onAssign}
          className="mt-3 text-xs font-medium text-[#246a59] hover:underline"
        >
          Change teacher
        </button>
      ) : null}
    </div>
  );
}
