'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getCountdownParts, getSecondsUntil } from '@/lib/timetable';

interface NextLessonCountdownProps {
  startsAt: string;
  /** Boxed unit style for teacher Up Next card */
  compact?: boolean;
  /** Light text for gradient / dark backgrounds */
  inverted?: boolean;
  className?: string;
}

const UNITS = [
  { key: 'days' as const, label: 'days' },
  { key: 'hours' as const, label: 'hrs' },
  { key: 'minutes' as const, label: 'min' },
  { key: 'seconds' as const, label: 'sec' },
];

export function NextLessonCountdown({
  startsAt,
  compact = false,
  inverted = false,
  className,
}: NextLessonCountdownProps) {
  const [totalSeconds, setTotalSeconds] = useState(() => getSecondsUntil(startsAt));

  useEffect(() => {
    const tick = () => setTotalSeconds(getSecondsUntil(startsAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startsAt]);

  const parts = getCountdownParts(totalSeconds);

  return (
    <div
      className={cn('flex items-center tabular-nums', compact ? 'gap-0.5' : 'gap-1 sm:gap-1.5', className)}
      role="timer"
      aria-live="polite"
      aria-label={`Starts in ${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes, ${parts.seconds} seconds`}
    >
      {UNITS.map(({ key, label }, index) => (
        <div key={key} className={cn('flex items-center', compact ? 'gap-0.5' : 'gap-1 sm:gap-1.5')}>
          {index > 0 && !compact && (
            <span
              className={cn(
                'text-sm font-light',
                inverted ? 'text-white/40' : 'text-slate-300 dark:text-slate-600',
              )}
            >
              :
            </span>
          )}
          <div className={cn(
            'flex flex-col items-center',
            compact
              ? 'min-w-[1.6rem] rounded bg-slate-100/80 px-0.5 py-0.5 dark:bg-slate-700/50'
              : inverted
                ? 'min-w-[1.75rem]'
                : 'min-w-[2rem] sm:min-w-[2.25rem]',
          )}>
            <span className={cn(
              'font-bold leading-none',
              inverted
                ? 'text-xl text-white sm:text-2xl'
                : 'text-slate-900 dark:text-slate-100',
              compact && !inverted && 'text-xs',
              !compact && !inverted && 'text-base sm:text-lg',
            )}>
              {key === 'days'
                ? String(parts.days)
                : String(parts[key]).padStart(2, '0')}
            </span>
            <span className={cn(
              'mt-0.5 uppercase tracking-wide',
              inverted ? 'text-[8px] text-white/50' : 'text-slate-400 dark:text-slate-500',
              compact && !inverted ? 'text-[7px]' : !inverted ? 'text-[9px]' : '',
            )}>
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
