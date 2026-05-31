'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCurrentStudent } from '@/lib/hooks/useCurrentStudent'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import { fetchStudentMarks } from './studentMarks'
import { groupMarksIntoSessions } from './mapExamSessions'
import type { StudentExamSession } from './types'

export function useStudentExamResults(subdomain: string) {
  const { student, loading: studentLoading, error: studentError } =
    useCurrentStudent()
  const [sessions, setSessions] = useState<StudentExamSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMarks = useCallback(async () => {
    if (!subdomain || !student?.id) {
      setSessions([])
      return
    }
    setError(null)
    try {
      const marks = await fetchStudentMarks(subdomain, student.id)
      setSessions(groupMarksIntoSessions(marks))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exam results')
      setSessions([])
    }
  }, [subdomain, student?.id])

  useEffect(() => {
    if (studentLoading) return
    let cancelled = false
    setLoading(true)
    void loadMarks().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [loadMarks, studentLoading])

  useDomainRealtime({
    onExamResultsReleased: () => {
      void loadMarks()
    },
  })

  const combinedError = useMemo(
    () => studentError ?? error,
    [studentError, error],
  )

  return {
    student,
    sessions,
    loading: studentLoading || loading,
    error: combinedError,
    refetch: loadMarks,
  }
}
