'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import {
  fetchChildFeeOverview,
  fetchChildPaymentHistory,
  fetchChildReceipts,
  fetchMyChildrenFeeSummary,
  type ParentChildFeeOverview,
  type ParentConsolidatedFees,
  type ParentPaymentRecord,
  type ParentReceiptRecord,
} from './parentFees'

export function useParentConsolidatedFees(subdomain: string) {
  const [summary, setSummary] = useState<ParentConsolidatedFees | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain) return
    setError(null)
    setLoading(true)
    try {
      const data = await fetchMyChildrenFeeSummary(subdomain)
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fee summary')
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [subdomain])

  useEffect(() => {
    void load()
  }, [load])

  useDomainRealtime({
    onFeePaymentUpdated: () => {
      void load()
    },
  })

  return { summary, loading, error, refetch: load }
}

export function useParentChildFeeOverview(
  subdomain: string,
  studentId: string | null,
) {
  const [overview, setOverview] = useState<ParentChildFeeOverview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain || !studentId) {
      setOverview(null)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const data = await fetchChildFeeOverview(subdomain, studentId)
      setOverview(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fees')
      setOverview(null)
    } finally {
      setLoading(false)
    }
  }, [subdomain, studentId])

  useEffect(() => {
    void load()
  }, [load])

  useDomainRealtime({
    onFeePaymentUpdated: (payload) => {
      if (studentId && payload.studentId === studentId) {
        void load()
      }
    },
  })

  return { overview, loading, error, refetch: load }
}

export function useParentChildPayments(
  subdomain: string,
  studentId: string | null,
) {
  const [payments, setPayments] = useState<ParentPaymentRecord[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!subdomain || !studentId) {
      setPayments([])
      return
    }
    setLoading(true)
    try {
      const data = await fetchChildPaymentHistory(subdomain, studentId)
      setPayments(data)
    } catch {
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [subdomain, studentId])

  useEffect(() => {
    void load()
  }, [load])

  useDomainRealtime({
    onFeePaymentUpdated: (payload) => {
      if (studentId && payload.studentId === studentId) {
        void load()
      }
    },
  })

  return { payments, loading, refetch: load }
}

export function useParentChildReceipts(
  subdomain: string,
  studentId: string | null,
) {
  const [receipts, setReceipts] = useState<ParentReceiptRecord[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!subdomain || !studentId) {
      setReceipts([])
      return
    }
    setLoading(true)
    try {
      const data = await fetchChildReceipts(subdomain, studentId)
      setReceipts(data)
    } catch {
      setReceipts([])
    } finally {
      setLoading(false)
    }
  }, [subdomain, studentId])

  useEffect(() => {
    void load()
  }, [load])

  useDomainRealtime({
    onFeePaymentUpdated: (payload) => {
      if (studentId && payload.studentId === studentId) {
        void load()
      }
    },
  })

  return { receipts, loading, refetch: load }
}
