'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import {
  fetchChildAssignmentGrades,
  type ChildAssignmentGrade,
} from './childAssignments'

export function useParentChildAssignments(
  subdomain: string,
  studentId: string | null,
) {
  const [assignments, setAssignments] = useState<ChildAssignmentGrade[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain || !studentId || studentId.startsWith('demo-')) {
      setAssignments([])
      return
    }
    setError(null)
    setLoading(true)
    try {
      const rows = await fetchChildAssignmentGrades(subdomain, studentId)
      setAssignments(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments')
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }, [subdomain, studentId])

  useEffect(() => {
    void load()
  }, [load])

  useDomainRealtime({
    onAssignmentGraded: (payload) => {
      if (payload.studentId === studentId) {
        void load()
      }
    },
  })

  return { assignments, loading, error, refetch: load }
}
