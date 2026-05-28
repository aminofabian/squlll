/**
 * CurrentLessonBanner
 *
 * A prominent banner showing what's happening RIGHT NOW.
 * Shared across Student and Teacher views.
 */

'use client';

import React from 'react';
import { Clock, MapPin, Users, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CurrentLessonStatus, TimetableLesson } from '@/lib/timetable/types';
import { STATUS_COLORS, BREAK_TYPE_CONFIG } from '@/lib/timetable/constants';
import type { BreakType } from '@/lib/timetable/types';

interface CurrentLessonBannerProps {
  status: CurrentLessonStatus;
  formattedTime: string;
  /** View type affects which details to show */
  viewType: 'student' | 'teacher';
  className?: string;
}

export function CurrentLessonBanner({
  status,
  formattedTime,
  viewType,
  className,
}: CurrentLessonBannerProps) {
  const colors = STATUS_COLORS[status.status];

  return (
    <div
      className={cn(
        'relative overflow-hidden border-l-4 shadow-sm transition-all duration-500',
        colors.border,
        colors.bg,
        className
      )}
    >
      {/* Progress bar at bottom */}
      {status.progressPercent > 0 && status.status !== 'weekend' && status.status !== 'outside' && (
        <div className="absolute bottom-0 left-0 h-1 bg-primary/30 w-full">
          <div
            className="h-full bg-primary transition-all duration-[60000ms] ease-linear"
            style={{ width: `${Math.min(status.progressPercent, 100)}%` }}
          />
        </div>
      )}

      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Status info */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Status header */}
            <div className="flex items-center gap-2.5">
              <div className={cn('w-2.5 h-2.5 rounded-full animate-pulse', colors.dot)} />
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100">
                {status.status === 'lesson' && '🔴 Live Now'}
                {status.status === 'break' && '⏸️ Current Break'}
                {status.status === 'free' && '🆓 Free Period'}
                {status.status === 'weekend' && '🏠 Weekend'}
                {status.status === 'outside' && '🌙 Outside Hours'}
              </h3>
            </div>

            {/* Lesson/break details */}
            {status.status === 'lesson' && status.lesson && (
              <LessonDetails lesson={status.lesson} viewType={viewType} />
            )}

            {status.status === 'break' && status.break && (
              <BreakDetails
                breakItem={status.break}
                remainingMinutes={status.remainingMinutes}
              />
            )}

            {status.status === 'free' && (
              <FreePeriodDetails remainingMinutes={status.remainingMinutes} />
            )}

            {(status.status === 'weekend' || status.status === 'outside') && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {status.message}
              </p>
            )}

            {/* Remaining time */}
            {status.remainingMinutes > 0 && status.status !== 'weekend' && status.status !== 'outside' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {status.remainingMinutes} min remaining
              </p>
            )}
          </div>

          {/* Right: Current time */}
          <div className="text-right flex-shrink-0">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {formattedTime}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Current Time
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Sub-component: Detailed lesson info */
function LessonDetails({
  lesson,
  viewType,
}: {
  lesson: TimetableLesson;
  viewType: 'student' | 'teacher';
}) {
  return (
    <div className="space-y-1">
      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
        {lesson.subject.name}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
          <Users className="h-3.5 w-3.5" />
          {lesson.teacher.name}
          {lesson.isSubstitution && (
            <span className="text-xs text-amber-600 font-medium ml-1">(Sub)</span>
          )}
        </span>
        {lesson.room && (
          <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-3.5 w-3.5" />
            Room {lesson.room}
            {lesson.roomChanged && (
              <span className="text-xs text-amber-600 font-medium ml-1">(Changed)</span>
            )}
          </span>
        )}
        {viewType === 'teacher' && (
          <>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {lesson.grade.name}{lesson.stream ? ` ${lesson.stream}` : ''}
            </span>
            {lesson.studentCount != null && (
              <span className="text-xs text-gray-500">
                {lesson.studentCount} students
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Sub-component: Break details */
function BreakDetails({
  breakItem,
  remainingMinutes,
}: {
  breakItem: { type: string; name: string; icon: string; durationMinutes: number };
  remainingMinutes: number;
}) {
  const config = BREAK_TYPE_CONFIG[breakItem.type as BreakType] || BREAK_TYPE_CONFIG.BREAK;

  return (
    <div className="space-y-1">
      <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
        {config.icon} {breakItem.name || config.label}
      </p>
      <p className="text-xs text-gray-500">
        {breakItem.durationMinutes} min total • {remainingMinutes} min remaining
      </p>
    </div>
  );
}

/** Sub-component: Free period details */
function FreePeriodDetails({ remainingMinutes }: { remainingMinutes: number }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        No class scheduled for this period
      </p>
      {remainingMinutes > 0 && (
        <p className="text-xs text-gray-500">
          {remainingMinutes} min until next period
        </p>
      )}
    </div>
  );
}
