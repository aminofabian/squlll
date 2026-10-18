import { ArrowDown, ArrowUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { LessonActivity } from '@/lib/lesson-planning/api'
import { cn } from '@/lib/utils'
import { ACTIVITY_PALETTE } from '../constants/activityPalette'
import { LESSON_PLAN_EDITOR } from '../constants/lessonPlanEditor'

export function ActivityCard({
  activity,
  index,
  startMinute,
  endMinute,
  isLast,
  onChange,
  onRemove,
  onMove,
}: {
  activity: LessonActivity
  index: number
  startMinute: number
  endMinute: number
  isLast: boolean
  onChange: (patch: Partial<LessonActivity>) => void
  onRemove: () => void
  onMove: (to: number) => void
}) {
  const palette = ACTIVITY_PALETTE[index % ACTIVITY_PALETTE.length]

  return (
    <li className="relative flex gap-3">
      <span className={cn('relative z-10 mt-3 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ring-4 ring-card', palette.node)}>
        {index + 1}
      </span>
      <div className={cn('group min-w-0 flex-1 rounded-2xl p-3 ring-1 ring-inset ring-border/60', palette.soft)}>
        <div className="flex items-center gap-2">
          <Input className="h-9 flex-1 rounded-xl border-transparent bg-background/80 font-medium shadow-none" value={activity.title} placeholder="Activity title (e.g. Introduction)" onChange={(e) => onChange({ title: e.target.value })} />
          <label className="flex items-center gap-1 rounded-xl bg-background/80 px-2">
            <input type="number" min={0} max={LESSON_PLAN_EDITOR.maxActivityMinutes} aria-label="Minutes" className="h-9 w-10 bg-transparent text-right text-sm font-semibold tabular-nums outline-none" value={activity.minutes} onChange={(e) => onChange({ minutes: Number(e.target.value) || 0 })} />
            <span className="text-[11px] text-muted-foreground">min</span>
          </label>
        </div>
        <Textarea rows={2} className="mt-2 min-h-[64px] rounded-xl border-transparent bg-background/80 text-xs shadow-none" value={activity.description ?? ''} placeholder="What the teacher and learners do" onChange={(e) => onChange({ description: e.target.value })} />
        <div className="app-print-hide mt-2 flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground tabular-nums">
            Minute {startMinute} → {endMinute}
          </span>
          <div className="flex items-center opacity-70 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon" className="size-7" disabled={index === 0} onClick={() => onMove(index - 1)} aria-label="Move up"><ArrowUp className="size-3.5" /></Button>
            <Button variant="ghost" size="icon" className="size-7" disabled={isLast} onClick={() => onMove(index + 1)} aria-label="Move down"><ArrowDown className="size-3.5" /></Button>
            <Button variant="ghost" size="icon" className="size-7 hover:text-rose-600" onClick={onRemove} aria-label="Remove activity"><X className="size-3.5" /></Button>
          </div>
        </div>
      </div>
    </li>
  )
}
