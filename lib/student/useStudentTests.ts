'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import { mapStudentTestToAssignment } from './mapStudentTest'
import {
  fetchMyTestCounts,
  fetchMyTests,
  fetchMyUpcomingTests,
} from './studentTests'
import type { StudentAssignmentItem, StudentTestCounts } from './types'

export function useStudentTests(subdomain: string) {
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([])
  const [counts, setCounts] = useState<StudentTestCounts>({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
  })
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain) {
      setAssignments([])
      setCounts({ total: 0, pending: 0, active: 0, completed: 0 })
      setUpcomingCount(0)
      return
    }
    setError(null)
    try {
      const [tests, testCounts, upcoming] = await Promise.all([
        fetchMyTests(subdomain),
        fetchMyTestCounts(subdomain),
        fetchMyUpcomingTests(subdomain),
      ])
      setAssignments(tests.map(mapStudentTestToAssignment))
      setCounts(testCounts)
      setUpcomingCount(upcoming.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments')
      setAssignments([])
      setCounts({ total: 0, pending: 0, active: 0, completed: 0 })
      setUpcomingCount(0)
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
    onAssignmentGraded: () => {
      void load()
    },
  })

  const pendingCount = useMemo(
    () => assignments.filter((a) => a.status !== 'submitted').length,
    [assignments],
  )

  return {
    assignments,
    counts,
    pendingCount,
    upcomingCount,
    loading,
    error,
    refetch: load,
  }
}
