"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Users, BookOpen, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeacherTimetable } from "../hooks/useTeacherTimetable";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { Button } from "@/components/ui/button";

import {
  useTimetableCore,
  transformTeacherTimetable,
  transformTeacherTimetableMerged,
  DAY_NAMES,
  type CompleteTimetable,
  type TimetableStats,
} from "@/lib/timetable";

import {
  CurrentLessonBanner,
  TimetableGrid,
  NextLessonPreview,
  TeacherMobileSchedule,
} from "@/components/timetable";
import {
  TeacherTimetableHero,
  StatusNote,
} from "./components/TeacherTimetableHero";
import { getWeekStartDate } from "@/lib/timetable/week";
import {
  fetchMyLessonCompletions,
  setLessonCompletion,
} from "@/lib/teacher/lessonCompletion";
import { useDomainRealtime } from "@/lib/realtime/useDomainRealtime";

const TeacherTimetable = () => {
  const params = useParams();
  const subdomain =
    typeof params.subdomain === "string"
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : "";

  const { selectedTerm } = useSelectedTerm();
  const {
    data: graphqlData,
    loading,
    error,
    refetch,
  } = useTeacherTimetable(subdomain);

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const termId = selectedTerm?.id;

  useEffect(() => {
    if (!subdomain || !termId) {
      setCompletedLessonIds([]);
      return;
    }

    let cancelled = false;
    void fetchMyLessonCompletions(subdomain, termId, getWeekStartDate())
      .then((ids) => {
        if (!cancelled) setCompletedLessonIds(ids);
      })
      .catch(() => {
        if (!cancelled) setCompletedLessonIds([]);
      });

    return () => {
      cancelled = true;
    };
  }, [subdomain, termId]);

  useDomainRealtime({
    onTimetablePublished: (payload) => {
      if (payload.termId === termId) void refetch();
    },
    onLessonCompleted: (payload) => {
      if (payload.termId !== termId) return;
      setCompletedLessonIds((prev) => {
        if (payload.completed) {
          return prev.includes(payload.timetableEntryId)
            ? prev
            : [...prev, payload.timetableEntryId];
        }
        return prev.filter((id) => id !== payload.timetableEntryId);
      });
    },
  });

  const handleToggleComplete = useCallback(
    async (lessonId: string) => {
      if (!subdomain || !termId) return;

      const wasCompleted = completedLessonIds.includes(lessonId);
      const nextCompleted = !wasCompleted;

      setCompletedLessonIds((prev) =>
        nextCompleted
          ? [...prev, lessonId]
          : prev.filter((id) => id !== lessonId),
      );

      try {
        await setLessonCompletion(subdomain, {
          timetableEntryId: lessonId,
          termId,
          weekStartDate: getWeekStartDate(),
          completed: nextCompleted,
        });
      } catch {
        setCompletedLessonIds((prev) =>
          wasCompleted
            ? [...prev, lessonId]
            : prev.filter((id) => id !== lessonId),
        );
      }
    },
    [subdomain, termId, completedLessonIds],
  );

  const unifiedTimetable = useMemo<CompleteTimetable | null>(() => {
    if (!graphqlData) return null;

    const hasMyLessons =
      (graphqlData.totalClasses ?? 0) > 0 ||
      (graphqlData.entries?.length ?? 0) > 0 ||
      (graphqlData.mySchedule?.some((d) => (d.entries?.length ?? 0) > 0) ??
        false);

    if (hasMyLessons || graphqlData.schoolSchedule?.schedule?.length) {
      return transformTeacherTimetableMerged(
        graphqlData.mySchedule ?? [],
        graphqlData.teacherId,
        graphqlData.teacherName,
        selectedTerm?.id || "",
        selectedTerm?.name || "",
        completedLessonIds,
        graphqlData.schoolSchedule?.schedule ?? null,
      );
    }

    if (!graphqlData.timeSlots?.length) return null;
    return transformTeacherTimetable(
      graphqlData.timeSlots,
      graphqlData.entries,
      selectedTerm?.id || "",
      selectedTerm?.name || "",
      completedLessonIds,
    );
  }, [graphqlData, selectedTerm?.id, selectedTerm?.name, completedLessonIds]);

  const core = useTimetableCore({
    viewType: "teacher",
    timetableData: unifiedTimetable,
    isLoading: loading,
    error: error || null,
    refetch,
    completedLessonIds,
    onToggleComplete: (lessonId) => {
      void handleToggleComplete(lessonId);
    },
  });

  const stats = unifiedTimetable?.stats as TimetableStats | undefined;
  const isWeekend = core.currentDayOfWeek === null;
  const showLiveBanner =
    core.currentStatus.status === "lesson" ||
    core.currentStatus.status === "break" ||
    core.currentStatus.status === "free";

  if (core.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="w-full max-w-md space-y-3 px-4">
          <div className="h-20 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-700/80" />
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="h-32 animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-700/60" />
            <div className="h-48 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-700/60" />
          </div>
          <p className="text-center text-sm text-slate-500">Loading your schedule…</p>
        </div>
      </div>
    );
  }

  if (core.error) {
    const isNoTermError = core.error === "No term selected";
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {isNoTermError ? "No Term Selected" : "Error Loading Timetable"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {isNoTermError
              ? "Please select a term from the dropdown to view your timetable."
              : core.error}
          </p>
          {!isNoTermError && (
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  const hasNoLessons =
    !loading &&
    !error &&
    graphqlData != null &&
    (graphqlData.totalClasses ?? 0) === 0 &&
    (graphqlData.entries?.length ?? 0) === 0;

  const classesToday =
    !isWeekend && stats
      ? stats.dayDistribution[core.currentDayName] ?? 0
      : null;

  const completionPercent = stats?.completionPercentage ?? 0;

  const emptyLessons = (
    <div className="rounded-lg border border-amber-200/70 bg-amber-50/50 px-6 py-10 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
      <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
        No lessons for {selectedTerm?.name || "this term"}
      </p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-amber-800/90 dark:text-amber-300/80">
        {graphqlData?.timetablePublishedAt
          ? "Ask your administrator to assign you on the school timetable."
          : "Try switching term, or ask admin to confirm assignments and publish."}
      </p>
    </div>
  );

  const scheduleGrid =
    unifiedTimetable && !hasNoLessons ? (
      <>
        {/* Mobile: floating schedule shell */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60 dark:bg-slate-800/95 dark:shadow-none dark:ring-slate-700/80 lg:rounded-lg lg:border lg:border-slate-200/80 lg:shadow-sm">
          <div className="hidden border-b border-slate-100 px-4 py-2.5 dark:border-slate-700/80 lg:block">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Weekly schedule
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tap a lesson to mark it taught
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Today
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                  Taught
                </span>
              </div>
            </div>
          </div>
          <TimetableGrid
            days={unifiedTimetable.days}
            timeSlots={core.sortedTimeSlots}
            breaks={unifiedTimetable.breaks}
            viewType="teacher"
            compact
            className="rounded-none border-0 bg-transparent ring-0 shadow-none"
            currentDayOfWeek={core.currentDayOfWeek}
            currentPeriodIndex={core.currentPeriodIndex}
            completedLessonIds={core.completedLessonIds}
            onLessonClick={(lesson) => {
              core.toggleLessonComplete(lesson.id);
            }}
          />
        </section>
      </>
    ) : null;

  const statsBlock =
    stats && stats.totalLessons > 0 ? (
      <>
        <WeeklyLoadBar stats={stats} currentDay={core.currentDayOfWeek} />
        <div className="grid grid-cols-2 gap-2">
          <QuickStat
            icon={<BookOpen className="h-4 w-4" />}
            label="Weekly classes"
            value={stats.totalLessons}
            accent="primary"
          />
          <QuickStat
            icon={<Users className="h-4 w-4" />}
            label="Subjects"
            value={stats.totalSubjects}
            accent="violet"
          />
          <QuickStat
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Marked taught"
            value={`${stats.completedLessons}/${stats.totalLessons}`}
            accent="emerald"
          />
          <QuickStat
            icon={<CalendarDays className="h-4 w-4" />}
            label="Classes today"
            value={isWeekend ? "—" : classesToday ?? 0}
            hint={isWeekend ? "Weekend" : undefined}
            accent="amber"
          />
        </div>
      </>
    ) : null;

  const secondaryBelow = (
    <div className="space-y-3">
      <TeacherTimetableHero
        formattedDate={core.formattedDate}
        termName={selectedTerm?.name}
        completionPercent={completionPercent}
        completedCount={stats?.completedLessons ?? 0}
        totalLessons={stats?.totalLessons ?? 0}
      />
      {core.currentStatus.status === "outside" && !isWeekend && (
        <StatusNote>
          Outside school hours — your next class is in Up Next above.
        </StatusNote>
      )}
      {showLiveBanner && (
        <CurrentLessonBanner
          status={core.currentStatus}
          formattedTime={core.formattedTime}
          viewType="teacher"
          showClock={false}
        />
      )}
      {statsBlock}
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f2f2f7] lg:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] lg:from-primary/[0.06] lg:via-slate-50 lg:to-white dark:lg:from-primary/10 dark:lg:via-slate-900 dark:lg:to-slate-950">
      <div className="container mx-auto max-w-7xl px-4 py-4 max-lg:overflow-x-hidden max-lg:p-0">
        {/* Mobile — fit viewport, scroll only inside timetable card */}
        <div className="flex h-[calc(100dvh-9.75rem)] max-h-[calc(100dvh-9.75rem)] w-full max-w-full flex-col overflow-hidden bg-[#f2f2f7] px-3 pt-2 pb-2 lg:hidden">
          {hasNoLessons ? (
            <div className="flex min-h-[50dvh] items-center justify-center">{emptyLessons}</div>
          ) : unifiedTimetable ? (
            <TeacherMobileSchedule
              days={unifiedTimetable.days}
              timeSlots={core.sortedTimeSlots}
              breaks={unifiedTimetable.breaks}
              currentDayOfWeek={core.currentDayOfWeek}
              currentPeriodIndex={core.currentPeriodIndex}
              completedLessonIds={core.completedLessonIds}
              nextLesson={core.nextLesson}
              stats={stats}
              formattedDate={core.formattedDate}
              onLessonClick={(lesson) => core.toggleLessonComplete(lesson.id)}
            />
          ) : null}
        </div>

        {/* Desktop */}
        <div className="hidden flex-col gap-4 lg:flex">
          <TeacherTimetableHero
            formattedDate={core.formattedDate}
            termName={selectedTerm?.name}
            completionPercent={completionPercent}
            completedCount={stats?.completedLessons ?? 0}
            totalLessons={stats?.totalLessons ?? 0}
          />
          {core.currentStatus.status === "outside" && !isWeekend && (
            <StatusNote>
              Outside school hours — your next class is in Up Next below.
            </StatusNote>
          )}
          <div className="grid grid-cols-[minmax(0,340px)_1fr] items-start gap-4">
            <div className="sticky top-4 z-0 space-y-3">
              <NextLessonPreview
                nextLesson={core.nextLesson}
                viewType="teacher"
                dense
              />
              {showLiveBanner && (
                <CurrentLessonBanner
                  status={core.currentStatus}
                  formattedTime={core.formattedTime}
                  viewType="teacher"
                  showClock={false}
                />
              )}
              {statsBlock}
            </div>
            <div className="min-w-0 space-y-3">
              {hasNoLessons ? emptyLessons : scheduleGrid}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function WeeklyLoadBar({
  stats,
  currentDay,
}: {
  stats: TimetableStats;
  currentDay: number | null;
}) {
  const dayKeys = [1, 2, 3, 4, 5] as const;
  const counts = dayKeys.map((d) => stats.dayDistribution[DAY_NAMES[d]] ?? 0);
  const maxLessons = Math.max(...counts, 1);
  const totalWeekly = counts.reduce((a, b) => a + b, 0);

  if (totalWeekly === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-200 dark:border-slate-700 bg-white px-3 py-3 dark:bg-slate-800">
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
          Weekly load
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          No lessons counted for this week yet.
        </p>
      </div>
    );
  }

  const dayLabels: Record<number, string> = {
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
  };

  return (
    <div className="rounded-md border border-slate-200/80 bg-white px-3 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Weekly load
        </p>
        <p className="shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {totalWeekly}
          </span>{" "}
          classes
        </p>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {dayKeys.map((day) => {
          const count = stats.dayDistribution[DAY_NAMES[day]] ?? 0;
          const fillPct =
            maxLessons > 0 && count > 0
              ? Math.max((count / maxLessons) * 100, 12)
              : 0;
          const isToday = currentDay === day;

          return (
            <div key={day} className="flex min-w-0 flex-col gap-1.5">
              <div
                className="flex h-12 w-full items-end overflow-hidden rounded-sm bg-slate-100 dark:bg-slate-700/80"
                aria-label={`${dayLabels[day]}: ${count} classes`}
              >
                {count > 0 ? (
                  <div
                    className={cn(
                      "w-full transition-[height] duration-300",
                      isToday ? "bg-primary" : "bg-primary/45 dark:bg-primary/35",
                    )}
                    style={{ height: `${fillPct}%` }}
                  />
                ) : null}
              </div>
              <div className="text-center leading-none">
                <p
                  className={cn(
                    "text-[11px] font-medium",
                    isToday
                      ? "text-primary"
                      : "text-slate-600 dark:text-slate-400",
                  )}
                >
                  {dayLabels[day]}
                </p>
                <p className="mt-0.5 text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
                  {count}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STAT_ACCENTS = {
  primary: "bg-primary/10 text-primary dark:bg-primary/20",
  violet: "bg-violet-500/10 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  emerald: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  amber: "bg-amber-500/10 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
} as const;

function QuickStat({
  icon,
  label,
  value,
  hint,
  accent = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
  accent?: keyof typeof STAT_ACCENTS;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200/80 bg-white px-2.5 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
      <div className={cn("shrink-0 rounded-md p-1.5", STAT_ACCENTS[accent])}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-base font-bold leading-tight text-slate-900 dark:text-slate-100">
          {value}
        </p>
        <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {hint && (
          <p className="mt-0.5 text-[9px] leading-snug text-slate-400">{hint}</p>
        )}
      </div>
    </div>
  );
}

export default TeacherTimetable;
