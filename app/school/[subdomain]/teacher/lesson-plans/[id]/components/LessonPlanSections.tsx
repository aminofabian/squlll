import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { useLessonPlanEditor } from '../hooks/useLessonPlanEditor'
import { ActivitiesSection } from './ActivitiesSection'
import { AssessmentSection } from './AssessmentSection'
import { CurriculumSection } from './CurriculumSection'
import { DetailsSection } from './DetailsSection'
import { ReflectionSection } from './ReflectionSection'
import { ReviewTimeline } from './ReviewTimeline'

type Editor = ReturnType<typeof useLessonPlanEditor>

export function LessonPlanSections({ editor, onRecord }: { editor: Editor; onRecord: () => void }) {
  const { plan, form, progress, update } = editor

  return (
    <>
      <DetailsSection plan={plan} durationMinutes={form.durationMinutes} complete={progress.completed.details} onDurationChange={(minutes) => update('durationMinutes', minutes)} />
      <CurriculumSection form={form} complete={progress.completed.curriculum} onChange={update} />
      <ActivitiesSection
        activities={form.activities}
        durationMinutes={form.durationMinutes}
        complete={progress.completed.activities}
        onAdd={editor.addActivities}
        onChange={editor.updateActivity}
        onRemove={editor.removeActivity}
        onMove={editor.moveActivity}
      />
      <AssessmentSection form={form} complete={progress.completed.assessment} onChange={update} />
      <ReflectionSection record={plan.record} onRecord={onRecord} />
      {plan.reviews.length > 0 && <ReviewTimeline reviews={plan.reviews} />}
      {plan.status === 'DRAFT' && (
        <div className="app-print-hide flex justify-center pb-6 pt-2">
          <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" onClick={editor.remove}>
            <Trash2 className="size-3.5" /> Delete draft
          </Button>
        </div>
      )}
    </>
  )
}
