'use client'

import { DollarSign, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ParentFeeBalance } from '@/lib/parent/types'

interface ParentFeeLiveCardProps {
  balance: ParentFeeBalance | null
  childName?: string
  loading?: boolean
  onRefresh?: () => void
}

export function ParentFeeLiveCard({
  balance,
  childName,
  loading,
  onRefresh,
}: ParentFeeLiveCardProps) {
  if (!balance && !loading) return null

  return (
    <div className="mb-6 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Live fee balance{childName ? ` — ${childName}` : ''}
          </h3>
        </div>
        {onRefresh ? (
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        ) : null}
      </div>

      {loading && !balance ? (
        <p className="text-sm text-slate-500">Loading fee balance…</p>
      ) : balance ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Total due</p>
            <p className="text-lg font-semibold tabular-nums">
              {balance.totalDue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Paid</p>
            <p className="text-lg font-semibold tabular-nums text-emerald-700">
              {balance.totalPaid.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Outstanding</p>
            <p className="text-lg font-semibold tabular-nums text-amber-700">
              {balance.feesOwed.toLocaleString()}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
