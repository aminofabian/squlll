'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import {
  fetchMyTests,
  filterScheduledTests,
  groupTestsByDate,
} from './studentTests'
import type { StudentTestApi } from './types'

export function useStudentExamTimetable(subdomain: string) {
  const [tests, setTests] = useState<StudentTestApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain) {
      setTests([])
      return
    }
    setError(null)
    try {
      const allTests = await fetchMyTests(subdomain)
      setTests(filterScheduledTests(allTests))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exam timetable')
      setTests([])
    }
  }, [subdomain])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void load().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [load])

  useDomainRealtime({
    onAssignmentPublished: () => {
      void load()
    },
    onExamPublished: () => {
      void load()
    },
  })

  const grouped = useMemo(() => groupTestsByDate(tests), [tests])

  return { tests, grouped, loading, error, refetch: load }
}
