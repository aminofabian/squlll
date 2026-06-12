"use client";

import type { ReactNode } from "react";
import { CalendarDays, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RealtimeLiveIndicator } from "@/lib/realtime/RealtimeLiveIndicator";

interface TeacherTimetableHeroProps {
  formattedDate: string;
  termName?: string;
  onPrint?: () => void;
  showPrint?: boolean;
}

export function TeacherTimetableHero({
  formattedDate,
  termName,
  onPrint,
  showPrint = false,
}: TeacherTimetableHeroProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
          My Teaching Schedule
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {formattedDate}
          {termName ? (
            <>
              <span className="mx-2 text-slate-300 dark:text-slate-600" aria-hidden>
                ·
              </span>
              {termName}
            </>
          ) : null}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <RealtimeLiveIndicator
          className="hidden lg:inline-flex"
          showLabel={false}
        />
        {showPrint && onPrint ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            onClick={onPrint}
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
        ) : null}
        {termName ? (
          <div className="hidden items-center gap-1.5 rounded-md border border-slate-200/70 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 sm:flex dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            {termName}
          </div>
        ) : null}
      </div>
    </header>
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
        "text-sm",
        variant === "weekend"
          ? "rounded-md border border-indigo-200/60 bg-indigo-50/80 px-3 py-2 text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-200"
          : "text-slate-500 dark:text-slate-400",
      )}
    >
      {children}
    </p>
  );
}
