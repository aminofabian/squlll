'use client'

import { useState } from 'react'
import {
  Download,
  FileText,
  Info,
  Loader2,
  RefreshCw,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ParentFeeLiveCard } from './ParentFeeLiveCard'
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
  formatParentPaymentStatus,
  formatPaymentMethodLabel,
  parentPaymentStatusBadgeClass,
} from '@/lib/parent/parentFees'
import type { ParentPortalChild } from '@/lib/parent/types'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface ParentFeesSectionProps {
  subdomain: string
  children: ParentPortalChild[]
  selectedChild: number
  onSelectChild?: (index: number) => void
}

export function ParentFeesSection({
  subdomain,
  children,
  selectedChild,
  onSelectChild,
}: ParentFeesSectionProps) {
  const { toast } = useToast()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const activeStudentId = children[selectedChild]?.studentId ?? null
  const activeChildName = children[selectedChild]?.name

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

  const handleRefreshAll = () => {
    void refetch()
    void refetchPayments()
    void refetchReceipts()
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

  const handleChildFilter = (index: number) => {
    onSelectChild?.(index)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Fees &amp; Payments
          </h2>
          <p className="text-sm text-slate-500">
            Monitor balances and download receipts — payments are recorded by the school
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={loading}>
          <RefreshCw className={cn('mr-1 h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {children.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {children.map((child, index) => (
            <Button
              key={child.studentId}
              variant={selectedChild === index ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChildFilter(index)}
            >
              {child.name}
            </Button>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <ParentFeeLiveCard
        overview={overview}
        childName={activeChildName}
        loading={loading}
        onRefresh={refetch}
      />

      {overview && overview.byPlan.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Wallet className="h-4 w-4 text-primary" />
            Active fee plans
          </h3>
          <div className="space-y-2">
            {overview.byPlan.map((plan) => (
              <div
                key={`${plan.feeStructureName}-${plan.termName}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
              >
                <div>
                  <p className="font-medium">{plan.feeStructureName}</p>
                  <p className="text-xs text-slate-500">
                    {plan.termName} · {plan.academicYearName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">
                    {formatCurrency(plan.arrears)} due
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatCurrency(plan.totalPaid)} / {formatCurrency(plan.totalBilled)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {overview && overview.balance.items.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 font-semibold">Fee breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-3">Item</th>
                  <th className="pb-2 pr-3">Category</th>
                  <th className="pb-2 pr-3 text-right">Billed</th>
                  <th className="pb-2 pr-3 text-right">Paid</th>
                  <th className="pb-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {overview.balance.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3 font-medium">
                      {item.itemName ?? item.bucketName}
                    </td>
                    <td className="py-2 pr-3 text-slate-600">{item.bucketName}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {item.amount.toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-emerald-700">
                      {item.amountPaid.toLocaleString()}
                    </td>
                    <td className="py-2 text-right tabular-nums font-medium">
                      {item.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <Tabs defaultValue="payments">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payments">Payment history</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          {paymentsLoading ? (
            <p className="text-sm text-slate-500">Loading payments…</p>
          ) : payments.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-slate-500">
              No payments recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => {
                const termLabel =
                  payment.invoice?.term?.name && payment.invoice?.academicYear?.name
                    ? `${payment.invoice.term.name} · ${payment.invoice.academicYear.name}`
                    : payment.invoice?.term?.name

                return (
                  <div
                    key={payment.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <p className="font-medium">{payment.receiptNumber}</p>
                      <p className="text-xs text-slate-500">
                        {formatFeeDate(payment.paymentDate)} ·{' '}
                        {formatPaymentMethodLabel(payment.paymentMethod)}
                        {termLabel ? ` · ${termLabel}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(Number(payment.amount))}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={downloadingId === payment.id}
                        onClick={() =>
                          void handleDownloadReceipt(payment.id, payment.receiptNumber)
                        }
                      >
                        {downloadingId === payment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="receipts" className="mt-4">
          {receiptsLoading ? (
            <p className="text-sm text-slate-500">Loading receipts…</p>
          ) : receipts.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-slate-500">
              No receipts available yet.
            </p>
          ) : (
            <div className="space-y-2">
              {receipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{receipt.receiptNumber}</p>
                      <p className="text-xs text-slate-500">
                        {formatFeeDate(receipt.receiptDate)} ·{' '}
                        {formatPaymentMethodLabel(receipt.payment?.paymentMethod)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(Number(receipt.amount))}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={downloadingId === receipt.paymentId}
                      onClick={() =>
                        void handleDownloadReceipt(
                          receipt.paymentId,
                          receipt.receiptNumber,
                        )
                      }
                    >
                      {downloadingId === receipt.paymentId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          Online payment initiation is not enabled yet. To pay fees, use the channels
          provided by your school (e.g. M-Pesa paybill, bank deposit) and the finance
          office will record your payment.
          {overview?.paymentStatus ? (
            <>
              {' '}
              Current status:{' '}
              <Badge className={parentPaymentStatusBadgeClass(overview.paymentStatus)}>
                {formatParentPaymentStatus(overview.paymentStatus)}
              </Badge>
            </>
          ) : null}
        </p>
      </div>
    </div>
  )
}
