'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Download,
  FileText,
  Loader2,
  Receipt,
  RefreshCw,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StudentFeeSummaryCard } from './StudentFeeSummaryCard'
import { StudentPayNowSheet } from './StudentPayNowSheet'
import {
  EmptyState,
  PageHeader,
  Section,
  StateMessage,
  StatusPill,
  type PillTone,
} from '../_ui'
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
} from '@/lib/student/studentFees'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface StudentFeesSectionProps {
  subdomain: string
  layout?: 'page' | 'embedded'
  onBack?: () => void
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
    <>
      {isPage ? (
        <PageHeader
          title="My Fees"
          subtitle={
            canPay
              ? 'Pay with M-Pesa Express or review your statement'
              : 'View-only — contact the finance office to make payments'
          }
          onBack={handleBack}
          actions={
            <>
              {canPay ? (
                <Button size="sm" className="gap-1.5" onClick={() => openPay(null)}>
                  <Smartphone className="h-4 w-4" />
                  Pay fees
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                disabled={loading}
              >
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                Refresh
              </Button>
            </>
          }
        />
      ) : null}

      <div className="space-y-6">
        {error ? (
          <Section padded={false}>
            <StateMessage
              variant="error"
              title="We couldn't load your fees"
              description={error}
              onRetry={handleRefreshAll}
            />
          </Section>
        ) : null}

        <StudentFeeSummaryCard
          overview={overview}
          loading={loading}
          onRefresh={refetch}
          feesHref={undefined}
        />

        {canPay ? (
          <Section
            icon={Smartphone}
            title="Outstanding invoices"
            description="Settle instantly with M-Pesa Express"
          >
            <div className="space-y-2">
              {outstandingInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {invoice.termName ?? 'This term'}
                      {invoice.academicYearName ? ` · ${invoice.academicYearName}` : ''}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {invoice.invoiceNumber}
                      {invoice.dueDate ? ` · due ${formatFeeDate(invoice.dueDate)}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      KES {invoice.balanceAmount.toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => openPay(invoice.id)}
                    >
                      <Smartphone className="h-4 w-4" />
                      Pay
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {overview && overview.byPlan.length > 0 ? (
          <Section icon={Wallet} title="Fee structures">
            <div className="space-y-2">
              {overview.byPlan.map((plan) => (
                <div
                  key={`${plan.feeStructureName}-${plan.termName}-${plan.academicYearName}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{plan.feeStructureName}</p>
                    <p className="text-xs text-muted-foreground">
                      {plan.termName} · {plan.academicYearName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums text-foreground">
                      KES {plan.arrears.toLocaleString()} due
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {plan.totalPaid.toLocaleString()} / {plan.totalBilled.toLocaleString()} paid
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {overview && overview.balance.items.length > 0 ? (
          <Section title="Fee breakdown" padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 text-right font-medium">Billed</th>
                    <th className="px-4 py-3 text-right font-medium">Paid</th>
                    <th className="px-4 py-3 text-right font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.balance.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/70 last:border-0">
                      <td className="px-4 py-2.5 font-medium text-foreground">
                        {item.itemName ?? item.bucketName}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{item.bucketName}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                        {item.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                        {item.amountPaid.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium tabular-nums text-foreground">
                        {item.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        ) : null}

        <Tabs defaultValue="payments" className="gap-4">
          <TabsList className="grid h-10 w-full grid-cols-2 rounded-lg border border-border bg-muted p-1 text-muted-foreground">
            <TabsTrigger
              value="payments"
              className="rounded-md data-[state=active]:border-transparent data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Payment history
            </TabsTrigger>
            <TabsTrigger
              value="receipts"
              className="rounded-md data-[state=active]:border-transparent data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Receipts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            {paymentsLoading ? (
              <StateMessage variant="loading" title="Loading payments…" />
            ) : payments.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No payments yet"
                description="Payments you make will show up here along with their receipts."
              />
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
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {payment.receiptNumber}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatFeeDate(payment.paymentDate)} ·{' '}
                          {formatPaymentMethodLabel(payment.paymentMethod)}
                          {termLabel ? ` · ${termLabel}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          KES {Number(payment.amount).toLocaleString()}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={downloadingId === payment.id}
                          aria-label={`Download receipt ${payment.receiptNumber}`}
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

          <TabsContent value="receipts">
            {receiptsLoading ? (
              <StateMessage variant="loading" title="Loading receipts…" />
            ) : receipts.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No receipts yet"
                description="Receipts are generated once a payment is confirmed."
              />
            ) : (
              <div className="space-y-2">
                {receipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {receipt.receiptNumber}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatFeeDate(receipt.receiptDate)} ·{' '}
                          {formatPaymentMethodLabel(receipt.payment?.paymentMethod)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        KES {Number(receipt.amount).toLocaleString()}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={downloadingId === receipt.paymentId}
                        aria-label={`Download receipt ${receipt.receiptNumber}`}
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
          <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-xs text-muted-foreground">
            <span>Status:</span>
            <StatusPill tone={paymentTone(overview.paymentStatus)}>
              {formatStudentPaymentStatus(overview.paymentStatus)}
            </StatusPill>
            <span>
              ·{' '}
              {canPay
                ? 'Payments made here show up on your statement immediately. Contact the finance office for corrections.'
                : 'Financial records are read-only. Contact the school finance office for payments or corrections.'}
            </span>
          </p>
        ) : null}
      </div>

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
    </>
  )
}
