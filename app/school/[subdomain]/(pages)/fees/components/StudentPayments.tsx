'use client'

import React, { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { usePaymentsQuery } from '../hooks/useGraphQLPayments'

interface StudentPaymentsProps {
  studentId: string | null
}

export default function StudentPayments({ studentId }: StudentPaymentsProps) {
  const { payments, isLoading, error, fetchPayments } = usePaymentsQuery()

  useEffect(() => {
    if (studentId) {
      fetchPayments({ studentId })
    }
  }, [studentId])

  if (!studentId) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-mono uppercase tracking-wide text-slate-700">Recent Payments</Label>
        {isLoading && <span className="text-xs text-slate-500 font-mono">Loading…</span>}
        {error && <span className="text-xs text-red-600 font-mono">{error}</span>}
      </div>
      <div className="space-y-2">
        {payments.length === 0 && !isLoading && (
          <div className="text-xs text-slate-500 font-mono">No payments found.</div>
        )}
        {payments.map((p) => (
          <Card key={p.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-mono font-medium">{p.student.user.name} • {p.student.admission_number}</div>
              <div className="text-xs text-slate-500 font-mono">Receipt {p.receiptNumber} • Invoice {p.invoice.invoiceNumber}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">{p.paymentMethod}</Badge>
              <div className="font-mono text-sm">KES {p.amount.toLocaleString()}</div>
              <div className="text-xs text-slate-500 font-mono">{new Date(p.paymentDate).toLocaleDateString()}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}


