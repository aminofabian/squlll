/**
 * NextLessonPreview
 *
 * A compact preview card showing the next upcoming lesson.
 * Shared across Student and Teacher views.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NextLessonInfo } from '@/lib/timetable/types';
import { getSubjectPaletteColor, normalizeSubjectName } from '@/lib/timetable/constants';
import { getCountdownParts, getSecondsUntil } from '@/lib/timetable';
import { NextLessonCountdown } from './NextLessonCountdown';

function MinimalCountdownText({ startsAt }: { startsAt: string }) {
  const [totalSeconds, setTotalSeconds] = useState(() => getSecondsUntil(startsAt));

  useEffect(() => {
    const tick = () => setTotalSeconds(getSecondsUntil(startsAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startsAt]);

  const parts = getCountdownParts(totalSeconds);
  const label =
    parts.days > 0
      ? `${parts.days}d ${parts.hours}h`
      : parts.hours > 0
        ? `${parts.hours}h ${parts.minutes}m`
        : `${parts.minutes}m`;

  return (
    <span className="shrink-0 pt-0.5 font-mono text-[11px] font-semibold tabular-nums text-primary">
      {label}
    </span>
  );
}

interface NextLessonPreviewProps {
  nextLesson: NextLessonInfo | null;
  viewType: 'student' | 'teacher';
  dense?: boolean;
  /** Bold gradient card for mobile teacher home */
  mobileHero?: boolean;
  /** Single compact strip — student timetable */
  minimal?: boolean;
  /** Flat strip with separator only (mobile student timetable) */
  flat?: boolean;
  className?: string;
}

export function NextLessonPreview({
  nextLesson,
  viewType,
  dense = false,
  mobileHero = false,
  minimal = false,
  flat = false,
  className,
}: NextLessonPreviewProps) {
  const isTeacherDense = viewType === 'teacher' && dense;
  const isMobileHero = mobileHero && nextLesson && !minimal;

  if (!nextLesson) {
    if (minimal) {
      return (
        <p
          className={cn(
            flat
              ? 'bg-white px-3 py-2.5 text-[10px] text-slate-400 dark:bg-slate-950 dark:text-slate-500'
              : 'py-1 text-[11px] text-slate-400 dark:text-slate-500',
            className,
          )}
        >
          Nothing scheduled this week
        </p>
      );
    }
    return (
      <div className={cn(
        'rounded-md border border-dashed border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/40',
        className,
      )}>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          No upcoming lessons this week
        </p>
      </div>
    );
  }

  const palette = getSubjectPaletteColor(
    normalizeSubjectName(nextLesson.lesson.subject.name),
  );
  const gradeLabel = nextLesson.lesson.grade.displayName || nextLesson.lesson.grade.name;

  if (minimal) {
    const meta = [
      viewType === 'student' ? nextLesson.lesson.teacher.name : gradeLabel,
      nextLesson.dayLabel,
      nextLesson.time.replace(/\s*[-–—]\s*/g, '–'),
    ]
      .filter(Boolean)
      .join(' · ');

    if (flat) {
      return (
        <div
          className={cn(
            'flex w-full min-w-0 max-w-full items-start gap-2.5 bg-white px-3 py-2.5 dark:bg-slate-950',
            className,
          )}
        >
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rotate-45"
            style={{ backgroundColor: palette.accent }}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 flex-1 break-words text-[12px] font-semibold leading-snug text-slate-900 dark:text-slate-100">
                {nextLesson.lesson.subject.name}
              </p>
              <MinimalCountdownText startsAt={nextLesson.startsAt} />
            </div>
            <p className="mt-0.5 break-words text-[10px] leading-snug text-slate-500 dark:text-slate-400">
              {meta}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'flex w-full min-w-0 max-w-full items-center gap-2 overflow-hidden rounded border border-slate-200/70 bg-white/90 px-2 py-1.5 dark:border-slate-700/70 dark:bg-slate-800/90',
          className,
        )}
      >
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: palette.accent }}
          aria-hidden
        />
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-[11px] font-semibold leading-snug text-slate-900 dark:text-slate-100">
            {nextLesson.lesson.subject.name}
          </p>
          <p className="truncate text-[10px] leading-snug text-slate-500 dark:text-slate-400">
            {meta}
          </p>
        </div>
        <MinimalCountdownText startsAt={nextLesson.startsAt} />
      </div>
    );
  }
  if (isMobileHero) {
    const subjectName = nextLesson.lesson.subject.name;
    const parts = subjectName.trim().split(/\s+/);
    const initial =
      parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : subjectName.slice(0, 2).toUpperCase();

    return (
      <div
        className={cn(
          'overflow-hidden rounded-2xl shadow-lg shadow-primary/15 ring-1 ring-primary/20',
          className,
        )}
      >
        <div className="relative bg-gradient-to-br from-primary via-primary/95 to-emerald-800 p-4 text-white">
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div className="relative flex items-start gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-sm font-bold backdrop-blur-sm"
              style={{ boxShadow: `inset 0 0 0 2px ${palette.accent}55` }}
            >
              {initial || '—'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Up next
                </span>
                {nextLesson.dayLabel && (
                  <span className="rounded-full bg-amber-300/25 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
                    {nextLesson.dayLabel}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-lg font-bold leading-tight tracking-tight">
                {nextLesson.lesson.subject.name}
              </p>
              <p className="mt-0.5 text-sm text-white/85">
                {viewType === 'student'
                  ? nextLesson.lesson.teacher.name
                  : gradeLabel}
              </p>
            </div>
          </div>
          <div className="relative mt-4 flex items-end justify-between gap-3 rounded-xl bg-black/15 px-3 py-2.5 backdrop-blur-sm">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">
                Starts in
              </p>
              <NextLessonCountdown
                startsAt={nextLesson.startsAt}
                inverted
              />
            </div>
            <div className="text-right">
              <Clock className="ml-auto mb-0.5 h-3.5 w-3.5 text-white/50" />
              <p className="font-mono text-sm font-semibold tabular-nums">
                {nextLesson.time}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-white dark:bg-slate-800/90',
        isTeacherDense
          ? 'border-slate-200/70 shadow-none dark:border-slate-700/70'
          : cn('border-slate-200 shadow-sm dark:border-slate-700', palette.border, 'border-l-[3px]'),
        className,
      )}
    >
      <div className={cn(dense ? 'p-3' : 'p-4')}>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary dark:bg-primary/20">
                {isTeacherDense && (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: palette.accent }}
                    aria-hidden
                  />
                )}
                Up Next
              </span>
              {nextLesson.dayLabel && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  {nextLesson.dayLabel}
                </span>
              )}
            </div>

            <p className="break-words text-sm font-bold text-slate-900 dark:text-slate-50">
              {nextLesson.lesson.subject.name}
            </p>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600 dark:text-slate-400">
              {viewType === 'student' && (
                <span>{nextLesson.lesson.teacher.name}</span>
              )}
              {viewType === 'teacher' && (
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {gradeLabel}
                  {nextLesson.lesson.stream ? ` · ${nextLesson.lesson.stream}` : ''}
                </span>
              )}
              {nextLesson.lesson.room && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0 opacity-70" />
                  Room {nextLesson.lesson.room}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-100 pt-2 sm:border-t-0 sm:border-l sm:pl-3 sm:pt-0 dark:border-slate-700">
            <div className="flex items-start justify-end gap-1 sm:flex-col sm:items-end">
              {isTeacherDense ? (
                <MinimalCountdownText startsAt={nextLesson.startsAt} />
              ) : (
                <div className="flex items-start gap-1">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <NextLessonCountdown startsAt={nextLesson.startsAt} />
                </div>
              )}
              <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:text-right">
                {nextLesson.time}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
