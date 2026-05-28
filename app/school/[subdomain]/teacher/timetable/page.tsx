"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Clock, RefreshCw, CalendarDays, Users, BookOpen } from "lucide-react";
import { useTeacherTimetable } from "../hooks/useTeacherTimetable";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Shared timetable library
import {
  useTimetableCore,
  transformTeacherTimetable,
  formatDuration,
  type CompleteTimetable,
  type TimetableStats,
} from "@/lib/timetable";

// Shared UI components
import {
  CurrentLessonBanner,
  TimetableGrid,
  NextLessonPreview,
} from "@/components/timetable";

// ─── Component ─────────────────────────────────────────────────

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

  // Completed lessons tracking
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  // Transform GraphQL data → unified format
  const unifiedTimetable = useMemo<CompleteTimetable | null>(() => {
    if (!graphqlData?.timeSlots || !graphqlData?.entries) return null;
    return transformTeacherTimetable(
      graphqlData.timeSlots,
      graphqlData.entries,
      selectedTerm?.id || "",
      selectedTerm?.name || "",
      completedLessonIds,
    );
  }, [graphqlData, selectedTerm?.id, selectedTerm?.name, completedLessonIds]);

  // Core timetable logic
  const core = useTimetableCore({
    viewType: "teacher",
    timetableData: unifiedTimetable,
    isLoading: loading,
    error: error || null,
    refetch,
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

  // ─── Loading State ──────────────────────────────────────────

  if (core.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Loading timetable...
          </p>
        </div>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────

  if (core.error) {
    const isNoTermError = core.error === "No term selected";
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div
            className={`mb-4 ${isNoTermError ? "text-amber-600" : "text-red-600"}`}
          >
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
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

  // ─── Main View ──────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container py-6 mx-auto max-w-7xl px-4 space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              My Teaching Schedule
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {core.formattedDate}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 items-center text-xs text-slate-500 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {selectedTerm?.name || "Current Term"}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-lg border border-primary/20">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold text-primary tabular-nums">
                {core.formattedTime}
              </span>
            </div>
          </div>
        </div>

        {/* ── Weekly Load Bar ── */}
        {stats && (
          <WeeklyLoadBar stats={stats} currentDay={core.currentDayOfWeek} />
        )}

        {/* ── Current Lesson Banner ── */}
        <CurrentLessonBanner
          status={core.currentStatus}
          formattedTime={core.formattedTime}
          viewType="teacher"
        />

        {/* ── Stats Row ── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickStat
              icon={<BookOpen className="w-4 h-4" />}
              label="Classes"
              value={stats.totalLessons}
            />
            <QuickStat
              icon={<Users className="w-4 h-4" />}
              label="Subjects"
              value={stats.totalSubjects}
            />
            <QuickStat
              icon={<Clock className="w-4 h-4" />}
              label="Completed"
              value={`${stats.completionPercentage}%`}
            />
            <QuickStat
              icon={<CalendarDays className="w-4 h-4" />}
              label="Today"
              value={stats.dayDistribution[core.currentDayName] || 0}
            />
          </div>
        )}

        {/* ── Next Lesson Preview ── */}
        <NextLessonPreview nextLesson={core.nextLesson} viewType="teacher" />

        {/* ── Timetable Grid ── */}
        {unifiedTimetable && (
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Weekly Schedule
            </h3>
            <TimetableGrid
              days={unifiedTimetable.days}
              timeSlots={core.sortedTimeSlots}
              viewType="teacher"
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

        {/* ── Refresh Button ── */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-xs">Refresh</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Weekly Load Bar ──────────────────────────────────────────

function WeeklyLoadBar({
  stats,
  currentDay,
}: {
  stats: TimetableStats;
  currentDay: number | null;
}) {
  const maxLessons = Math.max(...Object.values(stats.dayDistribution), 1);

  const dayLabels: Record<number, string> = {
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">
        Weekly Teaching Load
      </p>
      <div className="flex items-end gap-2 h-16">
        {[1, 2, 3, 4, 5].map((day) => {
          const count = stats.dayDistribution[dayLabels[day]] || 0;
          const height = maxLessons > 0 ? (count / maxLessons) * 100 : 0;
          const isToday = currentDay === day;

          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {count}
              </span>
              <div
                className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-sm relative"
                style={{ height: "48px" }}
              >
                <div
                  className={`absolute bottom-0 w-full rounded-t-sm transition-all duration-500 ${
                    isToday ? "bg-primary" : "bg-primary/40 dark:bg-primary/30"
                  }`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
              </div>
              <span
                className={`text-[10px] font-medium uppercase ${
                  isToday
                    ? "text-primary font-bold"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {dayLabels[day]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Quick Stat ───────────────────────────────────────────────

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex items-center gap-3">
      <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {value}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export default TeacherTimetable;
