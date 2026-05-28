/**
 * useTimetableCore
 *
 * Shared hook that provides timetable data, current-status tracking,
 * and derived values for any timetable view (student, teacher, admin).
 *
 * Uses polling to keep the current-time display fresh and provides
 * memoized derived values for performance.
 */

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type {
  CompleteTimetable,
  CurrentLessonStatus,
  NextLessonInfo,
  TimetableSlot,
  TimetableDay,
  TimetableLesson,
  TimetableViewType,
} from './types';
import {
  getCurrentLessonStatus,
  getNextLesson,
  getCurrentDayOfWeek,
  formatCurrentTime,
  formatFullDate,
  getCurrentPeriodIndex,
  CURRENT_TIME_REFRESH_MS,
  getSubjectPaletteColor,
} from './index';

export interface UseTimetableCoreOptions {
  /** Which perspective is this view for? */
  viewType: TimetableViewType;
  /** The complete timetable data (from GraphQL or store) */
  timetableData: CompleteTimetable | null;
  /** Is the timetable currently loading? */
  isLoading: boolean;
  /** Any error from fetching */
  error: string | null;
  /** Refetch function */
  refetch: () => void;
  /** List of completed lesson IDs (for marking progress) */
  completedLessonIds?: string[];
  /** Callback when a lesson is toggled complete/incomplete */
  onToggleComplete?: (lessonId: string) => void;
}

export interface UseTimetableCoreResult {
  // Data
  timetable: CompleteTimetable | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;

  // Time
  currentTime: Date;
  formattedTime: string;
  formattedDate: string;

  // Day
  currentDayOfWeek: number | null;
  currentDayName: string;
  currentDayData: TimetableDay | null;

  // Current lesson
  currentStatus: CurrentLessonStatus;
  currentLesson: TimetableLesson | null;
  isInLesson: boolean;
  isInBreak: boolean;

  // Next lesson
  nextLesson: NextLessonInfo | null;

  // Progress
  completedLessonIds: string[];
  toggleLessonComplete: (lessonId: string) => void;

  // Time slots
  sortedTimeSlots: TimetableSlot[];
  currentPeriodIndex: number;
}

/**
 * Core timetable hook — single source for all time-tracking logic.
 */
export function useTimetableCore(options: UseTimetableCoreOptions): UseTimetableCoreResult {
  const {
    viewType,
    timetableData,
    isLoading,
    error,
    refetch,
    completedLessonIds: externalCompleted = [],
    onToggleComplete,
  } = options;

  // ─── Current Time ──────────────────────────────────────────

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, CURRENT_TIME_REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  // ─── Completed Lessons ─────────────────────────────────────

  const [internalCompleted, setInternalCompleted] = useState<string[]>([]);
  const completedLessonIds = externalCompleted.length > 0 ? externalCompleted : internalCompleted;

  const toggleLessonComplete = useCallback((lessonId: string) => {
    if (onToggleComplete) {
      onToggleComplete(lessonId);
      return;
    }
    setInternalCompleted(prev =>
      prev.includes(lessonId) ? prev.filter(id => id !== lessonId) : [...prev, lessonId]
    );
  }, [onToggleComplete]);

  // ─── Derived Values ────────────────────────────────────────

  const sortedTimeSlots = useMemo(() => {
    if (!timetableData?.timeSlots) return [];
    return [...timetableData.timeSlots].sort((a, b) => a.periodNumber - b.periodNumber);
  }, [timetableData?.timeSlots]);

  const currentDayOfWeek = useMemo(
    () => getCurrentDayOfWeek(currentTime),
    [currentTime]
  );

  const currentDayName = useMemo(() => {
    if (currentDayOfWeek === null) return 'Weekend';
    const dayNames: Record<number, string> = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday' };
    return dayNames[currentDayOfWeek] || 'Unknown';
  }, [currentDayOfWeek]);

  const currentDayData = useMemo(() => {
    if (currentDayOfWeek === null || !timetableData?.days) return null;
    return timetableData.days.find(d => d.dayOfWeek === currentDayOfWeek) || null;
  }, [timetableData?.days, currentDayOfWeek]);

  const currentPeriodIndex = useMemo(
    () => getCurrentPeriodIndex(sortedTimeSlots, currentTime),
    [sortedTimeSlots, currentTime]
  );

  const currentStatus = useMemo(
    () => getCurrentLessonStatus(currentDayData, sortedTimeSlots, currentTime),
    [currentDayData, sortedTimeSlots, currentTime]
  );

  const nextLesson = useMemo(() => {
    if (!timetableData?.days) return null;
    return getNextLesson(timetableData.days, sortedTimeSlots, currentTime);
  }, [timetableData?.days, sortedTimeSlots, currentTime]);

  // ─── Return ────────────────────────────────────────────────

  return {
    timetable: timetableData,
    isLoading,
    error,
    refetch,

    currentTime,
    formattedTime: formatCurrentTime(currentTime),
    formattedDate: formatFullDate(currentTime),

    currentDayOfWeek,
    currentDayName,
    currentDayData,

    currentStatus,
    currentLesson: currentStatus.lesson || null,
    isInLesson: currentStatus.status === 'lesson',
    isInBreak: currentStatus.status === 'break',

    nextLesson,

    completedLessonIds,
    toggleLessonComplete,

    sortedTimeSlots,
    currentPeriodIndex,
  };
}
