'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StudentFeeSummaryCard } from './StudentFeeSummaryCard'
import { StudentPayNowSheet } from './StudentPayNowSheet'
import {
  useMpesaCustodyAvailability,
  useStudentFeeOverview,
  useStudentPayments,
  useStudentReceipts,
} from '@/lib/student/useStudentFees'
import {
  downloadPdfDataUrl,
  fetchMyReceiptPdf,
  formatFeeDate,
  formatPaymentMethodLabel,
  formatStudentPaymentStatus,
  paymentStatusBadgeClass,
} from '@/lib/student/studentFees'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface StudentFeesSectionProps {
  subdomain: string
  layout?: 'page' | 'embedded'
  onBack?: () => void
}

export function StudentFeesSection({
  subdomain,
  layout = 'page',
  onBack,
}: StudentFeesSectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { overview, loading, error, refetch } = useStudentFeeOverview(subdomain)
  const {
    payments,
    loading: paymentsLoading,
    refetch: refetchPayments,
  } = useStudentPayments(subdomain)
  const {
    receipts,
    loading: receiptsLoading,
    refetch: refetchReceipts,
  } = useStudentReceipts(subdomain)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [payOpen, setPayOpen] = useState(false)
  const [payInvoiceId, setPayInvoiceId] = useState<string | null>(null)
  const { availability } = useMpesaCustodyAvailability(subdomain)

  const outstandingInvoices = overview?.outstandingInvoices ?? []
  const canPay = Boolean(availability?.available) && outstandingInvoices.length > 0

  const openPay = (invoiceId: string | null) => {
    setPayInvoiceId(invoiceId)
    setPayOpen(true)
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }
    router.push('/student')
  }

  const handleRefreshAll = () => {
    void refetch()
    void refetchPayments()
    void refetchReceipts()
  }

  const handleDownloadReceipt = async (paymentId: string, receiptNumber: string) => {
    setDownloadingId(paymentId)
    try {
      const dataUrl = await fetchMyReceiptPdf(subdomain, paymentId)
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

  const isPage = layout === 'page'

  return (
    <div
      className={cn(
        isPage
          ? 'min-h-0 px-4 py-4 lg:min-h-screen lg:px-6 lg:py-6'
          : 'px-0 py-0',
      )}
    >
      {isPage ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                My Fees
              </h1>
              <p className="text-sm text-slate-500">
                {canPay
                  ? 'Pay with M-Pesa Express or review your statement'
                  : 'View-only — contact the finance office to make payments'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canPay ? (
              <Button
                size="sm"
                className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => openPay(null)}
              >
                <Smartphone className="h-4 w-4" />
                Pay fees
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={loading}>
              <RefreshCw className={cn('mr-1 h-4 w-4', loading && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <StudentFeeSummaryCard
        overview={overview}
        loading={loading}
        onRefresh={refetch}
        feesHref={undefined}
      />

      {canPay ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              <Smartphone className="h-4 w-4 text-emerald-600" />
              Outstanding invoices
            </h3>
            <span className="text-[11px] text-slate-500">
              Settle instantly with M-Pesa Express
            </span>
          </div>
          <div className="space-y-2">
            {outstandingInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-white px-3 py-2.5 dark:border-emerald-900/30 dark:bg-slate-900"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {invoice.termName ?? 'This term'}
                    {invoice.academicYearName ? ` · ${invoice.academicYearName}` : ''}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {invoice.invoiceNumber}
                    {invoice.dueDate ? ` · due ${formatFeeDate(invoice.dueDate)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    KES {invoice.balanceAmount.toLocaleString()}
                  </span>
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => openPay(invoice.id)}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    Pay
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {overview && overview.byPlan.length > 0 ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <Wallet className="h-4 w-4 text-primary" />
            Fee structures
          </h3>
          <div className="space-y-2">
            {overview.byPlan.map((plan) => (
              <div
                key={`${plan.feeStructureName}-${plan.termName}-${plan.academicYearName}`}
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
                    KES {plan.arrears.toLocaleString()} due
                  </p>
                  <p className="text-xs text-slate-500">
                    {plan.totalPaid.toLocaleString()} / {plan.totalBilled.toLocaleString()} paid
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {overview && overview.balance.items.length > 0 ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">
            Fee breakdown
          </h3>
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

      <Tabs defaultValue="payments" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payments">Payment history</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          {paymentsLoading ? (
            <p className="text-sm text-slate-500">Loading payments…</p>
          ) : payments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
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
                        KES {Number(payment.amount).toLocaleString()}
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
            <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
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
                      KES {Number(receipt.amount).toLocaleString()}
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

      {overview?.paymentStatus ? (
        <p className="mt-6 text-center text-xs text-slate-500">
          Status:{' '}
          <Badge className={cn('ml-1', paymentStatusBadgeClass(overview.paymentStatus))}>
            {formatStudentPaymentStatus(overview.paymentStatus)}
          </Badge>
          {' · '}
          {canPay
            ? 'Payments made here show up on your statement immediately. Contact the finance office for corrections.'
            : 'Financial records are read-only. Contact the school finance office for payments or corrections.'}
        </p>
      ) : null}

      {canPay ? (
        <StudentPayNowSheet
          open={payOpen}
          onOpenChange={setPayOpen}
          subdomain={subdomain}
          invoices={outstandingInvoices}
          initialInvoiceId={payInvoiceId}
          onSettled={handleRefreshAll}
        />
      ) : null}
    </div>
  )
}
