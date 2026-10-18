import { Plus } from 'lucide-react'
import type { LessonActivity } from '@/lib/lesson-planning/api'
import { getMissingLessonPhases } from '../utils/getMissingLessonPhases'
import { phaseToActivity } from '../utils/phaseToActivity'

export function PhaseQuickAdd({
  activities,
  onAdd,
}: {
  activities: LessonActivity[]
  onAdd: (additions?: LessonActivity[]) => void
}) {
  const missingPhases = getMissingLessonPhases(activities)

  return (
    <div className="app-print-hide flex flex-wrap items-center gap-1.5 pl-11">
      {missingPhases.map((phase) => (
        <button
          key={phase.title}
          type="button"
          title={phase.description}
          onClick={() => onAdd([phaseToActivity(phase)])}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary/40 px-3 py-1 text-xs font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
        >
          <Plus className="size-3" /> {phase.title}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onAdd()}
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
      >
        <Plus className="size-3" /> Custom activity
      </button>
    </div>
  )
}
