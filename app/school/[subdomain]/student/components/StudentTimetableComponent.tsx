"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Timer,
  Clock,
  Users,
  MapPin,
  BookOpen,
  Calendar,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrentStudent } from "@/lib/hooks/useCurrentStudent";
import { useStudentTimetable } from "@/lib/hooks/useStudentTimetable";
import { useActiveTerm } from "@/lib/hooks/useActiveTerm";

// Shared timetable library
import {
  useTimetableCore,
  transformStudentTimetable,
  type CompleteTimetable,
  type TimetableLesson,
  type TimetableStats,
} from "@/lib/timetable";

// Shared UI components
import {
  CurrentLessonBanner,
  TimetableGrid,
  NextLessonPreview,
} from "@/components/timetable";

// ─── Props ─────────────────────────────────────────────────────

interface StudentTimetableComponentProps {
  onBack: () => void;
}

// ─── Component ─────────────────────────────────────────────────

const StudentTimetableComponent = ({
  onBack,
}: StudentTimetableComponentProps) => {
  // Data hooks
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
  } = useStudentTimetable(activeTerm?.id || null, student?.gradeId || null);

  // Completed lessons tracking
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  // Transform GraphQL data → unified format
  const unifiedTimetable = useMemo<CompleteTimetable | null>(() => {
    if (!rawTimetable) return null;
    return transformStudentTimetable(
      rawTimetable,
      activeTerm?.id || "",
      activeTerm?.name || "",
      completedLessonIds,
    );
  }, [rawTimetable, activeTerm?.id, activeTerm?.name, completedLessonIds]);

  // Core timetable logic (current time, period, status, next lesson, etc.)
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

  // Stats from unified data
  const stats = unifiedTimetable?.stats as TimetableStats | undefined;

  // Grade name display
  const gradeName =
    typeof student?.grade === "string"
      ? student.grade
      : student?.grade?.name || rawTimetable?.gradeName || "Your Grade";

  // ─── Loading State ──────────────────────────────────────────

  if (core.isLoading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading timetable...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────

  if (core.error) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200">
                  Error Loading Timetable
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {core.error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── No Grade State ─────────────────────────────────────────

  if (!student || !student.gradeId) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
                  No Grade Assigned
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Please contact your administrator to assign a grade to your
                  account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Main View ──────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-5">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              My Timetable
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {gradeName} • {core.formattedDate}
            </p>
          </div>
        </div>

        {/* Sync button & term badge */}
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Synced
          </Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {activeTerm ? `Term: ${activeTerm.name}` : "No term"}
          </span>
          <Button
            onClick={() => refetchTimetable()}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-xs">Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── Current Lesson Banner (always visible) ── */}
      <CurrentLessonBanner
        status={core.currentStatus}
        formattedTime={core.formattedTime}
        viewType="student"
      />

      {/* ── Stats & Next Lesson Row ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<Calendar className="w-4 h-4" />}
            label="Total Lessons"
            value={stats.totalLessons}
          />
          <StatCard
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Completed"
            value={`${stats.completedLessons}/${stats.totalLessons}`}
            sub={`${stats.completionPercentage}%`}
          />
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Upcoming"
            value={stats.upcomingLessons}
          />
          <StatCard
            icon={<BookOpen className="w-4 h-4" />}
            label="Subjects"
            value={stats.totalSubjects}
          />
        </div>
      )}

      {/* ── Next Lesson Preview (always visible) ── */}
      <NextLessonPreview nextLesson={core.nextLesson} viewType="student" />

      {/* ── Weekly Timetable Grid ── */}
      {unifiedTimetable && (
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Weekly Schedule
          </h3>
          <TimetableGrid
            days={unifiedTimetable.days}
            timeSlots={core.sortedTimeSlots}
            viewType="student"
            currentDayOfWeek={core.currentDayOfWeek}
            currentPeriodIndex={core.currentPeriodIndex}
            completedLessonIds={core.completedLessonIds}
            nextLessonId={core.nextLesson?.lesson.id ?? null}
            onLessonClick={(lesson) => {
              core.toggleLessonComplete(lesson.id);
            }}
          />
        </div>
      )}
    </div>
  );
};

// ─── Stat Card Sub-component ──────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 flex items-center gap-3">
      <div className="p-2 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
          {value}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        {sub && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500">{sub}</p>
        )}
      </div>
    </div>
  );
}

export default StudentTimetableComponent;
