'use client'

import Link from 'next/link'
import { ArrowRight, DollarSign, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  formatStudentPaymentStatus,
  paymentStatusBadgeClass,
  type StudentFeeOverview,
} from '@/lib/student/studentFees'
import { cn } from '@/lib/utils'

interface StudentFeeSummaryCardProps {
  overview: StudentFeeOverview | null
  loading?: boolean
  onRefresh?: () => void
  feesHref?: string
  compact?: boolean
}

export function StudentFeeSummaryCard({
  overview,
  loading,
  onRefresh,
  feesHref = '/student/fees',
  compact = false,
}: StudentFeeSummaryCardProps) {
  if (!overview && !loading) return null

  const status = overview?.paymentStatus

  return (
    <div
      className={cn(
        'rounded-xl border border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20',
        compact ? 'p-3' : 'p-4',
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Fee balance
          </h3>
          {status ? (
            <Badge className={cn('text-xs', paymentStatusBadgeClass(status))}>
              {formatStudentPaymentStatus(status)}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {onRefresh ? (
            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          ) : null}
          {feesHref ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href={feesHref}>
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
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
                KES {overview.totalBilled.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Paid</p>
              <p className="text-lg font-semibold tabular-nums text-emerald-700">
                KES {overview.totalPaid.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Outstanding
              </p>
              <p className="text-lg font-semibold tabular-nums text-amber-700">
                KES {overview.outstanding.toLocaleString()}
              </p>
            </div>
          </div>

          {overview.creditBalance > 0 ? (
            <p className="mt-2 text-sm text-emerald-700">
              Credit balance: KES {overview.creditBalance.toLocaleString()}
            </p>
          ) : null}

          {!compact && overview.recentPayments.length > 0 ? (
            <div className="mt-4 border-t border-emerald-200/60 pt-3 dark:border-emerald-900/40">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Recent payments
              </p>
              <ul className="space-y-1.5">
                {overview.recentPayments.slice(0, 3).map((payment) => (
                  <li
                    key={payment.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-600">
                      {payment.receiptNumber}
                    </span>
                    <span className="font-medium tabular-nums">
                      KES {Number(payment.amount).toLocaleString()}
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
