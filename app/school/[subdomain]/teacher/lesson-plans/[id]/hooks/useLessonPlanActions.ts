import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  deleteLessonPlan,
  submitLessonPlan,
  type LessonPlan,
} from '@/lib/lesson-planning/api'
import { LESSON_PLAN_EDITOR } from '../constants/lessonPlanEditor'
import type { LessonPlanForm } from '../types'

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback

export function useLessonPlanActions(options: {
  subdomain: string
  planId: string
  form: LessonPlanForm
  persist: (form: LessonPlanForm) => Promise<LessonPlan>
  markSaved: (form: LessonPlanForm) => void
  setPlan: (plan: LessonPlan) => void
}) {
  const { subdomain, planId, form, persist, markSaved, setPlan } = options
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const submit = async () => {
    setSubmitting(true)
    setActionError(null)
    try {
      // Save the visible form directly so the submitted plan is exactly what the teacher sees.
      setPlan(await persist(form))
      markSaved(form)
      setPlan(await submitLessonPlan(subdomain, planId))
    } catch (err) {
      setActionError(errorMessage(err, 'Could not submit the plan'))
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('Delete this draft lesson plan?')) return
    try {
      await deleteLessonPlan(subdomain, planId)
      router.push(LESSON_PLAN_EDITOR.listHref)
    } catch (err) {
      setActionError(errorMessage(err, 'Could not delete the plan'))
    }
  }

  return { submit, remove, submitting, actionError }
}
