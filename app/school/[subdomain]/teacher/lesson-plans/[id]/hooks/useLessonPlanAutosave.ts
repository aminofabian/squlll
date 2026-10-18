import { useCallback, useEffect, useRef, useState } from 'react'
import type { LessonPlan } from '@/lib/lesson-planning/api'
import { LESSON_PLAN_EDITOR } from '../constants/lessonPlanEditor'
import type { LessonPlanForm } from '../types'

const serialise = (form: LessonPlanForm) => JSON.stringify(form)

/**
 * Serialised autosave: an edit that lands while a save is in flight is queued,
 * so nothing the teacher typed is silently dropped.
 */
export function useLessonPlanAutosave(
  form: LessonPlanForm,
  persist: (form: LessonPlanForm) => Promise<LessonPlan>,
  onSaved: (plan: LessonPlan) => void,
) {
  const [savedSnapshot, setSavedSnapshot] = useState(() => serialise(form))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const inFlight = useRef(false)
  const queued = useRef<LessonPlanForm | null>(null)
  const isDirty = serialise(form) !== savedSnapshot

  const markSaved = useCallback((state: LessonPlanForm) => {
    setSavedSnapshot(serialise(state))
    setLastSavedAt(new Date())
  }, [])

  const save = useCallback(
    async function run(state: LessonPlanForm): Promise<void> {
      if (inFlight.current) {
        queued.current = state
        return
      }
      inFlight.current = true
      setSaving(true)
      setSaveError(null)
      try {
        onSaved(await persist(state))
        markSaved(state)
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Could not save this plan')
      } finally {
        inFlight.current = false
        setSaving(false)
        const next = queued.current
        queued.current = null
        if (next) void run(next)
      }
    },
    [markSaved, onSaved, persist],
  )

  useEffect(() => {
    if (!isDirty) return
    const timer = setTimeout(() => void save(form), LESSON_PLAN_EDITOR.autosaveDelayMs)
    return () => clearTimeout(timer)
  }, [form, isDirty, save])

  return { isDirty, saving, saveError, lastSavedAt, markSaved }
}
