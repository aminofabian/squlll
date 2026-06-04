'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StudentFeeSummaryCard } from './StudentFeeSummaryCard'
import {
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
                View-only — contact the finance office to make payments
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={loading}>
            <RefreshCw className={cn('mr-1 h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </Button>
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
          Financial records are read-only. Contact the school finance office for payments or
          corrections.
        </p>
      ) : null}
    </div>
  )
}
