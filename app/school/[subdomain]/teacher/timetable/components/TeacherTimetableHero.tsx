"use client";

import type { ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Printer,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RealtimeLiveIndicator } from "@/lib/realtime/RealtimeLiveIndicator";

interface TeacherTimetableHeroProps {
  formattedDate: string;
  termName?: string;
  teacherName?: string;
  classesToday?: number | null;
  totalClasses?: number;
  totalSubjects?: number;
  nextLessonLabel?: string;
  nextLessonTime?: string;
  onPrint?: () => void;
  showPrint?: boolean;
}

function greetingFor(name?: string): string {
  const firstName = name?.trim().split(/\s+/)[0];
  return firstName ? `Welcome back, ${firstName}` : "Your teaching week";
}

export function TeacherTimetableHero({
  formattedDate,
  termName,
  teacherName,
  classesToday,
  totalClasses = 0,
  totalSubjects = 0,
  nextLessonLabel,
  nextLessonTime,
  onPrint,
  showPrint = false,
}: TeacherTimetableHeroProps) {
  return (
    <header className="relative isolate overflow-hidden rounded-[26px] bg-[#0a2620] px-5 py-5 text-white shadow-[0_24px_60px_-42px_rgba(6,38,31,0.8)] sm:px-7 sm:py-6 lg:px-8">
      <div
        className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border border-white/10 bg-[radial-gradient(circle_at_center,rgba(196,154,82,0.28),transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#246a59]/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-[0.16] [background-image:linear-gradient(to_right,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:42px_100%]"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#d9c49a]">
              <Sparkles className="h-3 w-3" />
              Teaching studio
            </p>
            <p className="mt-2 text-[12px] font-medium text-white/55">
              {greetingFor(teacherName)}
            </p>
            <h1 className="mt-0.5 font-display text-[28px] leading-[1.05] tracking-[-0.035em] text-[#fbf8ef] sm:text-[34px]">
              My Teaching Timetable
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-white/60">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-[#d9c49a]" />
                {formattedDate}
              </span>
              {termName ? (
                <>
                  <span className="h-3 w-px bg-white/15" aria-hidden />
                  <span className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10.5px] font-semibold tracking-wide text-white/80">
                    {termName}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <RealtimeLiveIndicator className="hidden sm:inline-flex" showLabel={false} />
            {showPrint && onPrint ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 text-[11px] font-medium text-white/75 hover:bg-white/12 hover:text-white"
                onClick={onPrint}
              >
                <Printer className="h-3.5 w-3.5" />
                Print week
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <HeroMetric
            icon={<Users className="h-3.5 w-3.5" />}
            label="Today"
            value={classesToday == null ? "—" : String(classesToday)}
            suffix={
              classesToday == null
                ? "weekend"
                : classesToday === 1
                  ? "class"
                  : "classes"
            }
          />
          <HeroMetric
            icon={<BookOpen className="h-3.5 w-3.5" />}
            label="This week"
            value={String(totalClasses)}
            suffix={totalClasses === 1 ? "lesson" : "lessons"}
          />
          <HeroMetric
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label="Subjects"
            value={String(totalSubjects)}
            suffix="running"
          />
          <HeroMetric
            icon={<Clock3 className="h-3.5 w-3.5" />}
            label="Up next"
            value={nextLessonLabel ?? "—"}
            suffix={nextLessonTime}
            wide
            accent
          />
        </div>
      </div>
    </header>
  );
}

function HeroMetric({
  icon,
  label,
  value,
  suffix,
  wide = false,
  accent = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  suffix?: string;
  wide?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center justify-between gap-2 rounded-2xl border px-3 py-2.5 backdrop-blur-sm",
        accent
          ? "col-span-2 border-[#d9c49a]/25 bg-[#d9c49a]/10"
          : "border-white/10 bg-white/[0.055]",
        wide && "sm:col-span-1",
      )}
    >
      <div className="min-w-0">
        <p
          className={cn(
            "flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.16em]",
            accent ? "text-[#d9c49a]/80" : "text-white/40",
          )}
        >
          {icon}
          {label}
        </p>
        <div className="mt-1 flex min-w-0 items-baseline gap-1.5">
          <p
            className={cn(
              "truncate font-display text-[19px] leading-none tracking-tight",
              accent ? "text-[#f4e7c8]" : "text-white",
            )}
          >
            {value}
          </p>
          {suffix ? (
            <span className="truncate text-[9.5px] font-medium text-white/40">
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
      <ArrowUpRight
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          accent ? "text-[#d9c49a]/60" : "text-white/20",
        )}
        aria-hidden
      />
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
        "text-sm",
        variant === "weekend"
          ? "rounded-2xl border border-indigo-200/60 bg-indigo-50/80 px-3 py-2 text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-200"
          : "px-1 text-[11px] font-medium text-[#1a4d42]/45 dark:text-white/35",
      )}
    >
      {children}
    </p>
  );
}
