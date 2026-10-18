"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTeacherTimetable } from "../hooks/useTeacherTimetable";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { BookOpen } from "lucide-react";

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
import {
  TeacherTimetableHero,
  StatusNote,
} from "./components/TeacherTimetableHero";
import { TeacherTimetableSidebar } from "./components/TeacherTimetableSidebar";
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

  const stats = unifiedTimetable?.stats as TimetableStats | undefined;
  const isWeekend = core.currentDayOfWeek === null;
  const showLiveBanner =
    core.currentStatus.status === "lesson" ||
    core.currentStatus.status === "break" ||
    core.currentStatus.status === "free";

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
    <div className="relative overflow-hidden rounded-[24px] border border-[#1a4d42]/10 bg-[#fbfaf6] px-6 py-14 text-center dark:border-white/10 dark:bg-white/[0.03]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#c49a52]/10 blur-3xl" aria-hidden />
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0a2620] text-[#d9c49a]">
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
      <>
        {/* Mobile: floating schedule shell */}
        <section className="overflow-hidden rounded-[24px] bg-white shadow-[0_2px_0_rgba(10,38,32,0.03),0_28px_70px_-48px_rgba(10,38,32,0.45)] ring-1 ring-[#1a4d42]/10 dark:bg-[#0c1a17] dark:ring-white/10 lg:rounded-[24px]">
          <div className="hidden items-center justify-between gap-3 border-b border-[#1a4d42]/8 bg-[#fbfaf6] px-5 py-4 dark:border-white/8 dark:bg-white/[0.025] lg:flex">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#1a4d42]/40 dark:text-white/35">
                Term schedule
              </p>
              <h2 className="mt-0.5 font-display text-[20px] tracking-[-0.02em] text-[#0a1f1a] dark:text-white">
                Your week at a glance
              </h2>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-medium text-[#1a4d42]/50 dark:text-white/40">
              <span className="hidden items-center gap-1.5 xl:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c49a52]" />
                {stats?.totalLessons ?? 0} lessons
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#246a59]" />
                Today
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700">
                  <span className="h-1 w-1 rounded-full bg-emerald-600" />
                </span>
                Taught
              </span>
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
            onLessonClick={handleLessonClick}
          />
        </section>
      </>
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
        className="min-h-screen overflow-x-hidden bg-[#f4f1e9] dark:bg-[#071411]"
        data-timetable-no-print
      >
      <div className="mx-auto w-full max-w-[1380px] max-lg:overflow-hidden max-lg:p-0 lg:px-7 lg:py-6">
        {/* Mobile — full-bleed between header and tab bar */}
        <div className="flex h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] max-h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] w-full min-w-0 max-w-full flex-col overflow-hidden bg-white lg:hidden dark:bg-slate-950">
          {hasNoLessons ? (
            <div className="flex min-h-[50dvh] items-center justify-center px-4">
              {emptyLessons}
            </div>
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
              classesToday={classesToday}
              isWeekend={isWeekend}
              onRefresh={() => refetch()}
              onLessonClick={handleLessonClick}
            />
          ) : null}
        </div>

        {/* Desktop */}
        <div className="hidden flex-col gap-5 lg:flex">
          <TeacherTimetableHero
            formattedDate={core.formattedDate}
            termName={selectedTerm?.name}
            teacherName={graphqlData?.teacherName}
            classesToday={isWeekend ? null : classesToday}
            totalClasses={stats?.totalLessons ?? 0}
            totalSubjects={stats?.totalSubjects ?? 0}
            nextLessonLabel={core.nextLesson?.lesson.subject.name}
            nextLessonTime={core.nextLesson?.time}
            showPrint={canPrint}
            onPrint={handlePrint}
          />
          {core.currentStatus.status === "outside" && !isWeekend && (
            <StatusNote>
              Outside school hours — your next class is in Up Next below.
            </StatusNote>
          )}
          <div className="grid grid-cols-[minmax(0,286px)_1fr] items-start gap-5 xl:grid-cols-[minmax(0,304px)_1fr]">
            <TeacherTimetableSidebar
              nextLesson={core.nextLesson}
              currentStatus={core.currentStatus}
              formattedTime={core.formattedTime}
              showLiveBanner={showLiveBanner}
              stats={stats}
              currentDayOfWeek={core.currentDayOfWeek}
              classesToday={classesToday}
              isWeekend={isWeekend}
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
