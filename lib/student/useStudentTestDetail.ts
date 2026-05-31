'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchMyTestById } from './studentTests'
import type { StudentTestDetail } from './types'

export function useStudentTestDetail(
  subdomain: string,
  testId: string | null,
) {
  const [test, setTest] = useState<StudentTestDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain || !testId) {
      setTest(null)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const detail = await fetchMyTestById(subdomain, testId)
      setTest(detail)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load test details')
      setTest(null)
    } finally {
      setLoading(false)
    }
  }, [subdomain, testId])

  useEffect(() => {
    void load()
  }, [load])

  return { test, loading, error, refetch: load }
}
