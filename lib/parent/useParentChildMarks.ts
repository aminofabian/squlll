'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchStudentMarks } from '@/lib/student/studentMarks'
import { groupMarksIntoSessions } from '@/lib/student/mapExamSessions'
import type { StudentExamSession } from '@/lib/student/types'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'

export function useParentChildMarks(
  subdomain: string,
  studentId: string | null,
) {
  const [sessions, setSessions] = useState<StudentExamSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain || !studentId || studentId.startsWith('demo-')) {
      setSessions([])
      return
    }
    setError(null)
    setLoading(true)
    try {
      const marks = await fetchStudentMarks(subdomain, studentId)
      setSessions(groupMarksIntoSessions(marks))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load grades')
      setSessions([])
    } finally {
      setLoading(false)
    }
  }, [subdomain, studentId])

  useEffect(() => {
    void load()
  }, [load])

  useDomainRealtime({
    onExamResultsReleased: (payload) => {
      if (payload.studentId === studentId) void load()
    },
  })

  return { sessions, loading, error, refetch: load }
}
