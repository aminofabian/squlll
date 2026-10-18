import { BookMarked, ClipboardCheck, Hourglass, Layers } from 'lucide-react'
import type { LessonPlanWeek } from '@/lib/lesson-planning/api'
import { StatTile } from './StatTile'

export function PlannerStats({ week }: { week: LessonPlanWeek | null }) {
  const stats = week?.stats
  const toRecord = stats?.lessonsNotRecorded ?? 0

  return (
    <div className="relative -mt-14 grid grid-cols-2 gap-3 px-3 sm:px-5 lg:grid-cols-4">
      <StatTile label="Scheduled" value={stats?.scheduledLessons ?? 0} hint={week ? `Lessons in week ${week.weekNumber}` : 'Lessons this week'} icon={Layers} tone="primary" />
      <StatTile
        label="Prepared"
        value={`${stats?.preparationRate ?? 0}%`}
        hint={`${stats?.plansPrepared ?? 0} of ${stats?.scheduledLessons ?? 0} lessons`}
        icon={BookMarked}
        tone="emerald"
        progress={stats?.preparationRate ?? 0}
      />
      <StatTile label="To record" value={toRecord} hint="Past periods without a record" icon={ClipboardCheck} tone="amber" attention={toRecord > 0} />
      <StatTile label="In review" value={stats?.submitted ?? 0} hint="Submitted, awaiting a reviewer" icon={Hourglass} tone="sky" />
    </div>
  )
}
