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
import {
  EmptyState,
  Section,
  StateMessage,
  StatTile,
} from "../_ui";

interface StudentTimetableComponentProps {
  onBack: () => void;
  /** `page` = sidebar route; `embedded` = dashboard inline view */
  layout?: "embedded" | "page";
}

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
        "overflow-x-clip bg-gradient-to-b from-primary/[0.04] via-background to-background",
        layout === "page"
          ? cn(
              "mb-0 w-full min-w-0 max-w-full",
              "min-h-0 max-lg:overflow-hidden lg:min-h-[calc(100dvh-4rem)]",
            )
          : "min-h-[60vh] w-full min-w-0 max-w-full",
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
      aria-label="Back"
      className="-ml-2 shrink-0 gap-1.5 px-2 text-muted-foreground hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );

  const embeddedBackHeader = !isPage ? (
    <div className="mb-4 border-b border-border pb-4">{backButton}</div>
  ) : null;

  if (core.error) {
    return (
      <PageShell layout={layout}>
        {embeddedBackHeader}
        <Section padded={false}>
          <StateMessage
            variant="error"
            title="Error loading timetable"
            description={core.error}
            onRetry={() => refetchTimetable()}
          />
        </Section>
      </PageShell>
    );
  }

  if (!student || !student.gradeId) {
    return (
      <PageShell layout={layout}>
        {embeddedBackHeader}
        <Section padded={false}>
          <EmptyState
            icon={AlertCircle}
            title="No grade assigned"
            description="Please contact your administrator to assign a grade to your account."
          />
        </Section>
      </PageShell>
    );
  }

  const scheduleGridHeader = (
    <div className="border-b border-border px-2 py-1.5">
      <NextLessonPreview
        nextLesson={core.nextLesson}
        viewType="student"
        minimal
        className="border-0 bg-transparent px-0 py-0 shadow-none"
      />
    </div>
  );

  const scheduleGrid = unifiedTimetable ? (
    <section
      className={cn(
        "w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-border bg-card",
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
    <Section padded={false}>
      <EmptyState
        icon={Calendar}
        title="No schedule template yet"
        description={
          student?.streamName
            ? `No timetable or period template is set up for ${gradeName} · ${student.streamName} this term.`
            : `No timetable or period template is set up for ${gradeName} this term.`
        }
      />
    </Section>
  );

  const statsBlock =
    stats && stats.totalLessons > 0 ? (
      <div className="grid grid-cols-2 gap-3">
        <StatTile
          icon={Calendar}
          label="Total lessons"
          value={stats.totalLessons}
        />
        <StatTile
          icon={CheckCircle2}
          label="Completed"
          value={`${stats.completedLessons}/${stats.totalLessons}`}
          hint={`${stats.completionPercentage}%`}
        />
        <StatTile icon={Clock} label="Upcoming" value={stats.upcomingLessons} />
        <StatTile icon={BookOpen} label="Subjects" value={stats.totalSubjects} />
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
          <div className="flex h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] max-h-[calc(100dvh-3.25rem-4.75rem-env(safe-area-inset-bottom))] w-full min-w-0 max-w-full flex-col overflow-hidden bg-background lg:hidden">
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
                <span className="text-xs text-muted-foreground">
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {backButton}
              <div className="min-w-0 flex-1 lg:max-w-sm">
                <NextLessonPreview
                  nextLesson={core.nextLesson}
                  viewType="student"
                  minimal
                  className="lg:hidden"
                />
                <p className="hidden truncate text-sm text-muted-foreground lg:block">
                  {gradeName}
                  {student?.streamName ? ` · ${student.streamName}` : ""}
                  {" · "}
                  {core.formattedDate}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTerm ? (
                <span className="hidden text-xs text-muted-foreground sm:inline">
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

export default StudentTimetableComponent;
