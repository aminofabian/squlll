"use client";

import type { ReactNode } from "react";
import { CalendarDays, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeacherTimetableHeroProps {
  formattedDate: string;
  termName?: string;
  completionPercent: number;
  completedCount: number;
  totalLessons: number;
}

export function TeacherTimetableHero({
  formattedDate,
  termName,
  completionPercent,
  completedCount,
  totalLessons,
}: TeacherTimetableHeroProps) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-800/90">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary dark:bg-primary/20">
              <GraduationCap className="h-3 w-3" />
              Teacher
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
            My Teaching Schedule
          </h1>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
            {formattedDate}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {termName && (
            <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-200">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              {termName}
            </div>
          )}

          {totalLessons > 0 && (
            <div className="flex items-center gap-2.5 rounded-md border border-slate-200/80 bg-slate-50/50 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/40">
              <div className="relative h-10 w-10">
                <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    className="stroke-slate-200 dark:stroke-slate-700"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    className="stroke-primary transition-all duration-700"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(completionPercent / 100) * 94.2} 94.2`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-800 dark:text-slate-100">
                  {completionPercent}%
                </span>
              </div>
              <div className="text-left leading-tight">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Marked taught
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {completedCount}
                  <span className="font-normal text-slate-400"> / {totalLessons}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatusNote({
  children,
  variant = "muted",
}: {
  children: ReactNode;
  variant?: "muted" | "weekend";
}) {
  return (
    <p
      className={cn(
        "rounded-md px-3 py-2 text-sm",
        variant === "weekend"
          ? "border border-indigo-200/60 bg-indigo-50/80 text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-200"
          : "text-slate-600 dark:text-slate-400",
      )}
    >
      {children}
    </p>
  );
}
