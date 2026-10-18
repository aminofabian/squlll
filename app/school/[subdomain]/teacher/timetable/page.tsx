"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTeacherTimetable } from "../hooks/useTeacherTimetable";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { BookOpen, Printer, RefreshCw } from "lucide-react";

import {
  useTimetableCore,
  transformTeacherTimetable,
  transformTeacherTimetableMerged,
  type CompleteTimetable,
  type TimetableLesson,
} from "@/lib/timetable";

import {
  TimetableGrid,
  TimetablePrintStyles,
} from "@/components/timetable";
import { WeekDesktopView } from "@/components/timetable/week/WeekDesktopView";
import { WeekMobileView } from "@/components/timetable/week/WeekMobileView";
import { WeekIconButton } from "@/components/timetable/week/WeekIconButton";
import { WeekHeroButton } from "@/components/timetable/week/WeekHeroButton";
import { RealtimeLiveIndicator } from "@/lib/realtime/RealtimeLiveIndicator";
import { TeacherTimetableSkeleton } from "./components/TeacherTimetableSkeleton";
import {
  TeacherLessonDetailSheet,
  type TeacherLessonSelection,
} from "./components/TeacherLessonDetailSheet";
import { LessonSwapDialog } from "./components/LessonSwapDialog";
import { LessonSwapInbox } from "@/components/timetable/LessonSwapInbox";
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
  const [swapSelection, setSwapSelection] =
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

  const emptyLessons = (
    <div className="rounded-xl border border-[#e3e7e1] bg-white px-6 py-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#111a17] text-white">
        <BookOpen className="h-5 w-5" />
      </div>
      <p className="mt-4 text-[18px] font-bold text-[#111a16] dark:text-white">
        No lessons for {selectedTerm?.name || "this term"}
      </p>
      <p className="mx-auto mt-1.5 max-w-md text-[12.5px] leading-relaxed text-[#4a5751] dark:text-white/65">
        Ask your administrator to add you to the school timetable, or check that
        the correct term is selected.
      </p>
    </div>
  );

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
        onRequestSwap={(selection) => {
          setSelectedLesson(null);
          setSwapSelection(selection);
        }}
      />
      <LessonSwapDialog
        lesson={swapSelection?.lesson ?? null}
        slot={core.sortedTimeSlots.find(
          (slot) => slot.periodNumber === swapSelection?.periodNumber,
        )}
        open={swapSelection != null}
        onOpenChange={(open) => {
          if (!open) setSwapSelection(null);
        }}
        onCreated={() => void refetch()}
      />
      <div
        className="min-h-screen overflow-x-hidden bg-[#eef0eb] dark:bg-[#0a110e]"
        data-timetable-no-print
      >
      <div className="mx-auto w-full max-w-[1440px] lg:px-6 lg:py-5">
        <div className="lg:hidden">
          <WeekMobileView
            viewType="teacher"
            timetable={unifiedTimetable}
            core={core}
            personName={graphqlData?.teacherName}
            eyebrow={
              selectedTerm?.name
                ? `Teaching timetable · ${selectedTerm.name}`
                : "Teaching timetable"
            }
            actions={
              <>
                <RealtimeLiveIndicator showLabel={false} />
                <WeekIconButton
                  icon={RefreshCw}
                  label="Refresh timetable"
                  onClick={() => void refetch()}
                />
              </>
            }
            extra={<LessonSwapInbox />}
            emptyState={emptyLessons}
            showEmptyState={hasNoLessons}
            onLessonClick={handleLessonClick}
          />
        </div>

        {/* Desktop */}
        <div className="hidden lg:block">
          <WeekDesktopView
            viewType="teacher"
            timetable={unifiedTimetable}
            core={core}
            personName={graphqlData?.teacherName}
            eyebrow={
              selectedTerm?.name
                ? `Teaching timetable · ${selectedTerm.name}`
                : "Teaching timetable"
            }
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
            emptyState={emptyLessons}
            showEmptyState={hasNoLessons}
            onLessonClick={handleLessonClick}
          />
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
