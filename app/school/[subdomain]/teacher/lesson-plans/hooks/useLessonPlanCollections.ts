import { useEffect, useState } from 'react'
import {
  fetchMyLessonPlans,
  fetchMySchemesOfWork,
  type LessonPlan,
  type SchemeOfWork,
} from '@/lib/lesson-planning/api'
import type { PlannerTab } from '../constants/plannerTabs'

export function useLessonPlanCollections(subdomain: string, termId: string | undefined, tab: PlannerTab) {
  const [plans, setPlans] = useState<LessonPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [schemes, setSchemes] = useState<SchemeOfWork[]>([])
  const [schemesLoading, setSchemesLoading] = useState(false)

  useEffect(() => {
    if (!subdomain || !termId) return
    if (tab === 'plans' && plans.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlansLoading(true)
      fetchMyLessonPlans(subdomain, termId)
        .then(setPlans)
        .catch(() => setPlans([]))
        .finally(() => setPlansLoading(false))
    }
    if (tab === 'schemes' && schemes.length === 0) {
      setSchemesLoading(true)
      fetchMySchemesOfWork(subdomain, termId)
        .then(setSchemes)
        .catch(() => setSchemes([]))
        .finally(() => setSchemesLoading(false))
    }
  }, [tab, subdomain, termId, plans.length, schemes.length])

  const refreshLoaded = () => {
    if (!termId) return
    if (plans.length) void fetchMyLessonPlans(subdomain, termId).then(setPlans).catch(() => undefined)
    if (schemes.length) void fetchMySchemesOfWork(subdomain, termId).then(setSchemes).catch(() => undefined)
  }

  return { plans, plansLoading, schemes, schemesLoading, refreshLoaded }
}
