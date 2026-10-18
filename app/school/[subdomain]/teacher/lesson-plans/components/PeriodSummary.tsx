import { Sparkles } from 'lucide-react'
import { LessonPlanStatusPill } from '@/components/lesson-planning/StatusPill'
import type { LessonPlanPeriod } from '@/lib/lesson-planning/api'

const FULL_PERCENT = 100

export function PeriodSummary({ period }: { period: LessonPlanPeriod }) {
  const { plan, record, suggestedSchemeEntry } = period

  return (
    <div className="mt-2 space-y-2">
      {plan ? (
        <div className="flex flex-wrap items-center gap-2">
          <LessonPlanStatusPill status={plan.status} />
          <p className="min-w-0 truncate text-sm font-medium">{plan.topic || 'No topic set yet'}</p>
        </div>
      ) : suggestedSchemeEntry ? (
        <p className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-dashed border-primary/40 px-2.5 py-1 text-xs text-primary">
          <Sparkles className="size-3 shrink-0" />
          <span className="truncate">Up next on scheme: {suggestedSchemeEntry.topic}</span>
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">No plan prepared yet</p>
      )}
      {plan?.specificLearningOutcomes && (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{plan.specificLearningOutcomes}</p>
      )}
      {record && (
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(FULL_PERCENT, record.coveragePercent)}%` }} />
          </div>
          <span className="text-[11px] font-medium tabular-nums text-muted-foreground">{record.coveragePercent}% covered</span>
        </div>
      )}
    </div>
  )
}
