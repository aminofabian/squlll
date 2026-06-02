'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  fetchChildAttendanceRate,
  fetchMyChildren,
  getLast30DaysRange,
} from './parentPortal'
import { fetchMyChildrenFeeSummary } from './parentFees'
import type { ParentConsolidatedFees } from './parentFees'
import { mapApiChildToPortalChild } from './mapParentChild'
import type { ParentPortalChild } from './types'
import { useParentLiveUpdates } from '@/lib/realtime/useParentLiveUpdates'

export function useParentPortal(subdomain: string, selectedChildIndex: number) {
  const [apiChildren, setApiChildren] = useState<
    Awaited<ReturnType<typeof fetchMyChildren>>
  >([])
  const [attendanceByStudentId, setAttendanceByStudentId] = useState<
    Record<string, number>
  >({})
  const [consolidatedFees, setConsolidatedFees] =
    useState<ParentConsolidatedFees | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selectedStudentId = apiChildren[selectedChildIndex]?.id ?? null

  const portalChildren: ParentPortalChild[] = useMemo(
    () =>
      apiChildren.map((child, index) =>
        mapApiChildToPortalChild(
          child,
          index,
          attendanceByStudentId[child.id] ?? 0,
        ),
      ),
    [apiChildren, attendanceByStudentId],
  )

  const studentIds = useMemo(
    () => apiChildren.map((c) => c.id),
    [apiChildren],
  )

  const gradeIds = useMemo(
    () => apiChildren.map((c) => c.grade.id),
    [apiChildren],
  )

  const loadChildren = useCallback(async () => {
    if (!subdomain) return
    setError(null)
    try {
      const children = await fetchMyChildren(subdomain)
      setApiChildren(children)

      const { startDate, endDate } = getLast30DaysRange()
      const rates: Record<string, number> = {}
      await Promise.all(
        children.map(async (child) => {
          try {
            rates[child.id] = await fetchChildAttendanceRate(
              subdomain,
              child.id,
              startDate,
              endDate,
            )
          } catch {
            rates[child.id] = 0
          }
        }),
      )
      setAttendanceByStudentId(rates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load children')
      setApiChildren([])
    }
  }, [subdomain])

  const loadConsolidatedFees = useCallback(async () => {
    if (!subdomain) return
    try {
      const summary = await fetchMyChildrenFeeSummary(subdomain)
      setConsolidatedFees(summary)
    } catch {
      setConsolidatedFees(null)
    }
  }, [subdomain])

  const refetchAll = useCallback(async () => {
    await loadChildren()
    await loadConsolidatedFees()
  }, [loadChildren, loadConsolidatedFees])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void loadChildren().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [loadChildren])

  useEffect(() => {
    void loadConsolidatedFees()
  }, [loadConsolidatedFees])

  useParentLiveUpdates({
    studentIds,
    gradeIds,
    selectedStudentId,
    onRefresh: refetchAll,
  })

  return {
    portalChildren,
    consolidatedFees,
    loading,
    error,
    refetchAll,
    hasRealChildren: apiChildren.length > 0,
  }
}
