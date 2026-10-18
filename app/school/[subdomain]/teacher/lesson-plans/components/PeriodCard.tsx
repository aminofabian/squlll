import Link from 'next/link'
import { BookOpen, ClipboardCheck, Loader2, MapPin, PencilLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LessonPlanPeriod } from '@/lib/lesson-planning/api'
import { cn } from '@/lib/utils'
import { PERIOD_STATE_STYLES } from '../constants/periodStateStyles'
import { getPeriodState } from '../utils/getPeriodState'
import { getSubjectAccent } from '../utils/getSubjectAccent'
import { PeriodSummary } from './PeriodSummary'

export function PeriodCard({
  period,
  today,
  preparing,
  onPrepare,
  onRecord,
}: {
  period: LessonPlanPeriod
  today: string
  preparing: boolean
  onPrepare: (period: LessonPlanPeriod) => void
  onRecord: (period: LessonPlanPeriod) => void
}) {
  const accent = getSubjectAccent(period.subjectId)
  const state = PERIOD_STATE_STYLES[getPeriodState(period, today)]

  return (
    <li className="flex gap-3 sm:gap-4">
      <div className="w-12 shrink-0 pt-4 text-right sm:w-14">
        <p className="text-sm font-bold tabular-nums">{period.startTime}</p>
        <p className="text-[11px] tabular-nums text-muted-foreground">{period.endTime}</p>
      </div>
      <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md">
        <span className={cn('absolute inset-y-0 left-0 w-1.5', accent.bar)} />
        <div className="p-4 pl-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-lg px-2 py-0.5 text-[11px] font-bold', accent.soft)}>P{period.periodNumber}</span>
            <h3 className="text-sm font-semibold">{period.subjectName}</h3>
            <span className="text-sm text-muted-foreground">{[period.className, period.streamName].filter(Boolean).join(' ')}</span>
            {period.roomName && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{period.roomName}</span>
            )}
            <span className={cn('ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium', state.badge)}>{state.label}</span>
          </div>
          <PeriodSummary period={period} />
          <div className="mt-3 flex flex-wrap gap-2">
            {period.plan ? (
              <Button asChild size="sm" variant="outline" className="rounded-xl">
                <Link href={`/teacher/lesson-plans/${period.plan.id}`}><BookOpen className="size-3.5" /> Open plan</Link>
              </Button>
            ) : (
              <Button size="sm" className="rounded-xl" onClick={() => onPrepare(period)} disabled={preparing}>
                {preparing ? <Loader2 className="size-3.5 animate-spin" /> : <PencilLine className="size-3.5" />} Prepare
              </Button>
            )}
            <Button size="sm" variant={period.record ? 'ghost' : 'secondary'} className="rounded-xl" onClick={() => onRecord(period)}>
              <ClipboardCheck className="size-3.5" /> {period.record ? 'Update record' : 'Record'}
            </Button>
          </div>
        </div>
      </div>
    </li>
  )
}
