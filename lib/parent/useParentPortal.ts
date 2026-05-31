'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  fetchChildAttendanceRate,
  fetchChildFeeBalance,
  fetchMyChildren,
  getLast30DaysRange,
} from './parentPortal'
import { mapApiChildToPortalChild } from './mapParentChild'
import type { ParentFeeBalance, ParentPortalChild } from './types'
import { useParentLiveUpdates } from '@/lib/realtime/useParentLiveUpdates'

export function useParentPortal(subdomain: string, selectedChildIndex: number) {
  const [apiChildren, setApiChildren] = useState<
    Awaited<ReturnType<typeof fetchMyChildren>>
  >([])
  const [attendanceByStudentId, setAttendanceByStudentId] = useState<
    Record<string, number>
  >({})
  const [feeBalance, setFeeBalance] = useState<ParentFeeBalance | null>(null)
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

  const loadFeeBalance = useCallback(async () => {
    if (!subdomain || !selectedStudentId) {
      setFeeBalance(null)
      return
    }
    try {
      const balance = await fetchChildFeeBalance(subdomain, selectedStudentId)
      setFeeBalance(balance)
    } catch {
      setFeeBalance(null)
    }
  }, [subdomain, selectedStudentId])

  const refetchAll = useCallback(async () => {
    await loadChildren()
    await loadFeeBalance()
  }, [loadChildren, loadFeeBalance])

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
    void loadFeeBalance()
  }, [loadFeeBalance])

  useParentLiveUpdates({
    studentIds,
    gradeIds,
    selectedStudentId,
    onRefresh: refetchAll,
  })

  return {
    portalChildren,
    feeBalance,
    loading,
    error,
    refetchAll,
    hasRealChildren: apiChildren.length > 0,
  }
}
