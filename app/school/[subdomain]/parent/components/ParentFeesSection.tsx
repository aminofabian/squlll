'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, Loader2, RefreshCw, Wallet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useParentChildFeeOverview,
  useParentChildPayments,
  useParentChildReceipts,
} from '@/lib/parent/useParentFees'
import {
  downloadPdfDataUrl,
  fetchChildReceiptPdf,
  formatCurrency,
  formatFeeDate,
  formatFeeMonthGroup,
  type ParentConsolidatedFees,
  type ParentPaymentRecord,
} from '@/lib/parent/parentFees'
import type { ParentPortalChild } from '@/lib/parent/types'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { ParentMakePaymentSheet } from './ParentMakePaymentSheet'
import {
  feesDocument,
  feesEyebrow,
  feesMuted,
  feesPageCanvas,
  feesSurface,
  FeesBucketLedger,
  FeesChildSelector,
  FeesCompactNav,
  FeesHouseholdBanner,
  FeesPaymentTimeline,
  FeesRecordsEmpty,
  FeesSectionBlock,
  FeesStatementHero,
  FeesStatusNote,
  FeesStructureRow,
  groupFeeItems,
} from './parent-fees-premium'

interface ParentFeesSectionProps {
  subdomain: string
  children: ParentPortalChild[]
  selectedChild: number
  onSelectChild?: (index: number) => void
  consolidatedFees?: ParentConsolidatedFees | null
}

type BreakdownFilter = 'all' | 'due' | 'settled'

function groupPaymentsByMonth(payments: ParentPaymentRecord[]) {
  const groups = new Map<string, ParentPaymentRecord[]>()
  for (const payment of payments) {
    const key = formatFeeMonthGroup(payment.paymentDate)
    const list = groups.get(key) ?? []
    list.push(payment)
    groups.set(key, list)
  }
  return Array.from(groups.entries())
}

export function ParentFeesSection({
  subdomain,
  children,
  selectedChild,
  onSelectChild,
  consolidatedFees,
}: ParentFeesSectionProps) {
  const { toast } = useToast()
  const recordsRef = useRef<HTMLDivElement>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [breakdownFilter, setBreakdownFilter] = useState<BreakdownFilter>('due')
  const [breakdownSearch, setBreakdownSearch] = useState('')
  const [plansClearedOpen, setPlansClearedOpen] = useState(false)
  const [recordsTab, setRecordsTab] = useState<'payments' | 'receipts'>('payments')
  const [paySheetOpen, setPaySheetOpen] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null)

  const activeStudentId = children[selectedChild]?.studentId ?? null
  const activeChildName = children[selectedChild]?.name

  const householdOutstanding = consolidatedFees?.totalOutstanding ?? 0
  const owingChildCount =
    consolidatedFees?.children.filter((c) => c.outstanding > 0).length ?? 0

  const childFeeByStudentId = useMemo(() => {
    const map = new Map<string, { outstanding: number }>()
    for (const c of consolidatedFees?.children ?? []) {
      map.set(c.studentId, { outstanding: c.outstanding })
    }
    return map
  }, [consolidatedFees?.children])

  const { overview, loading, error, refetch } = useParentChildFeeOverview(
    subdomain,
    activeStudentId,
  )
  const {
    payments,
    loading: paymentsLoading,
    refetch: refetchPayments,
  } = useParentChildPayments(subdomain, activeStudentId)
  const {
    receipts,
    loading: receiptsLoading,
    refetch: refetchReceipts,
  } = useParentChildReceipts(subdomain, activeStudentId)

  const groupedItems = useMemo(
    () => groupFeeItems(overview?.balance.items ?? []),
    [overview?.balance.items],
  )

  const outstandingItems = useMemo(
    () => groupedItems.filter((i) => i.balance > 0),
    [groupedItems],
  )

  const settledItems = useMemo(
    () => groupedItems.filter((i) => i.balance <= 0),
    [groupedItems],
  )

  const filteredBreakdown = useMemo(() => {
    let list = groupedItems
    if (breakdownFilter === 'due') list = outstandingItems
    if (breakdownFilter === 'settled') list = settledItems
    const q = breakdownSearch.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (item) =>
        (item.itemName ?? '').toLowerCase().includes(q) ||
        item.bucketName.toLowerCase().includes(q),
    )
  }, [
    groupedItems,
    outstandingItems,
    settledItems,
    breakdownFilter,
    breakdownSearch,
  ])

  const plansDue = useMemo(
    () => (overview?.byPlan ?? []).filter((p) => p.arrears > 0),
    [overview?.byPlan],
  )
  const plansCleared = useMemo(
    () =>
      (overview?.byPlan ?? []).filter((p) => p.arrears <= 0 && p.totalBilled > 0),
    [overview?.byPlan],
  )

  const paymentsByMonth = useMemo(() => groupPaymentsByMonth(payments), [payments])

  const totalDueInBreakdown = useMemo(
    () => outstandingItems.reduce((s, i) => s + i.balance, 0),
    [outstandingItems],
  )

  const canRecordPayment = Boolean(
    overview && overview.outstanding > 0 && activeStudentId,
  )

  useEffect(() => {
    setBreakdownSearch('')
    setBreakdownFilter(outstandingItems.length > 0 ? 'due' : 'all')
  }, [activeStudentId, outstandingItems.length])

  useEffect(() => {
    if (!paymentSuccess) return
    const t = window.setTimeout(() => setPaymentSuccess(null), 8000)
    return () => window.clearTimeout(t)
  }, [paymentSuccess])

  const openPaySheet = () => setPaySheetOpen(true)

  const handleRefreshAll = () => {
    void refetch()
    void refetchPayments()
    void refetchReceipts()
  }

  const scrollToRecords = () => {
    recordsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setRecordsTab('payments')
  }

  const handleDownloadReceipt = async (paymentId: string, receiptNumber: string) => {
    if (!activeStudentId) return
    setDownloadingId(paymentId)
    try {
      const dataUrl = await fetchChildReceiptPdf(
        subdomain,
        activeStudentId,
        paymentId,
      )
      downloadPdfDataUrl(dataUrl, `${receiptNumber}.pdf`)
      toast({ title: 'Receipt downloaded' })
    } catch (err) {
      toast({
        title: 'Download failed',
        description: err instanceof Error ? err.message : 'Could not generate receipt',
        variant: 'destructive',
      })
    } finally {
      setDownloadingId(null)
    }
  }

  const handleCopyReceipt = async (receiptNumber: string) => {
    try {
      await navigator.clipboard.writeText(receiptNumber)
      toast({ title: 'Copied' })
    } catch {
      toast({ title: 'Could not copy', variant: 'destructive' })
    }
  }

  const handlePaymentSuccess = (receiptNumber?: string) => {
    handleRefreshAll()
    if (receiptNumber) {
      setPaymentSuccess(receiptNumber)
      scrollToRecords()
    }
    toast({
      title: 'Payment recorded',
      description: receiptNumber
        ? `Receipt ${receiptNumber} — finance will verify your payment.`
        : 'Finance will verify and issue a receipt.',
    })
  }

  const isRefreshing = loading || paymentsLoading || receiptsLoading

  return (
    <div
      className={cn(
        feesPageCanvas,
        canRecordPayment && 'pb-24 lg:pb-3',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className={feesEyebrow}>Fees & payments</p>
          <h1 className="truncate text-sm font-semibold text-slate-900">
            {activeChildName ?? 'Statement'}
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAll}
          disabled={isRefreshing}
          className="h-7 shrink-0 gap-1 px-2 text-[10px]"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
          Sync
        </Button>
      </div>

      {children.length > 1 ? (
        <>
          <FeesHouseholdBanner
            totalOutstanding={householdOutstanding}
            childCount={owingChildCount || children.length}
          />
          <FeesChildSelector
            children={children}
            selectedIndex={selectedChild}
            onSelect={(i) => onSelectChild?.(i)}
            feeByStudentId={childFeeByStudentId}
          />
        </>
      ) : null}

      <FeesCompactNav />

      {paymentSuccess ? (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <p className="min-w-0 flex-1">
            <span className="font-semibold">Recorded.</span> Ref{' '}
            <span className="font-mono">{paymentSuccess}</span> — finance will confirm
            shortly.
          </p>
          <button
            type="button"
            onClick={() => setPaymentSuccess(null)}
            className="shrink-0 text-emerald-700 hover:text-emerald-900"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-800">
          {error}
        </p>
      ) : null}

      {!loading && overview?.paymentStatus === 'NO_FEES' ? (
        <p className={cn(feesSurface, 'px-3 py-4 text-center text-xs', feesMuted)}>
          No fee plans assigned yet. Contact the school if you expected a balance.
        </p>
      ) : null}

      <article className={feesDocument}>
        <FeesStatementHero
          overview={overview}
          childName={activeChildName}
          loading={loading}
          onRefresh={() => void refetch()}
          refreshing={loading}
          onViewPaymentHistory={
            payments.length > 0 ? scrollToRecords : undefined
          }
          onRecordPayment={canRecordPayment ? openPaySheet : undefined}
        />

        {overview && (plansDue.length > 0 || plansCleared.length > 0) ? (
          <FeesSectionBlock
            id="fees-structures"
            index="02"
            title="Fee plans"
            subtitle={`${plansDue.length} due · ${plansCleared.length} done`}
          >
            <div className="space-y-1">
              {plansDue.map((plan) => (
                <FeesStructureRow
                  key={`due-${plan.feeStructureName}-${plan.termName}`}
                  plan={plan}
                />
              ))}
              {plansCleared.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setPlansClearedOpen((v) => !v)}
                    className={cn(
                      feesSurface,
                      'w-full px-2 py-1 text-left text-[10px]',
                      feesMuted,
                    )}
                  >
                    {plansCleared.length} completed · {plansClearedOpen ? 'Hide' : 'Show'}
                  </button>
                  {plansClearedOpen ? (
                    <div className="space-y-1">
                      {plansCleared.map((plan) => (
                        <FeesStructureRow
                          key={`ok-${plan.feeStructureName}-${plan.termName}`}
                          plan={plan}
                        />
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </FeesSectionBlock>
        ) : null}

        {groupedItems.length > 0 ? (
          <FeesSectionBlock
            id="fees-ledger"
            index="03"
            title="Line items"
            subtitle={
              outstandingItems.length > 0
                ? `${formatCurrency(totalDueInBreakdown)} due`
                : 'Settled'
            }
          >
            <FeesBucketLedger
              items={filteredBreakdown}
              filter={breakdownFilter}
              onFilterChange={setBreakdownFilter}
              search={breakdownSearch}
              onSearchChange={setBreakdownSearch}
            />
          </FeesSectionBlock>
        ) : null}

        <FeesSectionBlock
          id="fees-records"
          index="04"
          title="Payment history"
          subtitle={
            payments.length > 0
              ? `${payments.length} · ${formatCurrency(
                  payments.reduce((s, p) => s + Number(p.amount), 0),
                )}`
              : 'None yet'
          }
        >
          <div ref={recordsRef} className="scroll-mt-4">
            <Tabs
              value={recordsTab}
              onValueChange={(v) => setRecordsTab(v as 'payments' | 'receipts')}
            >
              <TabsList className="mb-2 grid h-7 w-full max-w-[240px] grid-cols-2 rounded-md border border-slate-200 bg-slate-100 p-0.5">
                <TabsTrigger
                  value="payments"
                  className="h-6 rounded text-[10px] data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Payments ({payments.length})
                </TabsTrigger>
                <TabsTrigger
                  value="receipts"
                  className="h-6 rounded text-[10px] data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Receipts ({receipts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="payments" className="mt-0">
                {paymentsLoading ? (
                  <div className="h-12 animate-pulse rounded-md bg-slate-200/80" />
                ) : payments.length === 0 ? (
                  <FeesRecordsEmpty
                    onRecordPayment={canRecordPayment ? openPaySheet : undefined}
                  />
                ) : (
                  <FeesPaymentTimeline
                    paymentsByMonth={paymentsByMonth}
                    downloadingId={downloadingId}
                    onDownload={(id, receipt) =>
                      void handleDownloadReceipt(id, receipt)
                    }
                    onCopy={(receipt) => void handleCopyReceipt(receipt)}
                  />
                )}
              </TabsContent>

              <TabsContent value="receipts" className="mt-0">
                {receiptsLoading ? (
                  <div className="h-12 animate-pulse rounded-md bg-slate-200/80" />
                ) : receipts.length === 0 ? (
                  <FeesRecordsEmpty
                    onRecordPayment={canRecordPayment ? openPaySheet : undefined}
                  />
                ) : (
                  <ul className="space-y-1">
                    {receipts.map((receipt) => (
                      <li
                        key={receipt.id}
                        className={cn(
                          feesSurface,
                          'flex items-center gap-2 px-2 py-1.5',
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-[11px] text-slate-800">
                            {receipt.receiptNumber}
                          </p>
                          <p className={cn('text-[10px]', feesMuted)}>
                            {formatFeeDate(receipt.receiptDate)}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold tabular-nums text-emerald-700">
                          {formatCurrency(Number(receipt.amount))}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-500"
                          disabled={downloadingId === receipt.paymentId}
                          onClick={() =>
                            void handleDownloadReceipt(
                              receipt.paymentId,
                              receipt.receiptNumber,
                            )
                          }
                        >
                          {downloadingId === receipt.paymentId ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </FeesSectionBlock>
      </article>

      <FeesStatusNote
        status={overview?.paymentStatus}
                    onRecordPayment={canRecordPayment ? openPaySheet : undefined}
      />

      {canRecordPayment ? (
        <div className="fixed bottom-[4.75rem] left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 px-3 py-2 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] backdrop-blur-md lg:hidden">
          <Button
            type="button"
            className="h-10 w-full gap-2 text-sm shadow-sm"
            onClick={openPaySheet}
          >
            <Wallet className="h-4 w-4" />
            Record {formatCurrency(overview!.outstanding)}
          </Button>
        </div>
      ) : null}

      {activeStudentId ? (
        <ParentMakePaymentSheet
          open={paySheetOpen}
          onOpenChange={setPaySheetOpen}
          subdomain={subdomain}
          studentId={activeStudentId}
          childName={activeChildName}
          outstanding={overview?.outstanding ?? 0}
          onSuccess={handlePaymentSuccess}
        />
      ) : null}
    </div>
  )
}
