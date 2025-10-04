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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-mono uppercase tracking-wide text-[var(--color-text)]">Recent Payments</Label>
        {isLoading && <span className="text-xs text-[var(--color-textSecondary)] font-mono">Loading…</span>}
        {error && <span className="text-xs text-[var(--color-error)] font-mono">{error}</span>}
      </div>
      
      {payments.length === 0 && !isLoading && (
        <div className="text-xs text-[var(--color-textSecondary)] font-mono">No payments found.</div>
      )}
      
      {/* Payment Grid - One item per row, responsive wrapping */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
        {payments.map((p) => (
          <Card key={p.id} className="p-4 border-2 border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-colors">
            <div className="flex flex-col space-y-3">
              {/* Student Info */}
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono font-medium text-[var(--color-text)] truncate">
                    {p.student.user.name}
                  </div>
                  <div className="text-xs text-[var(--color-textSecondary)] font-mono">
                    {p.student.admission_number}
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className="font-mono text-xs bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20 flex-shrink-0"
                >
                  {p.paymentMethod}
                </Badge>
              </div>
              
              {/* Payment Details */}
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[var(--color-textSecondary)] font-mono">
                    Receipt {p.receiptNumber}
                  </div>
                  <div className="text-xs text-[var(--color-textSecondary)] font-mono">
                    Invoice {p.invoice.invoiceNumber}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-sm font-semibold text-[var(--color-success)]">
                    KES {p.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-[var(--color-textSecondary)] font-mono">
                    {new Date(p.paymentDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}


