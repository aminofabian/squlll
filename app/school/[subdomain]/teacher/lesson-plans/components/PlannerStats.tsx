import { BookMarked, ClipboardCheck, Hourglass, Layers } from 'lucide-react'
import type { LessonPlanWeek } from '@/lib/lesson-planning/api'
import { StatTile } from './StatTile'

export function PlannerStats({ week }: { week: LessonPlanWeek | null }) {
  const stats = week?.stats
  const toRecord = stats?.lessonsNotRecorded ?? 0

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
      <StatTile label="Scheduled" value={stats?.scheduledLessons ?? 0} hint="Lessons this week" icon={Layers} />
      <StatTile
        label="Prepared"
        value={`${stats?.preparationRate ?? 0}%`}
        hint={`${stats?.plansPrepared ?? 0}/${stats?.scheduledLessons ?? 0}`}
        icon={BookMarked}
        progress={stats?.preparationRate ?? 0}
      />
      <StatTile label="To record" value={toRecord} hint="Past lessons without a record" icon={ClipboardCheck} attention={toRecord > 0} />
      <StatTile label="In review" value={stats?.submitted ?? 0} hint="Awaiting a reviewer" icon={Hourglass} />
    </div>
  )
}
