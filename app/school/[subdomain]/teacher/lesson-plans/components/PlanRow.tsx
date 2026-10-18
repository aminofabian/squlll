import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { LessonDeliveryStatusPill, LessonPlanStatusPill } from '@/components/lesson-planning/StatusPill'
import type { LessonPlan } from '@/lib/lesson-planning/api'
import { cn } from '@/lib/utils'
import { getSubjectAccent } from '../utils/getSubjectAccent'

export function PlanRow({ plan }: { plan: LessonPlan }) {
  const accent = getSubjectAccent(plan.subjectId)
  const meta = [
    plan.subjectName,
    plan.className,
    plan.periodNumber ? `Period ${plan.periodNumber}` : null,
    `Week ${plan.weekNumber}`,
  ].filter(Boolean)

  return (
    <Link
      href={`/teacher/lesson-plans/${plan.id}`}
      className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card py-3 pl-5 pr-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <span className={cn('absolute inset-y-0 left-0 w-1.5', accent.bar)} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{plan.topic || 'Untitled lesson'}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta.join(' · ')}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
        {plan.record && <LessonDeliveryStatusPill status={plan.record.status} />}
        <LessonPlanStatusPill status={plan.status} />
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
