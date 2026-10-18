import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { LessonDeliveryStatusPill, LessonPlanStatusPill } from '@/components/lesson-planning/StatusPill'
import type { LessonPlan } from '@/lib/lesson-planning/api'
import { cn } from '@/lib/utils'
import { getSubjectAccent } from '../utils/getSubjectAccent'

export function PlanRow({ plan }: { plan: LessonPlan }) {
  const meta = [
    plan.subjectName,
    plan.className,
    plan.periodNumber ? `P${plan.periodNumber}` : null,
    `Wk ${plan.weekNumber}`,
  ].filter(Boolean)

  return (
    <li>
      <Link href={`/teacher/lesson-plans/${plan.id}`} className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40">
        <span className={cn('size-2 shrink-0 rounded-full', getSubjectAccent(plan.subjectId).dot)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{plan.topic || 'Untitled lesson'}</p>
          <p className="truncate text-xs text-muted-foreground">{meta.join(' · ')}</p>
        </div>
        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
          {plan.record && <LessonDeliveryStatusPill status={plan.record.status} />}
          <LessonPlanStatusPill status={plan.status} />
        </div>
        <LessonPlanStatusPill status={plan.status} className="sm:hidden" />
        <ChevronRight className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  )
}
