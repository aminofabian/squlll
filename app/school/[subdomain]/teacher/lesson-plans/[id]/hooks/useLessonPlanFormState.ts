import { useCallback, useState } from 'react'
import type { LessonActivity, LessonPlan } from '@/lib/lesson-planning/api'
import { LESSON_PLAN_EDITOR } from '../constants/lessonPlanEditor'
import type { LessonPlanForm } from '../types'
import { moveItem } from '../utils/moveItem'
import { toLessonPlanForm } from '../utils/toLessonPlanForm'

const BLANK_ACTIVITY: LessonActivity = {
  minutes: LESSON_PLAN_EDITOR.newActivityMinutes,
  title: '',
  description: '',
}

export function useLessonPlanFormState(initialPlan: LessonPlan) {
  const [form, setForm] = useState<LessonPlanForm>(() => toLessonPlanForm(initialPlan))

  const setActivities = useCallback(
    (change: (activities: LessonActivity[]) => LessonActivity[]) =>
      setForm((current) => ({ ...current, activities: change(current.activities) })),
    [],
  )

  const update = useCallback(
    <K extends keyof LessonPlanForm>(key: K, value: LessonPlanForm[K]) =>
      setForm((current) => ({ ...current, [key]: value })),
    [],
  )

  return {
    form,
    update,
    updateActivity: (index: number, patch: Partial<LessonActivity>) =>
      setActivities((list) =>
        list.map((activity, i) => (i === index ? { ...activity, ...patch } : activity)),
      ),
    addActivities: (additions: LessonActivity[] = [BLANK_ACTIVITY]) =>
      setActivities((list) => [...list, ...additions]),
    removeActivity: (index: number) =>
      setActivities((list) => list.filter((_, i) => i !== index)),
    moveActivity: (from: number, to: number) =>
      setActivities((list) => moveItem(list, from, to)),
  }
}
