'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import { fetchMyAssignments, type TeacherAssignment } from './teacherAssignments'

export function useTeacherAssignments() {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const rows = await fetchMyAssignments()
      setAssignments(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments')
      setAssignments([])
    }
  }, [])

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
    onAssignmentSubmitted: () => {
      void load()
    },
    onAssignmentGraded: () => {
      void load()
    },
  })

  return { assignments, loading, error, refetch: load }
}
