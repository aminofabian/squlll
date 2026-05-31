'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import {
  fetchMyAttendanceSummary,
  type StudentAttendanceSummary,
} from './studentAttendance'

export function useStudentAttendanceSummary(subdomain: string) {
  const [summary, setSummary] = useState<StudentAttendanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain) return
    setError(null)
    setLoading(true)
    try {
      const data = await fetchMyAttendanceSummary(subdomain)
      setSummary(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load attendance',
      )
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [subdomain])

  useEffect(() => {
    void load()
  }, [load])

  useDomainRealtime({
    onAttendanceRegisterSubmitted: () => {
      void load()
    },
  })

  return { summary, loading, error, refetch: load }
}
