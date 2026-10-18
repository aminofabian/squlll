import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LESSON_PLAN_EDITOR } from '../constants/lessonPlanEditor'
import { clampDuration } from '../utils/clampDuration'

export function DurationPicker({ value, onChange }: { value: number; onChange: (minutes: number) => void }) {
  const step = LESSON_PLAN_EDITOR.durationStepMinutes

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="size-9 rounded-xl" aria-label="Shorter lesson" onClick={() => onChange(clampDuration(value - step))}>
          <Minus className="size-4" />
        </Button>
        <div className="min-w-[5.5rem] text-center">
          <span className="text-2xl font-bold tabular-nums">{value}</span>
          <span className="ml-1 text-xs text-muted-foreground">min</span>
        </div>
        <Button variant="outline" size="icon" className="size-9 rounded-xl" aria-label="Longer lesson" onClick={() => onChange(clampDuration(value + step))}>
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {LESSON_PLAN_EDITOR.durationPresets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium tabular-nums transition-colors',
              preset === value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground',
            )}
          >
            {preset}′
          </button>
        ))}
      </div>
    </div>
  )
}
