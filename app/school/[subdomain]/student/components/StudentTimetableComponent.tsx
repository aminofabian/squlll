"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCurrentStudent } from "@/lib/hooks/useCurrentStudent";
import { useStudentTimetable } from "@/lib/hooks/useStudentTimetable";
import { useActiveTerm } from "@/lib/hooks/useActiveTerm";

import {
  useTimetableCore,
  transformStudentTimetable,
  type CompleteTimetable,
  type TimetableStats,
  type TimetableLesson,
} from "@/lib/timetable";

import {
  CurrentLessonBanner,
  TimetableGrid,
  NextLessonPreview,
} from "@/components/timetable";
import { StudentTimetableSkeleton } from "./StudentTimetableSkeleton";
import { StudentMobileSchedule } from "./StudentMobileSchedule";
import {
  StudentLessonDetailSheet,
  type StudentLessonSelection,
} from "./StudentLessonDetailSheet";

interface StudentTimetableComponentProps {
  onBack: () => void;
  /** `page` = sidebar route; `embedded` = dashboard inline view */
  layout?: "embedded" | "page";
}

const STAT_ACCENTS = {
  primary: "bg-primary/10 text-primary dark:bg-primary/20",
  emerald: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  amber: "bg-amber-500/10 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  violet: "bg-violet-500/10 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
} as const;

function PageShell({
  layout,
  children,
}: {
  layout: "embedded" | "page";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-x-clip",
        layout === "page"
          ? cn(
              "mb-0 w-full min-w-0 max-w-full",
              "min-h-0 max-lg:overflow-hidden lg:min-h-[calc(100dvh-4rem)]",
              "max-lg:bg-white max-lg:dark:bg-slate-950",
              "lg:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] lg:from-primary/[0.06] lg:via-slate-50 lg:to-white",
              "dark:lg:from-primary/10 dark:lg:via-slate-900 dark:lg:to-slate-950",
            )
          : cn(
              "min-h-[60vh] w-full min-w-0 max-w-full",
              "bg-[#f2f2f7] lg:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] lg:from-primary/[0.06] lg:via-slate-50 lg:to-white",
              "dark:lg:from-primary/10 dark:lg:via-slate-900 dark:lg:to-slate-950",
            ),
      )}
    >
      <div
        className={cn(
          "mx-auto w-full min-w-0 max-w-7xl",
          layout === "page"
            ? "max-lg:overflow-hidden max-lg:p-0 lg:px-6 lg:py-5"
            : "px-4 py-4 lg:px-6",
        )}
      >
        {children}
      </div>
    </div>
  );
}

const StudentTimetableComponent = ({
  onBack,
  layout = "embedded",
}: StudentTimetableComponentProps) => {
  const isPage = layout === "page";

  const {
    student,
    loading: studentLoading,
    error: studentError,
  } = useCurrentStudent();
  const {
    activeTerm,
    loading: termLoading,
    error: termError,
  } = useActiveTerm();
  const {
    timetable: rawTimetable,
    loading: timetableLoading,
    error: timetableError,
    refetch: refetchTimetable,
  } = useStudentTimetable(
    activeTerm?.id || null,
    student?.gradeId || null,
    student?.tenantStreamId || null,
    student?.streamName || null,
  );

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] =
    useState<StudentLessonSelection | null>(null);

  const handleLessonClick = (
    lesson: TimetableLesson,
    dayOfWeek: number,
    periodNumber: number,
  ) => {
    setSelectedLesson({ lesson, dayOfWeek, periodNumber });
  };

  const unifiedTimetable = useMemo<CompleteTimetable | null>(() => {
    if (!rawTimetable) return null;
    return transformStudentTimetable(
      rawTimetable,
      activeTerm?.id || "",
      activeTerm?.name || "",
      completedLessonIds,
    );
  }, [rawTimetable, activeTerm?.id, activeTerm?.name, completedLessonIds]);

  const core = useTimetableCore({
    viewType: "student",
    timetableData: unifiedTimetable,
    isLoading: studentLoading || termLoading || timetableLoading,
    error: studentError || termError || timetableError || null,
    refetch: refetchTimetable,
    completedLessonIds,
    onToggleComplete: (lessonId) => {
      setCompletedLessonIds((prev) =>
        prev.includes(lessonId)
          ? prev.filter((id) => id !== lessonId)
          : [...prev, lessonId],
      );
    },
  });

  const stats = unifiedTimetable?.stats as TimetableStats | undefined;
  const gradeName =
    typeof student?.grade === "string"
      ? student.grade
      : student?.grade?.name || rawTimetable?.gradeName || "Your Grade";

  if (core.isLoading) {
    return <StudentTimetableSkeleton onBack={onBack} layout={layout} />;
  }

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      onClick={onBack}
      className="shrink-0 p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );

  if (core.error) {
    return (
      <PageShell layout={layout}>
        {!isPage && (
          <div className="mb-4 border-b border-slate-200/80 pb-4 dark:border-slate-700">
            {backButton}
          </div>
        )}
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200">
                  Error loading timetable
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {core.error}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-1.5"
                  onClick={() => refetchTimetable()}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  if (!student || !student.gradeId) {
    return (
      <PageShell layout={layout}>
        {!isPage && (
          <div className="mb-4 border-b border-slate-200/80 pb-4 dark:border-slate-700">
            {backButton}
          </div>
        )}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                  No grade assigned
                </h3>
                <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                  Please contact your administrator to assign a grade to your
                  account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  const scheduleGridHeader = (
    <div className="border-b border-slate-100 px-2 py-1.5 dark:border-slate-700/80">
      <NextLessonPreview
        nextLesson={core.nextLesson}
        viewType="student"
        minimal
        className="border-0 bg-transparent px-0 py-0 shadow-none dark:bg-transparent"
      />
    </div>
  );

  const scheduleGrid = unifiedTimetable ? (
    <section
      className={cn(
        "w-full min-w-0 max-w-full overflow-hidden rounded border border-slate-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-800/95",
        "lg:shadow-sm",
        "min-h-[320px] lg:min-h-0",
      )}
    >
      {scheduleGridHeader}
      <TimetableGrid
        days={unifiedTimetable.days}
        timeSlots={core.sortedTimeSlots}
        breaks={unifiedTimetable.breaks}
        viewType="student"
        compact
        className="rounded-none border-0 bg-transparent ring-0 shadow-none"
        currentDayOfWeek={core.currentDayOfWeek}
        currentPeriodIndex={core.currentPeriodIndex}
        completedLessonIds={core.completedLessonIds}
        nextLessonId={core.nextLesson?.lesson.id ?? null}
        onLessonClick={handleLessonClick}
      />
    </section>
  ) : (
    <Card className="border-dashed border-slate-300 dark:border-slate-700">
      <CardContent className="flex items-start gap-3 p-6">
        <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            No schedule template yet
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {student?.streamName
              ? `No timetable or period template is set up for ${gradeName} · ${student.streamName} this term.`
              : `No timetable or period template is set up for ${gradeName} this term.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const statsBlock =
    stats && stats.totalLessons > 0 ? (
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={<Calendar className="h-4 w-4" />}
          label="Total lessons"
          value={stats.totalLessons}
          accent="primary"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Completed"
          value={`${stats.completedLessons}/${stats.totalLessons}`}
          sub={`${stats.completionPercentage}%`}
          accent="emerald"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Upcoming"
          value={stats.upcomingLessons}
          accent="amber"
        />
        <StatCard
          icon={<BookOpen className="h-4 w-4" />}
          label="Subjects"
          value={stats.totalSubjects}
          accent="violet"
        />
      </div>
    ) : null;

  const sidebarBlock = (
    <div className="space-y-3">
      <CurrentLessonBanner
        status={core.currentStatus}
        formattedTime={core.formattedTime}
        viewType="student"
        showClock={false}
      />
      {statsBlock}
    </div>
  );

  return (
    <PageShell layout={layout}>
      <StudentLessonDetailSheet
        selection={selectedLesson}
        timeSlots={core.sortedTimeSlots}
        open={selectedLesson != null}
        onOpenChange={(open) => {
          if (!open) setSelectedLesson(null);
        }}
        isCompleted={
          selectedLesson
            ? core.completedLessonIds.includes(selectedLesson.lesson.id)
            : false
        }
        onToggleComplete={core.toggleLessonComplete}
      />
      {isPage ? (
        <>
          {/* Mobile — timetable fills viewport between header and tab bar */}
          <div className="flex h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] max-h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] w-full min-w-0 max-w-full flex-col overflow-hidden bg-white lg:hidden dark:bg-slate-950">
            {unifiedTimetable ? (
              <StudentMobileSchedule
                days={unifiedTimetable.days}
                timeSlots={core.sortedTimeSlots}
                breaks={unifiedTimetable.breaks}
                currentDayOfWeek={core.currentDayOfWeek}
                currentPeriodIndex={core.currentPeriodIndex}
                completedLessonIds={core.completedLessonIds}
                nextLesson={core.nextLesson}
                nextLessonLoading={core.isLoading}
                stats={stats}
                onRefresh={() => refetchTimetable()}
                onLessonClick={handleLessonClick}
              />
            ) : (
              scheduleGrid
            )}
          </div>

          {/* Desktop */}
          <div className="hidden lg:block">
            <div className="mb-3 flex items-center justify-end gap-2">
              {activeTerm ? (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activeTerm.name}
                </span>
              ) : null}
              <Button
                onClick={() => refetchTimetable()}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="text-xs">Refresh</span>
              </Button>
            </div>
            <div className="grid grid-cols-[minmax(0,300px)_1fr] items-start gap-4 xl:grid-cols-[minmax(0,340px)_1fr]">
              <div className="sticky top-4 z-0">{sidebarBlock}</div>
              <div className="min-w-0">{scheduleGrid}</div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-700">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {backButton}
              <div className="min-w-0 flex-1 lg:max-w-sm">
                <NextLessonPreview
                  nextLesson={core.nextLesson}
                  viewType="student"
                  minimal
                  className="lg:hidden"
                />
                <p className="hidden truncate text-sm text-slate-600 dark:text-slate-400 lg:block">
                  {gradeName}
                  {student?.streamName ? ` · ${student.streamName}` : ""}
                  {" · "}
                  {core.formattedDate}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTerm ? (
                <span className="hidden text-xs text-slate-500 sm:inline dark:text-slate-400">
                  {activeTerm.name}
                </span>
              ) : null}
              <Button
                onClick={() => refetchTimetable()}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="text-xs">Refresh</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4 lg:hidden">
            {scheduleGrid}
            <CurrentLessonBanner
              status={core.currentStatus}
              formattedTime={core.formattedTime}
              viewType="student"
            />
            {statsBlock}
          </div>

          <div className="hidden grid-cols-[minmax(0,300px)_1fr] items-start gap-4 xl:grid-cols-[minmax(0,340px)_1fr] lg:grid">
            <div className="sticky top-4 space-y-3">{sidebarBlock}</div>
            <div className="min-w-0">{scheduleGrid}</div>
          </div>
        </>
      )}
    </PageShell>
  );
};

function StatCard({
  icon,
  label,
  value,
  sub,
  accent = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: keyof typeof STAT_ACCENTS;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-2.5 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
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
        {sub && (
          <p className="mt-0.5 text-[9px] text-slate-400 dark:text-slate-500">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export default StudentTimetableComponent;
