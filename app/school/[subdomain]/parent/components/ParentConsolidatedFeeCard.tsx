'use client'

import { DollarSign, RefreshCw, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  formatCurrency,
  formatParentPaymentStatus,
  parentPaymentStatusBadgeClass,
  type ParentConsolidatedFees,
} from '@/lib/parent/parentFees'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface ParentConsolidatedFeeCardProps {
  summary: ParentConsolidatedFees | null
  loading?: boolean
  onRefresh?: () => void
  onSelectChild?: (studentId: string) => void
}

export function ParentConsolidatedFeeCard({
  summary,
  loading,
  onRefresh,
  onSelectChild,
}: ParentConsolidatedFeeCardProps) {
  if (!summary && !loading) return null

  const multipleChildren = (summary?.children.length ?? 0) > 1

  return (
    <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {multipleChildren ? 'Household fee summary' : 'Fee summary'}
          </h3>
          {multipleChildren ? (
            <Users className="h-4 w-4 text-slate-500" />
          ) : null}
        </div>
        {onRefresh ? (
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        ) : null}
      </div>

      {loading && !summary ? (
        <p className="text-sm text-slate-500">Loading fees…</p>
      ) : summary ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total billed
              </p>
              <p className="text-lg font-semibold tabular-nums">
                {formatCurrency(summary.totalBilled)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Paid</p>
              <p className="text-lg font-semibold tabular-nums text-emerald-700">
                {formatCurrency(summary.totalPaid)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Outstanding
              </p>
              <p className="text-lg font-semibold tabular-nums text-amber-700">
                {formatCurrency(summary.totalOutstanding)}
              </p>
            </div>
          </div>

          {summary.totalCredit > 0 ? (
            <p className="mt-2 text-sm text-emerald-700">
              Total credit: {formatCurrency(summary.totalCredit)}
            </p>
          ) : null}

          {multipleChildren ? (
            <div className="mt-4 space-y-2 border-t border-emerald-200/60 pt-3 dark:border-emerald-900/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Per child
              </p>
              {summary.children.map((child) => (
                <button
                  key={child.studentId}
                  type="button"
                  onClick={() => onSelectChild?.(child.studentId)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-left text-sm transition hover:border-primary/30 dark:border-slate-700 dark:bg-slate-900/80"
                >
                  <span className="font-medium">{child.studentName ?? 'Child'}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        'text-xs',
                        parentPaymentStatusBadgeClass(child.paymentStatus),
                      )}
                    >
                      {formatParentPaymentStatus(child.paymentStatus)}
                    </Badge>
                    <span className="font-semibold tabular-nums text-amber-700">
                      {formatCurrency(child.outstanding)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
