import { Plus, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LessonActivity } from '@/lib/lesson-planning/api'
import { LESSON_PHASES } from '../constants/lessonPhases'
import { phaseToActivity } from '../utils/phaseToActivity'

export function ActivitiesEmptyState({ onAdd }: { onAdd: (additions?: LessonActivity[]) => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-4 py-8 text-center">
      <div className="flex -space-x-2">
        {LESSON_PHASES.map((phase, index) => (
          <span key={phase.title} className="flex size-9 items-center justify-center rounded-full bg-card text-xs font-bold text-muted-foreground shadow-sm ring-2 ring-background">
            {index + 1}
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold">Build your lesson flow</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        Start from the classic four-part lesson — introduction, development, application and conclusion — then tweak it.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button size="sm" className="rounded-xl" onClick={() => onAdd(LESSON_PHASES.map(phaseToActivity))}>
          <Wand2 className="size-3.5" /> Use 4-part template
        </Button>
        <Button size="sm" variant="outline" className="rounded-xl" onClick={() => onAdd()}>
          <Plus className="size-3.5" /> Blank activity
        </Button>
      </div>
    </div>
  )
}
