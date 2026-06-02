'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Loader2, RotateCcw } from 'lucide-react'
import { usePaymentsQuery } from '../hooks/useGraphQLPayments'
import { useVoidPayment } from '../hooks/useVoidPayment'

interface StudentPaymentsProps {
  studentId: string | null
  canVoid?: boolean
  onPaymentVoided?: (paymentId: string, reason: string) => void
}

export default function StudentPayments({
  studentId,
  canVoid = false,
  onPaymentVoided,
}: StudentPaymentsProps) {
  const { payments, isLoading, error, fetchPayments } = usePaymentsQuery()
  const { voidPayment, isVoiding } = useVoidPayment()
  const [voidTarget, setVoidTarget] = useState<{ id: string; receipt: string } | null>(null)
  const [voidReason, setVoidReason] = useState('')

  useEffect(() => {
    if (studentId) {
      fetchPayments({ studentId })
    }
  }, [studentId, fetchPayments])

  const handleConfirmVoid = async () => {
    if (!voidTarget || !voidReason.trim()) return
    const ok = await voidPayment(voidTarget.id, voidReason.trim())
    if (ok) {
      onPaymentVoided?.(voidTarget.id, voidReason.trim())
      setVoidTarget(null)
      setVoidReason('')
      fetchPayments({ studentId: studentId! })
    }
  }

  if (!studentId) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Payments
        </Label>
        {isLoading && (
          <span className="text-xs text-slate-500">Loading…</span>
        )}
        {error && (
          <span className="text-xs text-rose-600">{error}</span>
        )}
      </div>

      {payments.length === 0 && !isLoading && (
        <div className="text-xs text-slate-500 py-4 text-center border border-dashed border-slate-200 rounded-lg">
          No payments found.
        </div>
      )}

      <div className="space-y-2">
        {payments.map((p) => (
          <Card
            key={p.id}
            className="p-4 border border-slate-200"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-900">
                    KES {p.amount.toLocaleString()}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {formatMethod(p.paymentMethod)}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Receipt {p.receiptNumber} · Invoice {p.invoice.invoiceNumber}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(p.paymentDate).toLocaleString()}
                </p>
              </div>
              {canVoid && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() =>
                    setVoidTarget({ id: p.id, receipt: p.receiptNumber })
                  }
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reverse
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!voidTarget}
        onOpenChange={(open) => !open && setVoidTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reverse payment</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            This voids receipt {voidTarget?.receipt}. The original entry stays in
            the audit trail; the invoice balance will be updated.
          </p>
          <Input
            placeholder="Reason for reversal (required)"
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoidTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmVoid}
              disabled={!voidReason.trim() || isVoiding}
            >
              {isVoiding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Confirm reversal'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatMethod(method: string): string {
  const m = (method || '').toUpperCase()
  if (m === 'MPESA') return 'M-Pesa'
  if (m === 'CASH') return 'Cash'
  if (m === 'BANK') return 'Bank'
  if (m === 'CHEQUE') return 'Cheque'
  return method
}
