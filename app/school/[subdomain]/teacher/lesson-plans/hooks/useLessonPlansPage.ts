import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelectedTerm } from '@/lib/hooks/useSelectedTerm'
import { startLessonPlan, type LessonPlanPeriod } from '@/lib/lesson-planning/api'
import type { PlannerTab } from '../constants/plannerTabs'
import { useLessonPlanCollections } from './useLessonPlanCollections'
import { useLessonWeek } from './useLessonWeek'

const firstParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? ''

export function useLessonPlansPage() {
  const subdomain = firstParam(useParams().subdomain)
  const router = useRouter()
  const { selectedTerm, termsLoading } = useSelectedTerm()
  const termId = selectedTerm?.id
  const [tab, setTab] = useState<PlannerTab>('week')
  const [preparingId, setPreparingId] = useState<string | null>(null)
  const [recordTarget, setRecordTarget] = useState<LessonPlanPeriod | null>(null)
  const [schemeDialogOpen, setSchemeDialogOpen] = useState(false)
  const weekState = useLessonWeek(subdomain, termId, termsLoading)
  const collections = useLessonPlanCollections(subdomain, termId, tab)

  const prepare = async (period: LessonPlanPeriod) => {
    if (!termId) return
    setPreparingId(period.timetableEntryId)
    weekState.setError(null)
    try {
      const plan = await startLessonPlan(subdomain, { timetableEntryId: period.timetableEntryId, termId, date: period.date })
      router.push(`/teacher/lesson-plans/${plan.id}`)
    } catch (err) {
      weekState.setError(err instanceof Error ? err.message : 'Could not start the lesson plan')
      setPreparingId(null)
    }
  }

  const handleRecordSaved = async () => {
    setRecordTarget(null)
    await weekState.reloadWeek()
    collections.refreshLoaded()
  }

  return {
    subdomain, termId, selectedTerm, termsLoading, tab, setTab, preparingId, prepare,
    recordTarget, setRecordTarget, handleRecordSaved, schemeDialogOpen, setSchemeDialogOpen,
    ...weekState, ...collections,
  }
}
