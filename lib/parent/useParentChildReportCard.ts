'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCurrentAcademicYear } from '@/lib/hooks/useAcademicYears'
import { useActiveTerm } from '@/lib/hooks/useActiveTerm'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import {
  fetchChildReportCard,
  type ParentReportCardData,
} from './childReportCard'

export function useParentChildReportCard(
  subdomain: string,
  studentId: string | null,
) {
  const { getActiveAcademicYear, loading: yearLoading } = useCurrentAcademicYear()
  const { activeTerm, loading: termLoading } = useActiveTerm()
  const [reportCard, setReportCard] = useState<ParentReportCardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const academicYear = getActiveAcademicYear()?.name ?? null
  const term = useMemo(() => {
    const match = activeTerm?.name?.match(/\d+/)
    return match ? Number(match[0]) : 1
  }, [activeTerm?.name])

  const load = useCallback(async () => {
    if (!subdomain || !studentId || studentId.startsWith('demo-') || !academicYear) {
      setReportCard(null)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const data = await fetchChildReportCard(subdomain, studentId, term, academicYear)
      setReportCard(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report card')
      setReportCard(null)
    } finally {
      setLoading(false)
    }
  }, [subdomain, studentId, term, academicYear])

  useEffect(() => {
    if (yearLoading || termLoading) return
    void load()
  }, [load, yearLoading, termLoading])

  useDomainRealtime({
    onExamResultsReleased: (payload) => {
      if (payload.studentId === studentId) {
        void load()
      }
    },
  })

  return {
    reportCard,
    academicYear,
    term,
    loading: yearLoading || termLoading || loading,
    error,
    refetch: load,
  }
}
