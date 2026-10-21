"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  fetchLessonPlanForPeriod,
  startLessonPlan,
  type LessonPlan,
} from "@/lib/lesson-planning/api";

function lessonDateForDay(dayOfWeek: number): string {
  const weekStart = getWeekStartDate();
  const [year, month, day] = weekStart.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  date.setUTCDate(date.getUTCDate() + (dayOfWeek - 1));
  return date.toISOString().slice(0, 10);
}

const TeacherTimetable = () => {
  const params = useParams();
  const router = useRouter();
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
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planPreparing, setPlanPreparing] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const termId = selectedTerm?.id;

  useEffect(() => {
    if (!subdomain || !termId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Load the plan (if any) for the period the teacher opened, so the sheet can
  // offer "View plan" instead of "Create plan".
  useEffect(() => {
    if (!selectedLesson || !subdomain || !termId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLessonPlan(null);
      setPlanError(null);
      setPlanLoading(false);
      return;
    }

    let cancelled = false;
    setPlanLoading(true);
    setPlanError(null);
    setLessonPlan(null);

    void fetchLessonPlanForPeriod(
      subdomain,
      selectedLesson.lesson.id,
      lessonDateForDay(selectedLesson.dayOfWeek),
    )
      .then((plan) => {
        if (!cancelled) setLessonPlan(plan);
      })
      .catch((err) => {
        if (cancelled) return;
        setLessonPlan(null);
        setPlanError(
          err instanceof Error ? err.message : "Could not check the lesson plan",
        );
      })
      .finally(() => {
        if (!cancelled) setPlanLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedLesson, subdomain, termId]);

  const handleOpenPlan = useCallback(
    (plan: LessonPlan) => {
      setSelectedLesson(null);
      router.push(`/teacher/lesson-plans/${plan.id}`);
    },
    [router],
  );

  const handleCreatePlan = useCallback(
    async (selection: TeacherLessonSelection) => {
      if (!subdomain || !termId) return;
      setPlanPreparing(true);
      setPlanError(null);
      try {
        const plan = await startLessonPlan(subdomain, {
          timetableEntryId: selection.lesson.id,
          termId,
          date: lessonDateForDay(selection.dayOfWeek),
        });
        setSelectedLesson(null);
        router.push(`/teacher/lesson-plans/${plan.id}`);
      } catch (err) {
        setPlanError(
          err instanceof Error
            ? err.message
            : "Could not prepare the lesson plan",
        );
      } finally {
        setPlanPreparing(false);
      }
    },
    [subdomain, termId, router],
  );

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
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-5">
        <div className="tp-reveal w-full rounded-2xl border border-border/90 bg-card px-6 py-12 text-center shadow-[0_1px_2px_rgba(20,32,28,0.04)]">
          <span className="mx-auto flex size-11 items-center justify-center rounded-full border border-border/80 bg-muted/50 text-muted-foreground">
            <BookOpen className="size-5" strokeWidth={1.6} />
          </span>
          <h2 className="mt-4 font-display text-[1.5rem] leading-tight text-foreground">
            {isNoTermError ? "No term selected" : "Timetable didn't load"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            {isNoTermError
              ? "Pick a term from the selector to see your teaching week."
              : core.error}
          </p>
          {!isNoTermError && (
            <button
              type="button"
              onClick={() => refetch()}
              className="tp-focus mt-5 inline-flex h-9 items-center rounded-full border border-border/80 px-4 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-muted/50"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  const emptyLessons = (
    <div className="rounded-2xl border border-border/80 bg-card px-6 py-12 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-full border border-border/80 bg-muted/50 text-muted-foreground">
        <BookOpen className="size-5" strokeWidth={1.6} />
      </div>
      <p className="mt-4 font-display text-[1.45rem] leading-tight text-foreground">
        No lessons for {selectedTerm?.name || "this term"}
      </p>
      <p className="mx-auto mt-2 max-w-md text-[12.5px] leading-relaxed text-muted-foreground">
        Ask your administrator to add you to the school timetable, or check that the
        correct term is selected.
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
        lessonPlan={lessonPlan}
        planLoading={planLoading}
        planPreparing={planPreparing}
        planError={planError}
        onOpenPlan={handleOpenPlan}
        onCreatePlan={(selection) => {
          void handleCreatePlan(selection);
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
      <div className="overflow-x-hidden" data-timetable-no-print>
      <div className="mx-auto w-full max-w-[1440px]">
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
            className="rounded-md border border-slate-200 bg-white shadow-none"
          />
        </div>
      ) : null}
    </>
  );
};

export default TeacherTimetable;
