import { ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { LessonPlanForm } from '../types'
import { EditorSection } from './EditorSection'
import { Field } from './Field'
import { InquiryQuestionCard } from './InquiryQuestionCard'

export function CurriculumSection({
  form,
  complete,
  onChange,
}: {
  form: LessonPlanForm
  complete: boolean
  onChange: <K extends keyof LessonPlanForm>(key: K, value: LessonPlanForm[K]) => void
}) {
  return (
    <EditorSection id="curriculum" complete={complete}>
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <Field label="Strand">
          <Input value={form.strand} onChange={(e) => onChange('strand', e.target.value)} placeholder="e.g. Numbers" />
        </Field>
        <ChevronRight className="mb-2.5 hidden size-4 text-muted-foreground sm:block" />
        <Field label="Sub-strand">
          <Input value={form.subStrand} onChange={(e) => onChange('subStrand', e.target.value)} placeholder="e.g. Operations involving fractions" />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Lesson topic">
          <Input value={form.topic} onChange={(e) => onChange('topic', e.target.value)} placeholder="What this lesson is about" />
        </Field>
        <Field label="Specific focus">
          <Input value={form.subTopic} onChange={(e) => onChange('subTopic', e.target.value)} placeholder="Optional narrower focus" />
        </Field>
      </div>
      <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          By the end of the lesson, the learner should be able to…
        </p>
        <Textarea
          rows={3}
          className="resize-y rounded-xl bg-background"
          value={form.specificLearningOutcomes}
          onChange={(e) => onChange('specificLearningOutcomes', e.target.value)}
          placeholder={'a) identify…\nb) demonstrate…\nc) appreciate…'}
        />
      </div>
      <InquiryQuestionCard value={form.keyInquiryQuestion} onChange={(value) => onChange('keyInquiryQuestion', value)} />
    </EditorSection>
  )
}
