"use client";

import React, { useState, useMemo } from "react";
import {
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

import { WeekMobileView } from "@/components/timetable/week/WeekMobileView";
import { WeekIconButton } from "@/components/timetable/week/WeekIconButton";
import { StudentTimetableSkeleton } from "./StudentTimetableSkeleton";
import { StudentWeekDesktopView } from "./StudentWeekDesktopView";
import {
  StudentLessonDetailSheet,
  type StudentLessonSelection,
} from "./StudentLessonDetailSheet";
import {
  EmptyState,
  Section,
  StateMessage,
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
        "overflow-x-clip bg-[#eef0eb] dark:bg-[#0a110e]",
        layout === "page"
          ? cn(
              "mb-0 w-full min-w-0 max-w-full",
              "min-h-[calc(100dvh-4rem)]",
            )
          : "min-h-[60vh] w-full min-w-0 max-w-full",
      )}
    >
      <div
        className={cn(
          "mx-auto w-full min-w-0 max-w-[1440px]",
          layout === "page"
            ? "max-lg:p-0 lg:px-5 lg:py-4"
            : "px-4 py-4 lg:px-5",
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

  const emptySchedule = (
    <Section padded={false}>
      <EmptyState
        icon={Calendar}
        title="No lessons on your timetable yet"
        description={
          student?.streamName
            ? `Your school has not added lessons for ${gradeName} · ${student.streamName} this term yet. Check back later.`
            : `Your school has not added lessons for ${gradeName} this term yet. Check back later.`
        }
      />
    </Section>
  );

  const desktopView = (
    <StudentWeekDesktopView
      timetable={unifiedTimetable}
      core={core}
      studentName={student.name}
      classLabel={[gradeName, student.streamName].filter(Boolean).join(" · ")}
      termName={activeTerm?.name}
      emptyState={emptySchedule}
      onRefresh={() => refetchTimetable()}
      onLessonClick={handleLessonClick}
    />
  );

  const mobileView = (
    <WeekMobileView
      viewType="student"
      timetable={unifiedTimetable}
      core={core}
      personName={student.name}
      eyebrow={[gradeName, student.streamName, activeTerm?.name].filter(Boolean).join(" · ")}
      actions={
        <WeekIconButton
          icon={RefreshCw}
          label="Refresh timetable"
          onClick={() => void refetchTimetable()}
        />
      }
      emptyState={emptySchedule}
      showEmptyState={(stats?.totalLessons ?? 0) === 0}
      onLessonClick={handleLessonClick}
    />
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
          <div className="lg:hidden">{mobileView}</div>

          <div className="hidden lg:block">{desktopView}</div>
        </>
      ) : (
        <>
          <div className="-mx-4 -mt-4 lg:hidden">
            <div className="px-4 pt-3">{backButton}</div>
            {mobileView}
          </div>

          <div className="hidden lg:block">
            <div className="mb-2">{backButton}</div>
            {desktopView}
          </div>
        </>
      )}
    </PageShell>
  );
};

export default StudentTimetableComponent;
