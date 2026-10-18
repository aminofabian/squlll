import { BookOpen, CalendarDays, Users } from 'lucide-react'
import type { LessonPlan } from '@/lib/lesson-planning/api'
import { getCalendarParts } from '../utils/getCalendarParts'
import { DurationPicker } from './DurationPicker'
import { EditorSection } from './EditorSection'
import { Field } from './Field'
import { FactTile } from './FactTile'

export function DetailsSection({
  plan,
  durationMinutes,
  complete,
  onDurationChange,
}: {
  plan: LessonPlan
  durationMinutes: number
  complete: boolean
  onDurationChange: (minutes: number) => void
}) {
  const classLabel = [plan.className, plan.streamName].filter(Boolean).join(' ')

  return (
    <EditorSection id="details" complete={complete}>
      <div className="grid gap-2 sm:grid-cols-3">
        <FactTile icon={Users} label="Class" value={classLabel} />
        <FactTile icon={BookOpen} label="Learning area" value={plan.subjectName} />
        <FactTile icon={CalendarDays} label="Date" value={getCalendarParts(plan.lessonDate).longDate} />
      </div>
      <Field label="Lesson duration">
        <DurationPicker value={durationMinutes} onChange={onDurationChange} />
      </Field>
    </EditorSection>
  )
}
