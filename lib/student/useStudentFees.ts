'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime'
import {
  fetchMyFeeOverview,
  fetchMyPayments,
  fetchMyReceipts,
  type StudentFeeOverview,
  type StudentPaymentRecord,
  type StudentReceiptRecord,
} from './studentFees'

export function useStudentFeeOverview(subdomain: string) {
  const [overview, setOverview] = useState<StudentFeeOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain) return
    setError(null)
    setLoading(true)
    try {
      const data = await fetchMyFeeOverview(subdomain)
      setOverview(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fee balance')
      setOverview(null)
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

  return { overview, loading, error, refetch: load }
}

export function useStudentPayments(subdomain: string) {
  const [payments, setPayments] = useState<StudentPaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain) return
    setError(null)
    setLoading(true)
    try {
      const data = await fetchMyPayments(subdomain)
      setPayments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments')
      setPayments([])
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

  return { payments, loading, error, refetch: load }
}

export function useStudentReceipts(subdomain: string) {
  const [receipts, setReceipts] = useState<StudentReceiptRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!subdomain) return
    setError(null)
    setLoading(true)
    try {
      const data = await fetchMyReceipts(subdomain)
      setReceipts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load receipts')
      setReceipts([])
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

  return { receipts, loading, error, refetch: load }
}
