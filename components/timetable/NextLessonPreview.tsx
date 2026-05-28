/**
 * NextLessonPreview
 *
 * A compact preview card showing the next upcoming lesson.
 * Shared across Student and Teacher views.
 */

'use client';

import React from 'react';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NextLessonInfo } from '@/lib/timetable/types';
import { getSubjectPaletteColor } from '@/lib/timetable/constants';

interface NextLessonPreviewProps {
  nextLesson: NextLessonInfo | null;
  /** View type affects what details to show */
  viewType: 'student' | 'teacher';
  className?: string;
}

export function NextLessonPreview({
  nextLesson,
  viewType,
  className,
}: NextLessonPreviewProps) {
  if (!nextLesson) {
    return (
      <div className={cn(
        'rounded-lg border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4',
        className
      )}>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          No upcoming lessons
        </p>
      </div>
    );
  }

  const palette = getSubjectPaletteColor(nextLesson.lesson.subject.name);

  return (
    <div className={cn(
      'rounded-lg border-l-4 shadow-sm overflow-hidden',
      palette.border,
      'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
      className
    )}>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Next lesson info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                Up Next
              </span>
              {nextLesson.isNextDay && (
                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">
                  Tomorrow
                </span>
              )}
            </div>

            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {nextLesson.lesson.subject.name}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-600 dark:text-slate-400">
              <span>{nextLesson.lesson.teacher.name}</span>
              {nextLesson.lesson.room && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Room {nextLesson.lesson.room}
                </span>
              )}
              {viewType === 'teacher' && (
                <span>
                  {nextLesson.lesson.grade.name}{nextLesson.lesson.stream ? ` ${nextLesson.lesson.stream}` : ''}
                </span>
              )}
            </div>
          </div>

          {/* Right: Time until */}
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {nextLesson.startsInFormatted}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {nextLesson.time}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
