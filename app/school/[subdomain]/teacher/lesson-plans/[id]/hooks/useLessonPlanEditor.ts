import { useCallback, useState } from 'react'
import {
  saveLessonPlan,
  type LessonPlan,
  type LessonRecord,
} from '@/lib/lesson-planning/api'
import type { LessonPlanForm } from '../types'
import { buildSaveLessonPlanInput } from '../utils/buildSaveLessonPlanInput'
import { describeSaveStatus } from '../utils/describeSaveStatus'
import { getLessonPlanProgress } from '../utils/getLessonPlanProgress'
import { useLessonPlanActions } from './useLessonPlanActions'
import { useLessonPlanAutosave } from './useLessonPlanAutosave'
import { useLessonPlanFormState } from './useLessonPlanFormState'

export function useLessonPlanEditor(subdomain: string, termId: string, initialPlan: LessonPlan) {
  const [plan, setPlan] = useState(initialPlan)
  const formState = useLessonPlanFormState(initialPlan)
  const { form } = formState

  const persist = useCallback(
    (state: LessonPlanForm) =>
      saveLessonPlan(subdomain, buildSaveLessonPlanInput(plan, termId, state)),
    [plan, subdomain, termId],
  )
  const autosave = useLessonPlanAutosave(form, persist, setPlan)
  const actions = useLessonPlanActions({
    subdomain,
    planId: plan.id,
    form,
    persist,
    markSaved: autosave.markSaved,
    setPlan,
  })

  const handleRecordSaved = (record: LessonRecord) =>
    setPlan((current) => ({ ...current, record }))

  return {
    plan,
    ...formState,
    ...actions,
    handleRecordSaved,
    canSubmit: plan.status === 'DRAFT' || plan.status === 'RETURNED',
    progress: getLessonPlanProgress(form, Boolean(plan.record)),
    saveStatus: describeSaveStatus({ ...autosave, updatedAt: plan.updatedAt }),
  }
}
