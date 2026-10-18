import { AlertTriangle, CheckCircle2, Hourglass } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACTIVITY_PALETTE } from '../constants/activityPalette'
import type { buildActivityTimeline } from '../utils/buildActivityTimeline'

type Timeline = ReturnType<typeof buildActivityTimeline>

function BudgetMessage({ timeline }: { timeline: Timeline }) {
  if (timeline.overflowMinutes > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
        <AlertTriangle className="size-3.5" /> Over by {timeline.overflowMinutes} min — trim an activity
      </span>
    )
  }
  if (timeline.remainingMinutes === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="size-3.5" /> Perfectly timed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <Hourglass className="size-3.5" /> {timeline.remainingMinutes} min left to plan
    </span>
  )
}

export function ActivityTimeBar({ timeline, durationMinutes }: { timeline: Timeline; durationMinutes: number }) {
  return (
    <div className="space-y-2 rounded-2xl bg-muted/40 p-3">
      <div className="flex h-4 gap-0.5 overflow-hidden rounded-full bg-background ring-1 ring-inset ring-border">
        {timeline.segments.map((segment) => (
          <div
            key={segment.index}
            title={`${segment.title || 'Untitled'} · ${segment.minutes} min`}
            style={{ width: `${segment.percent}%` }}
            className={cn('h-full transition-[width] duration-500 first:rounded-l-full', ACTIVITY_PALETTE[segment.index % ACTIVITY_PALETTE.length].bar)}
          />
        ))}
        {timeline.remainingPercent > 0 && (
          <div
            style={{ width: `${timeline.remainingPercent}%` }}
            className="h-full [background-image:repeating-linear-gradient(135deg,transparent_0_5px,var(--color-border)_5px_7px)]"
          />
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <BudgetMessage timeline={timeline} />
        <span className="font-medium tabular-nums text-muted-foreground">
          {timeline.totalMinutes} / {durationMinutes} min
        </span>
      </div>
    </div>
  )
}
