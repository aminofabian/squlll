import type { LessonActivity } from '@/lib/lesson-planning/api'
import { buildActivityTimeline } from '../utils/buildActivityTimeline'
import { ActivitiesEmptyState } from './ActivitiesEmptyState'
import { ActivityCard } from './ActivityCard'
import { ActivityTimeBar } from './ActivityTimeBar'
import { EditorSection } from './EditorSection'
import { PhaseQuickAdd } from './PhaseQuickAdd'

export function ActivitiesSection({
  activities,
  durationMinutes,
  complete,
  onAdd,
  onChange,
  onRemove,
  onMove,
}: {
  activities: LessonActivity[]
  durationMinutes: number
  complete: boolean
  onAdd: (additions?: LessonActivity[]) => void
  onChange: (index: number, patch: Partial<LessonActivity>) => void
  onRemove: (index: number) => void
  onMove: (from: number, to: number) => void
}) {
  const timeline = buildActivityTimeline(activities, durationMinutes)

  if (activities.length === 0) {
    return (
      <EditorSection id="activities" complete={complete}>
        <ActivitiesEmptyState onAdd={onAdd} />
      </EditorSection>
    )
  }

  return (
    <EditorSection id="activities" complete={complete}>
      <ActivityTimeBar timeline={timeline} durationMinutes={durationMinutes} />
      <ol className="relative space-y-3 before:absolute before:bottom-6 before:left-4 before:top-6 before:w-0.5 before:rounded-full before:bg-gradient-to-b before:from-border before:via-border before:to-transparent">
        {activities.map((activity, index) => (
          <ActivityCard
            key={index}
            activity={activity}
            index={index}
            startMinute={timeline.segments[index].startMinute}
            endMinute={timeline.segments[index].endMinute}
            isLast={index === activities.length - 1}
            onChange={(patch) => onChange(index, patch)}
            onRemove={() => onRemove(index)}
            onMove={(to) => onMove(index, to)}
          />
        ))}
      </ol>
      <PhaseQuickAdd activities={activities} onAdd={onAdd} />
    </EditorSection>
  )
}
