import { Sparkles } from 'lucide-react'
import type { LessonPlanPeriod } from '@/lib/lesson-planning/api'

export function PeriodSummary({ period }: { period: LessonPlanPeriod }) {
  const { plan, record, suggestedSchemeEntry } = period

  return (
    <div className="mt-0.5 min-w-0 text-xs text-muted-foreground">
      {plan ? (
        <p className="truncate text-foreground/80">{plan.topic || 'No topic set yet'}</p>
      ) : suggestedSchemeEntry ? (
        <p className="flex min-w-0 items-center gap-1 text-primary">
          <Sparkles className="size-3 shrink-0" />
          <span className="truncate">Next on scheme: {suggestedSchemeEntry.topic}</span>
        </p>
      ) : (
        <p>No plan prepared yet</p>
      )}
      {plan?.specificLearningOutcomes && <p className="mt-0.5 line-clamp-1">{plan.specificLearningOutcomes}</p>}
      {record && <p className="mt-0.5 tabular-nums">{record.coveragePercent}% covered</p>}
    </div>
  )
}
