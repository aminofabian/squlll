'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  fetchChildAttendanceDetails,
  getLast30DaysRange,
} from './parentPortal'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'

export interface ParentAttendanceRecord {
  id: string
  date: string
  status: string
}

export function useParentAttendanceDetails(
  subdomain: string,
  studentId: string | null,
) {
  const [records, setRecords] = useState<ParentAttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain || !studentId || studentId.startsWith('demo-')) {
      setRecords([])
      return
    }
    setError(null)
    setLoading(true)
    try {
      const { startDate, endDate } = getLast30DaysRange()
      const rows = await fetchChildAttendanceDetails(
        subdomain,
        studentId,
        startDate,
        endDate,
      )
      setRecords(
        rows
          .map((r) => ({ id: r.id, date: r.date, status: r.status }))
          .sort((a, b) => b.date.localeCompare(a.date)),
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load attendance',
      )
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [subdomain, studentId])

  useEffect(() => {
    void load()
  }, [load])

  useDomainRealtime({
    onAttendanceRegisterSubmitted: () => {
      void load()
    },
  })

  return { records, loading, error, refetch: load }
}
