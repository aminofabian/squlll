import { Clock, Hash, Layers, Timer } from 'lucide-react'
import {
  LessonDeliveryStatusPill,
  LessonPlanStatusPill,
} from '@/components/lesson-planning/StatusPill'
import type { LessonPlan } from '@/lib/lesson-planning/api'
import { CalendarTile } from './CalendarTile'
import { HeroChip } from './HeroChip'
import { ProgressRing } from '../../components/ProgressRing'

export function LessonHero({
  plan,
  topic,
  durationMinutes,
  percent,
}: {
  plan: LessonPlan
  topic: string
  durationMinutes: number
  percent: number
}) {
  const classLabel = [plan.className, plan.streamName].filter(Boolean).join(' ')

  return (
    <header className="app-print-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-dark via-primary to-primary-light p-5 text-primary-foreground shadow-lg shadow-primary/20 sm:p-6 print:border print:bg-none print:text-foreground print:shadow-none">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:18px_18px] print:hidden" />
      <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-white/10 blur-3xl print:hidden" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 size-64 rounded-full bg-amber-300/20 blur-3xl print:hidden" />

      <div className="relative flex items-start gap-4 sm:gap-5">
        <CalendarTile lessonDate={plan.lessonDate} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-75">
            Lesson plan{plan.revision > 1 ? ` · Revision ${plan.revision}` : ''}
          </p>
          <h1 className="mt-1 text-xl font-bold leading-tight sm:text-2xl">{plan.subjectName}</h1>
          <p className="text-sm opacity-85">{classLabel}</p>
          <p className="mt-2 line-clamp-2 text-sm font-medium italic opacity-95">
            {topic ? `“${topic}”` : 'Give this lesson a topic below…'}
          </p>
        </div>
        <ProgressRing percent={percent} caption="ready" className="hidden text-white sm:block print:hidden" />
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <HeroChip icon={Layers}>Week {plan.weekNumber}</HeroChip>
        <HeroChip icon={Hash}>Lesson {plan.lessonNumber}</HeroChip>
        {plan.periodTime && <HeroChip icon={Clock}>{plan.periodTime}</HeroChip>}
        <HeroChip icon={Timer}>{durationMinutes} min</HeroChip>
        <span className="ml-auto flex items-center gap-1.5">
          <LessonPlanStatusPill status={plan.status} className="shadow-sm" />
          {plan.record && <LessonDeliveryStatusPill status={plan.record.status} className="shadow-sm" />}
        </span>
      </div>

      <div className="relative mt-4 flex items-center gap-2 sm:hidden print:hidden">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white transition-[width] duration-700" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-[11px] font-semibold tabular-nums">{percent}% ready</span>
      </div>
    </header>
  )
}
