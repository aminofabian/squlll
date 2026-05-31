'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import {
  fetchTestSubmissions,
  gradeTestSubmission,
  type TeacherTestSubmission,
} from './testSubmissions'

export function useTeacherTestSubmissions(testId: string, maxMarks: number) {
  const [submissions, setSubmissions] = useState<TeacherTestSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gradingId, setGradingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!testId) {
      setSubmissions([])
      return
    }
    setError(null)
    try {
      const rows = await fetchTestSubmissions(testId)
      setSubmissions(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions')
      setSubmissions([])
    }
  }, [testId])

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
    onAssignmentSubmitted: (payload) => {
      if (payload.testId === testId) {
        void load()
      }
    },
  })

  const grade = useCallback(
    async (submissionId: string, gradeValue: number, feedback?: string) => {
      if (gradeValue < 0 || gradeValue > maxMarks) {
        throw new Error(`Grade must be between 0 and ${maxMarks}`)
      }
      setGradingId(submissionId)
      try {
        await gradeTestSubmission({ submissionId, grade: gradeValue, feedback })
        await load()
      } finally {
        setGradingId(null)
      }
    },
    [load, maxMarks],
  )

  return {
    submissions,
    loading,
    error,
    gradingId,
    refetch: load,
    grade,
  }
}
