'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCurrentStudent } from '@/lib/hooks/useCurrentStudent'
import { useCurrentAcademicYear } from '@/lib/hooks/useAcademicYears'
import { useActiveTerm } from '@/lib/hooks/useActiveTerm'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import {
  fetchStudentRanking,
  fetchStudentReportCard,
} from './studentReportCard'
import type { StudentRankingData, StudentReportCardData } from './types'

export function useStudentReportCard(subdomain: string) {
  const { student, loading: studentLoading, error: studentError } =
    useCurrentStudent()
  const { getActiveAcademicYear, loading: yearLoading } = useCurrentAcademicYear()
  const [reportCard, setReportCard] = useState<StudentReportCardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const academicYear = getActiveAcademicYear()?.name ?? null

  const load = useCallback(async () => {
    if (!subdomain || !student?.id || !academicYear) {
      setReportCard(null)
      return
    }
    setError(null)
    try {
      const data = await fetchStudentReportCard(subdomain, student.id, academicYear)
      setReportCard(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report card')
      setReportCard(null)
    }
  }, [subdomain, student?.id, academicYear])

  useEffect(() => {
    if (studentLoading || yearLoading) return
    let cancelled = false
    setLoading(true)
    void load().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [load, studentLoading, yearLoading])

  useDomainRealtime({
    onExamResultsReleased: () => {
      void load()
    },
  })

  return {
    student,
    reportCard,
    academicYear,
    loading: studentLoading || yearLoading || loading,
    error: studentError ?? error,
    refetch: load,
  }
}

export function useStudentPerformance(subdomain: string) {
  const { student, loading: studentLoading, error: studentError } =
    useCurrentStudent()
  const { getActiveAcademicYear, loading: yearLoading } = useCurrentAcademicYear()
  const { activeTerm, loading: termLoading } = useActiveTerm()
  const [reportCard, setReportCard] = useState<StudentReportCardData | null>(null)
  const [ranking, setRanking] = useState<StudentRankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const academicYear = getActiveAcademicYear()?.name ?? null
  const term = useMemo(() => {
    const match = activeTerm?.name?.match(/\d+/)
    return match ? Number(match[0]) : 1
  }, [activeTerm?.name])

  const load = useCallback(async () => {
    if (!subdomain || !student?.id || !academicYear) {
      setReportCard(null)
      setRanking(null)
      return
    }
    setError(null)
    try {
      const [card, rank] = await Promise.all([
        fetchStudentReportCard(subdomain, student.id, academicYear),
        fetchStudentRanking(subdomain, student.id, academicYear, term).catch(() => null),
      ])
      setReportCard(card)
      setRanking(rank)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data')
      setReportCard(null)
      setRanking(null)
    }
  }, [subdomain, student?.id, academicYear, term])

  useEffect(() => {
    if (studentLoading || yearLoading || termLoading) return
    let cancelled = false
    setLoading(true)
    void load().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [load, studentLoading, yearLoading, termLoading])

  useDomainRealtime({
    onExamResultsReleased: () => {
      void load()
    },
  })

  return {
    student,
    reportCard,
    ranking,
    academicYear,
    term,
    termName: activeTerm?.name ?? null,
    loading: studentLoading || yearLoading || termLoading || loading,
    error: studentError ?? error,
    refetch: load,
  }
}
