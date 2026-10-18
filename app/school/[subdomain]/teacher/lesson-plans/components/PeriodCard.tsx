import Link from 'next/link'
import { ClipboardCheck, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LessonDeliveryStatusPill, LessonPlanStatusPill } from '@/components/lesson-planning/StatusPill'
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
  const state = getPeriodState(period, today)
  const showStateBadge = state === 'recordDue' || state === 'unplanned'
  const classLabel = [period.className, period.streamName].filter(Boolean).join(' ')

  return (
    <li className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex w-20 shrink-0 items-baseline gap-1.5 sm:flex-col sm:gap-0">
        <span className="text-sm font-medium tabular-nums">{period.startTime}</span>
        <span className="text-[11px] tabular-nums text-muted-foreground">{period.endTime} · P{period.periodNumber}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={cn('size-2 shrink-0 rounded-full', getSubjectAccent(period.subjectId).dot)} />
          <h3 className="text-sm font-medium">{period.subjectName}</h3>
          <span className="text-xs text-muted-foreground">{classLabel}</span>
          {period.roomName && (
            <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground"><MapPin className="size-3" />{period.roomName}</span>
          )}
          {period.plan && <LessonPlanStatusPill status={period.plan.status} />}
          {period.record && <LessonDeliveryStatusPill status={period.record.status} />}
          {showStateBadge && (
            <span className={cn('rounded-full px-2 py-0.5 text-[11px]', PERIOD_STATE_STYLES[state].badge)}>{PERIOD_STATE_STYLES[state].label}</span>
          )}
        </div>
        <PeriodSummary period={period} />
      </div>
      <div className="flex shrink-0 gap-1.5">
        {period.plan ? (
          <Button asChild size="sm" variant="outline" className="h-8 rounded-lg">
            <Link href={`/teacher/lesson-plans/${period.plan.id}`}>Open</Link>
          </Button>
        ) : (
          <Button size="sm" className="h-8 rounded-lg" onClick={() => onPrepare(period)} disabled={preparing}>
            {preparing && <Loader2 className="size-3.5 animate-spin" />} Prepare
          </Button>
        )}
        <Button size="sm" variant="ghost" className={cn('h-8 rounded-lg', state === 'recordDue' && 'text-amber-700 dark:text-amber-300')} onClick={() => onRecord(period)}>
          <ClipboardCheck className="size-3.5" /> {period.record ? 'Update' : 'Record'}
        </Button>
      </div>
    </li>
  )
}
