import type { LessonPlan, SaveLessonPlanInput } from '@/lib/lesson-planning/api'
import type { LessonPlanForm } from '../types'

export function buildSaveLessonPlanInput(
  plan: LessonPlan,
  termId: string,
  form: LessonPlanForm,
): SaveLessonPlanInput {
  return {
    id: plan.id,
    termId,
    timetableEntryId: plan.timetableEntryId ?? undefined,
    schemeOfWorkId: plan.schemeOfWorkId ?? undefined,
    schemeEntryId: plan.schemeEntryId ?? undefined,
    gradeLevelId: plan.gradeLevelId,
    streamId: plan.streamId ?? undefined,
    subjectId: plan.subjectId,
    lessonDate: plan.lessonDate,
    weekNumber: plan.weekNumber,
    lessonNumber: plan.lessonNumber,
    ...form,
    activities: form.activities.map((activity) => ({
      minutes: Number(activity.minutes) || 0,
      title: activity.title,
      description: activity.description ?? '',
    })),
  }
}
