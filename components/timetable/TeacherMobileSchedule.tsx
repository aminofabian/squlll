'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { NextLessonInfo } from '@/lib/timetable/types';
import type {
  TimetableDay,
  TimetableSlot,
  TimetableBreak,
  TimetableLesson,
  TimetableStats,
} from '@/lib/timetable/types';
import { getCountdownParts, getSecondsUntil } from '@/lib/timetable';
import { TeacherMobileWeekTable, formatGradeShort } from './TeacherMobileWeekTable';

export type TeacherMobileScheduleProps = {
  days: TimetableDay[];
  timeSlots: TimetableSlot[];
  breaks: TimetableBreak[];
  currentDayOfWeek: number | null;
  currentPeriodIndex: number;
  completedLessonIds: string[];
  nextLesson: NextLessonInfo | null;
  stats?: TimetableStats;
  formattedDate?: string;
  onLessonClick?: (lesson: TimetableLesson) => void;
};

function useCountdown(startsAt: string) {
  const [seconds, setSeconds] = useState(() => getSecondsUntil(startsAt));

  useEffect(() => {
    const tick = () => setSeconds(getSecondsUntil(startsAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startsAt]);

  return getCountdownParts(seconds);
}

function formatDatePill(formattedDate: string): string {
  const parsed = new Date(formattedDate);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
  const match = formattedDate.match(/^(\w+),\s+(\w+)\s+(\d+)/);
  if (match) {
    return `${match[1].slice(0, 3)}, ${match[2]} ${match[3]}`;
  }
  return formattedDate;
}

function UpNextCard({ nextLesson }: { nextLesson: NextLessonInfo }) {
  const parts = useCountdown(nextLesson.startsAt);
  const grade = formatGradeShort(
    nextLesson.lesson.grade.displayName || '',
    nextLesson.lesson.grade.name,
  );
  const time = nextLesson.time.replace(/\s*[-–—]\s*/g, '–');

  const countdown =
    parts.days > 0
      ? `${parts.days}d ${parts.hours}h`
      : parts.hours > 0
        ? `${parts.hours}h ${parts.minutes}m`
        : `${parts.minutes}m ${parts.seconds}s`;

  const meta = [grade, nextLesson.dayLabel, time].filter(Boolean).join(' · ');

  return (
    <section className="shrink-0 rounded-lg border border-emerald-200 bg-white px-3.5 py-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium text-emerald-600">Next class</p>
          <p className="mt-0.5 break-words text-[15px] font-bold leading-snug text-emerald-700">
            {nextLesson.lesson.subject.name}
          </p>
          <p className="mt-1 break-words text-[11px] leading-snug text-slate-500">{meta}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end rounded-md border border-emerald-100 bg-emerald-50/50 px-3 py-2">
          <p className="text-[9px] text-emerald-600">Starts in</p>
          <p className="whitespace-nowrap font-mono text-xs font-bold tabular-nums text-emerald-800">
            {countdown}
          </p>
        </div>
      </div>
    </section>
  );
}

function StatCards({ stats }: { stats: TimetableStats }) {
  const items: { value: number; label: string; accent?: boolean }[] = [
    { value: stats.totalLessons, label: 'Classes' },
    { value: stats.totalSubjects, label: 'Subjects' },
    { value: stats.completedLessons, label: 'Done', accent: true },
  ];

  return (
    <div className="grid shrink-0 grid-cols-3 gap-2">
      {items.map(({ value, label, accent }) => (
        <div key={label} className="rounded-lg bg-slate-100 px-2 py-2.5 text-center">
          <p
            className={cn(
              'text-lg font-bold tabular-nums leading-none',
              accent ? 'text-emerald-600' : 'text-slate-900',
            )}
          >
            {value}
          </p>
          <p className="mt-1 text-[10px] font-medium text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}

export function TeacherMobileSchedule({
  days,
  timeSlots,
  breaks,
  currentDayOfWeek,
  currentPeriodIndex,
  completedLessonIds,
  nextLesson,
  stats,
  formattedDate,
  onLessonClick,
}: TeacherMobileScheduleProps) {
  const dayMap = useMemo(() => {
    const map = new Map<number, TimetableDay>();
    days.forEach((d) => map.set(d.dayOfWeek, d));
    return map;
  }, [days]);

  const handleLessonClick = useCallback(
    (lesson: TimetableLesson, _day: number, _period: number) => {
      onLessonClick?.(lesson);
    },
    [onLessonClick],
  );

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-2.5 overflow-hidden">
      {formattedDate && (
        <div className="flex shrink-0 justify-end px-0.5">
          <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
            {formatDatePill(formattedDate)}
          </span>
        </div>
      )}

      {nextLesson && <UpNextCard nextLesson={nextLesson} />}

      {stats && stats.totalLessons > 0 && <StatCards stats={stats} />}

      <section
        className="flex min-h-0 min-w-0 flex-1 basis-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white"
        aria-label="Timetable"
      >
        <TeacherMobileWeekTable
          dayMap={dayMap}
          timeSlots={timeSlots}
          breaks={breaks}
          currentDayOfWeek={currentDayOfWeek}
          currentPeriodIndex={currentPeriodIndex}
          completedLessonIds={completedLessonIds}
          onLessonClick={handleLessonClick}
        />
      </section>
    </div>
  );
}
