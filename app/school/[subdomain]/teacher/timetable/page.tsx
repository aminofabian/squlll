"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTeacherTimetable } from "../hooks/useTeacherTimetable";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { BookOpen, Printer } from "lucide-react";

import {
  useTimetableCore,
  transformTeacherTimetable,
  transformTeacherTimetableMerged,
  type CompleteTimetable,
  type TimetableLesson,
  type TimetableStats,
} from "@/lib/timetable";

import {
  TimetableGrid,
  TeacherMobileSchedule,
  TimetablePrintStyles,
} from "@/components/timetable";
import { WeekHeroBar } from "@/components/timetable/week/WeekHeroBar";
import { WeekSidebar } from "@/components/timetable/week/WeekSidebar";
import { WeekGrid } from "@/components/timetable/week/WeekGrid";
import { WeekHeroButton } from "@/components/timetable/week/WeekHeroButton";
import { RealtimeLiveIndicator } from "@/lib/realtime/RealtimeLiveIndicator";
import { useWeekLayout } from "@/lib/timetable/weekView/useWeekLayout";
import { getGreeting } from "@/lib/timetable/weekView/getGreeting";
import { TeacherTimetableSkeleton } from "./components/TeacherTimetableSkeleton";
import {
  TeacherLessonDetailSheet,
  type TeacherLessonSelection,
} from "./components/TeacherLessonDetailSheet";
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
  const [selectedLesson, setSelectedLesson] =
    useState<TeacherLessonSelection | null>(null);
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
    onTimetableEntryChanged: (payload) => {
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

  const handleLessonClick = useCallback(
    (lesson: TimetableLesson, dayOfWeek: number, periodNumber: number) => {
      setSelectedLesson({ lesson, dayOfWeek, periodNumber });
    },
    [],
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

  const weekLayout = useWeekLayout(
    unifiedTimetable,
    core.sortedTimeSlots,
  );
  const stats = unifiedTimetable?.stats as TimetableStats | undefined;
  const isWeekend = core.currentDayOfWeek === null;

  const hasNoLessons =
    !loading &&
    !error &&
    graphqlData != null &&
    (graphqlData.totalClasses ?? 0) === 0 &&
    (graphqlData.entries?.length ?? 0) === 0;

  const canPrint = Boolean(unifiedTimetable && !hasNoLessons);

  const handlePrint = useCallback(() => {
    if (!canPrint) return;
    window.print();
  }, [canPrint]);

  if (core.isLoading) {
    return <TeacherTimetableSkeleton />;
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

  const classesToday =
    !isWeekend && stats
      ? stats.dayDistribution[core.currentDayName] ?? 0
      : null;

  const emptyLessons = (
    <div className="relative overflow-hidden rounded-xl border border-[#1a4d42]/10 bg-[#fbfaf6] px-6 py-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#c49a52]/10 blur-3xl" aria-hidden />
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#0a2620] text-[#d9c49a]">
        <BookOpen className="h-5 w-5" />
      </div>
      <p className="mt-4 font-display text-[20px] text-[#0a1f1a] dark:text-white">
        No lessons for {selectedTerm?.name || "this term"}
      </p>
      <p className="mx-auto mt-1.5 max-w-md text-[12px] leading-relaxed text-[#1a4d42]/50 dark:text-white/40">
        Ask your administrator to add you to the school timetable, or check that
        the correct term is selected.
      </p>
    </div>
  );

  const scheduleGrid =
    unifiedTimetable && !hasNoLessons ? (
      <WeekGrid
        viewType="teacher"
        rows={weekLayout.rows}
        dayDates={weekLayout.dayDates}
        lessonCounts={weekLayout.lessonCounts}
        weekRangeLabel={weekLayout.weekRangeLabel}
        totalLessons={stats?.totalLessons ?? 0}
        completedLessons={stats?.completedLessons ?? 0}
        currentDayOfWeek={core.currentDayOfWeek}
        currentPeriodIndex={core.currentPeriodIndex}
        progressPercent={core.currentStatus.progressPercent}
        completedLessonIds={core.completedLessonIds}
        nextLesson={
          core.nextLesson
            ? {
                id: core.nextLesson.lesson.id,
                dayOfWeek: core.nextLesson.lesson.dayOfWeek,
              }
            : null
        }
        onLessonClick={handleLessonClick}
      />
    ) : null;

  return (
    <>
      <TimetablePrintStyles />
      <TeacherLessonDetailSheet
        selection={selectedLesson}
        timeSlots={core.sortedTimeSlots}
        open={selectedLesson != null}
        onOpenChange={(open) => {
          if (!open) setSelectedLesson(null);
        }}
        isCompleted={
          selectedLesson
            ? completedLessonIds.includes(selectedLesson.lesson.id)
            : false
        }
        onToggleComplete={(lessonId) => {
          void handleToggleComplete(lessonId);
        }}
      />
      <div
        className="min-h-screen overflow-x-hidden bg-[#f4f1e9] lg:bg-[radial-gradient(1200px_420px_at_70%_-80px,rgba(196,154,82,0.14),transparent_70%),radial-gradient(900px_500px_at_0%_100%,rgba(36,106,89,0.07),transparent_70%)] dark:bg-[#071411]"
        data-timetable-no-print
      >
      <div className="mx-auto w-full max-w-[1440px] max-lg:overflow-hidden max-lg:p-0 lg:px-5 lg:py-4">
        {/* Mobile — full-bleed between header and tab bar */}
        <div className="flex h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] max-h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] w-full min-w-0 max-w-full flex-col overflow-hidden bg-white lg:hidden dark:bg-slate-950">
          {hasNoLessons ? (
            <div className="flex min-h-[50dvh] items-center justify-center px-4">
              {emptyLessons}
            </div>
          ) : unifiedTimetable ? (
            <>
              <div className="relative shrink-0 overflow-hidden bg-[#0a2620] px-4 pb-4 pt-3.5 text-white">
                <div
                  className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-[radial-gradient(circle_at_center,rgba(196,154,82,0.28),transparent_65%)]"
                  aria-hidden
                />
                <div className="relative">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-[#d9c49a]">
                    Teaching studio
                  </p>
                  <h1 className="mt-1 font-display text-[23px] leading-none tracking-[-0.03em] text-[#fbf8ef]">
                    My Teaching Timetable
                  </h1>
                  <p className="mt-1.5 text-[10px] text-white/55">
                    {core.formattedDate}
                    {selectedTerm?.name ? ` · ${selectedTerm.name}` : ""}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    <div className="rounded-xl border border-white/10 bg-white/[0.06] px-2.5 py-2">
                      <p className="text-[7.5px] font-semibold uppercase tracking-[0.14em] text-white/35">
                        Today
                      </p>
                      <p className="mt-0.5 font-display text-[17px] leading-none">
                        {isWeekend ? "—" : classesToday ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.06] px-2.5 py-2">
                      <p className="text-[7.5px] font-semibold uppercase tracking-[0.14em] text-white/35">
                        This week
                      </p>
                      <p className="mt-0.5 font-display text-[17px] leading-none">
                        {stats?.totalLessons ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#d9c49a]/20 bg-[#d9c49a]/10 px-2.5 py-2">
                      <p className="text-[7.5px] font-semibold uppercase tracking-[0.14em] text-[#d9c49a]/70">
                        Up next
                      </p>
                      <p className="mt-0.5 truncate text-[9.5px] font-semibold leading-tight text-[#f4e7c8]">
                        {core.nextLesson?.lesson.subject.name ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="min-h-0 flex-1">
                <TeacherMobileSchedule
                  days={unifiedTimetable.days}
                  timeSlots={core.sortedTimeSlots}
                  breaks={unifiedTimetable.breaks}
                  currentDayOfWeek={core.currentDayOfWeek}
                  currentPeriodIndex={core.currentPeriodIndex}
                  completedLessonIds={core.completedLessonIds}
                  nextLesson={core.nextLesson}
                  stats={stats}
                  classesToday={classesToday}
                  isWeekend={isWeekend}
                  onRefresh={() => refetch()}
                  onLessonClick={handleLessonClick}
                />
              </div>
            </>
          ) : null}
        </div>

        {/* Desktop */}
        <div className="hidden flex-col gap-3 lg:flex">
          <WeekHeroBar
            greeting={getGreeting(
              core.currentTime.getHours(),
              graphqlData?.teacherName,
            )}
            eyebrow={
              selectedTerm?.name
                ? `Teaching timetable · ${selectedTerm.name}`
                : "Teaching timetable"
            }
            subtitle={`${core.formattedDate} · Week of ${weekLayout.weekRangeLabel}`}
            metrics={[
              {
                label: "Today",
                value: isWeekend ? "—" : String(classesToday ?? 0),
              },
              { label: "This week", value: String(stats?.totalLessons ?? 0) },
              {
                label: "Contact",
                value: weekLayout.summary?.contactTimeLabel ?? "—",
              },
              {
                label: "Classes",
                value: String(weekLayout.summary?.distinctClasses ?? 0),
              },
            ]}
            totalLessons={stats?.totalLessons ?? 0}
            completedLessons={stats?.completedLessons ?? 0}
            completedLabel="Taught"
            actions={
              <>
                <RealtimeLiveIndicator showLabel={false} />
                {canPrint ? (
                  <WeekHeroButton
                    icon={Printer}
                    label="Print"
                    onClick={handlePrint}
                  />
                ) : null}
              </>
            }
          />
          <div className="grid grid-cols-[minmax(0,260px)_1fr] items-start gap-3 xl:grid-cols-[minmax(0,280px)_1fr]">
            <WeekSidebar
              viewType="teacher"
              nextLesson={core.nextLesson}
              currentStatus={core.currentStatus}
              formattedTime={core.formattedTime}
              stats={stats}
              dayDates={weekLayout.dayDates}
              lessonCounts={weekLayout.lessonCounts}
              currentDayOfWeek={core.currentDayOfWeek}
            />
            <div className="min-w-0">
              {hasNoLessons ? emptyLessons : scheduleGrid}
            </div>
          </div>
        </div>
      </div>
      </div>

      {canPrint && unifiedTimetable ? (
        <div className="hidden print:block" data-timetable-print-root>
          <div className="mb-4 border-b border-slate-200 pb-3">
            <h1 className="text-lg font-bold text-slate-900">
              {graphqlData?.teacherName ?? "My"} teaching schedule
            </h1>
            <p className="mt-0.5 text-sm text-slate-600">
              {selectedTerm?.name ? `${selectedTerm.name} · ` : ""}
              {core.formattedDate}
            </p>
          </div>
          <TimetableGrid
            days={unifiedTimetable.days}
            timeSlots={core.sortedTimeSlots}
            breaks={unifiedTimetable.breaks}
            viewType="teacher"
            compact
            currentDayOfWeek={core.currentDayOfWeek}
            currentPeriodIndex={core.currentPeriodIndex}
            completedLessonIds={core.completedLessonIds}
            className="rounded-none border border-slate-200 bg-white shadow-none"
          />
        </div>
      ) : null}
    </>
  );
};

export default TeacherTimetable;
