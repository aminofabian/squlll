import { ArrowRightCircle, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LessonDeliveryStatusPill } from '@/components/lesson-planning/StatusPill'
import type { LessonRecord } from '@/lib/lesson-planning/api'
import { ProgressRing } from '../../components/ProgressRing'
import { ReflectionNote } from './ReflectionNote'

export function ReflectionSummary({ record, onEdit }: { record: LessonRecord; onEdit: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-muted/40 p-4">
        <ProgressRing percent={record.coveragePercent} caption="covered" className="text-primary" />
        <div className="grid flex-1 grid-cols-2 gap-2">
          <div className="rounded-xl bg-background px-3 py-2 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Present</p>
            <p className="text-xl font-bold tabular-nums">{record.learnersPresent ?? '—'}</p>
          </div>
          <div className="rounded-xl bg-background px-3 py-2 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Achieved</p>
            <p className="text-xl font-bold tabular-nums">{record.learnersAchieved ?? '—'}</p>
          </div>
        </div>
        <LessonDeliveryStatusPill status={record.status} />
      </div>
      <ReflectionNote label="Covered" text={record.whatWasCovered} />
      <ReflectionNote label="Challenges" text={record.challenges} />
      <ReflectionNote label="Follow-up" text={record.followUp} />
      {record.carryForward && (
        <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          <ArrowRightCircle className="size-4 shrink-0" />
          Unfinished content is carried forward to the next lesson.
        </p>
      )}
      <Button variant="outline" size="sm" className="app-print-hide rounded-xl" onClick={onEdit}>
        <ClipboardCheck className="size-3.5" /> Update record
      </Button>
    </div>
  )
}
