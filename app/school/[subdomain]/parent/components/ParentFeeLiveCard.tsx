'use client'

import { ChevronDown, ChevronUp, DollarSign, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  formatCurrency,
  formatParentPaymentStatus,
  parentPaymentStatusBadgeClass,
  type ParentChildFeeOverview,
} from '@/lib/parent/parentFees'
import { cn } from '@/lib/utils'

interface ParentFeeLiveCardProps {
  overview: ParentChildFeeOverview | null
  childName?: string
  loading?: boolean
  onRefresh?: () => void
}

export function ParentFeeLiveCard({
  overview,
  childName,
  loading,
  onRefresh,
}: ParentFeeLiveCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  if (!overview && !loading) return null

  const status = overview?.paymentStatus
  const items = overview?.balance.items ?? []

  return (
    <div className="mb-6 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Live fee balance{childName ? ` — ${childName}` : ''}
          </h3>
          {status ? (
            <Badge className={cn('text-xs', parentPaymentStatusBadgeClass(status))}>
              {formatParentPaymentStatus(status)}
            </Badge>
          ) : null}
        </div>
        {onRefresh ? (
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        ) : null}
      </div>

      {loading && !overview ? (
        <p className="text-sm text-slate-500">Loading fee balance…</p>
      ) : overview ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total billed
              </p>
              <p className="text-lg font-semibold tabular-nums">
                {formatCurrency(overview.totalBilled)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Paid</p>
              <p className="text-lg font-semibold tabular-nums text-emerald-700">
                {formatCurrency(overview.totalPaid)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Outstanding
              </p>
              <p className="text-lg font-semibold tabular-nums text-amber-700">
                {formatCurrency(overview.outstanding)}
              </p>
            </div>
          </div>

          {overview.creditBalance > 0 ? (
            <p className="mt-2 text-sm text-emerald-700">
              Credit balance: {formatCurrency(overview.creditBalance)}
            </p>
          ) : null}

          {items.length > 0 ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowBreakdown((v) => !v)}
                className="flex items-center gap-1 text-sm font-medium text-primary"
              >
                {showBreakdown ? (
                  <>
                    Hide breakdown <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show {items.length} fee items <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
              {showBreakdown ? (
                <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-emerald-200/60 bg-white/70 p-2 text-sm dark:border-emerald-900/40 dark:bg-slate-900/70">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 py-1"
                    >
                      <span className="truncate text-slate-700 dark:text-slate-300">
                        {item.itemName ?? item.bucketName}
                      </span>
                      <span className="shrink-0 font-medium tabular-nums text-amber-700">
                        {formatCurrency(item.balance)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {overview.recentPayments.length > 0 ? (
            <div className="mt-3 border-t border-emerald-200/60 pt-3 dark:border-emerald-900/40">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Recent payments
              </p>
              <ul className="space-y-1">
                {overview.recentPayments.slice(0, 3).map((payment) => (
                  <li
                    key={payment.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-600">{payment.receiptNumber}</span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(Number(payment.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
