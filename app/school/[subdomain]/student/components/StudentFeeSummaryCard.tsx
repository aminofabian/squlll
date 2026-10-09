'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, RefreshCw, Smartphone, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  formatStudentPaymentStatus,
  type StudentFeeOverview,
} from '@/lib/student/studentFees'
import { useMpesaCustodyAvailability } from '@/lib/student/useStudentFees'
import {
  Section,
  StatTile,
  StateMessage,
  StatusPill,
  type PillTone,
} from '../_ui'
import { StudentPayNowSheet } from './StudentPayNowSheet'
import { cn } from '@/lib/utils'

interface StudentFeeSummaryCardProps {
  overview: StudentFeeOverview | null
  loading?: boolean
  onRefresh?: () => void
  feesHref?: string
  compact?: boolean
  /** Needed to enable the inline M-Pesa pay button (hosts the pay sheet). */
  subdomain?: string
  /** Render the "Pay with M-Pesa" call to action when there is a balance. */
  showPay?: boolean
}

/** Payment status → pill tone. Emerald/amber/red stay reserved for money status. */
function paymentTone(status: string): PillTone {
  switch (status) {
    case 'CLEARED':
      return 'success'
    case 'PARTIAL':
      return 'warning'
    case 'IN_ARREARS':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function StudentFeeSummaryCard({
  overview,
  loading,
  onRefresh,
  feesHref = '/student/fees',
  compact = false,
  subdomain,
  showPay = false,
}: StudentFeeSummaryCardProps) {
  const [payOpen, setPayOpen] = useState(false)
  const { availability } = useMpesaCustodyAvailability(subdomain ?? '')

  const outstandingInvoices = overview?.outstandingInvoices ?? []
  const hasBalance = outstandingInvoices.length > 0
  const canPay = showPay && Boolean(subdomain) && Boolean(availability?.available) && hasBalance

  if (!overview && !loading) return null

  const status = overview?.paymentStatus

  const payButton = canPay ? (
    <div className="space-y-1.5">
      <Button
        size={compact ? 'sm' : 'default'}
        className={cn(
          'w-full gap-2 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700',
          compact && 'h-9',
        )}
        onClick={() => setPayOpen(true)}
      >
        <Smartphone className="h-4 w-4" />
        Pay fees with M-Pesa
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        An M-Pesa request goes to your phone — pay part or all of it.
      </p>
    </div>
  ) : null

  return (
    <>
      <Section
        icon={Wallet}
        title="Fee balance"
        padded={!compact}
        bodyClassName={compact ? 'p-3' : undefined}
        actions={
          <>
            {status ? (
              <StatusPill tone={paymentTone(status)}>
                {formatStudentPaymentStatus(status)}
              </StatusPill>
            ) : null}
            {onRefresh ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onRefresh}
                disabled={loading}
                aria-label="Refresh fee balance"
              >
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
          </>
        }
      >
        {loading && !overview ? (
          <StateMessage
            variant="loading"
            title="Loading fee balance…"
            className="py-6"
          />
        ) : overview ? (
          <div className="space-y-4">
            {compact ? (
              <div className="grid grid-cols-3 gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Billed
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-foreground">
                    KES {overview.totalBilled.toLocaleString()}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Paid
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    KES {overview.totalPaid.toLocaleString()}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Outstanding
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                    KES {overview.outstanding.toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                <StatTile
                  label="Total billed"
                  value={`KES ${overview.totalBilled.toLocaleString()}`}
                />
                <StatTile
                  label="Paid"
                  value={
                    <span className="text-emerald-600 dark:text-emerald-400">
                      KES {overview.totalPaid.toLocaleString()}
                    </span>
                  }
                />
                <StatTile
                  label="Outstanding"
                  value={
                    <span className="text-amber-600 dark:text-amber-400">
                      KES {overview.outstanding.toLocaleString()}
                    </span>
                  }
                />
              </div>
            )}

            {overview.creditBalance > 0 ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Credit balance: KES {overview.creditBalance.toLocaleString()}
              </p>
            ) : null}

            {!compact && overview.recentPayments.length > 0 ? (
              <div className="border-t border-border pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Recent payments
                </p>
                <ul className="space-y-1.5">
                  {overview.recentPayments.slice(0, 3).map((payment) => (
                    <li
                      key={payment.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate text-muted-foreground">
                        {payment.receiptNumber}
                      </span>
                      <span className="font-medium tabular-nums text-foreground">
                        KES {Number(payment.amount).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {payButton}
          </div>
        ) : null}
      </Section>

      {canPay && subdomain ? (
        <StudentPayNowSheet
          open={payOpen}
          onOpenChange={setPayOpen}
          subdomain={subdomain}
          invoices={outstandingInvoices}
          onSettled={onRefresh ?? (() => {})}
        />
      ) : null}
    </>
  )
}
