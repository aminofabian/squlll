import { Backpack, HandHeart, House, Target } from 'lucide-react'
import type { LessonPlanForm } from '../types'
import { EditorSection } from './EditorSection'
import { NoteTile } from './NoteTile'

const NOTE_TILES = [
  {
    key: 'resources',
    icon: Backpack,
    label: 'Teaching resources',
    hint: 'What you will bring into the room.',
    placeholder: 'Textbooks, charts, manipulatives…',
    tone: 'bg-sky-50 text-sky-900 ring-sky-200/70 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/20',
  },
  {
    key: 'assessment',
    icon: Target,
    label: 'Assessment',
    hint: 'How you will know the outcome was met.',
    placeholder: 'Oral questions, exit ticket, observation…',
    tone: 'bg-amber-50 text-amber-900 ring-amber-200/70 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/20',
  },
  {
    key: 'differentiation',
    icon: HandHeart,
    label: 'Differentiation',
    hint: 'Support for some, stretch for others.',
    placeholder: 'Peer support, extension questions…',
    tone: 'bg-violet-50 text-violet-900 ring-violet-200/70 dark:bg-violet-500/10 dark:text-violet-100 dark:ring-violet-500/20',
  },
  {
    key: 'homework',
    icon: House,
    label: 'Homework / follow-up',
    hint: 'What learners carry home.',
    placeholder: 'Exercise 3B, questions 1–5…',
    tone: 'bg-emerald-50 text-emerald-900 ring-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/20',
  },
] as const

export function AssessmentSection({
  form,
  complete,
  onChange,
}: {
  form: LessonPlanForm
  complete: boolean
  onChange: (key: (typeof NOTE_TILES)[number]['key'], value: string) => void
}) {
  return (
    <EditorSection id="assessment" complete={complete}>
      <div className="grid gap-3 sm:grid-cols-2">
        {NOTE_TILES.map(({ key, ...tile }) => (
          <NoteTile key={key} {...tile} value={form[key]} onChange={(value) => onChange(key, value)} />
        ))}
      </div>
    </EditorSection>
  )
}
