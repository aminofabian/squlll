'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BadgeCheck,
  CheckCircle2,
  Loader2,
  Phone,
  Smartphone,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  initiateMyMpesaStk,
  fetchMyStkIntent,
  type MpesaStkIntent,
  type StudentOutstandingInvoice,
} from '@/lib/student/studentFees'

interface StudentPayNowSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subdomain: string
  invoices: StudentOutstandingInvoice[]
  /** Pre-selects an invoice (e.g. the row the student tapped). */
  initialInvoiceId?: string | null
  /** Called once the payment settles so the page can refetch balances. */
  onSettled: () => void
  /** Optional prefill from the student's profile. */
  defaultPhone?: string
}

type Phase = 'form' | 'waiting' | 'success' | 'failed'

const POLL_INTERVAL_MS = 3_000
const POLL_TIMEOUT_MS = 90_000

function kes(value: number): string {
  return `KES ${Math.round(value).toLocaleString()}`
}

function invoiceLabel(invoice: StudentOutstandingInvoice): string {
  const term = invoice.termName ?? 'This term'
  const year = invoice.academicYearName ? ` · ${invoice.academicYearName}` : ''
  return `${term}${year}`
}

export function StudentPayNowSheet({
  open,
  onOpenChange,
  subdomain,
  invoices,
  initialInvoiceId,
  onSettled,
  defaultPhone,
}: StudentPayNowSheetProps) {
  const [phase, setPhase] = useState<Phase>('form')
  const [selectedId, setSelectedId] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [phone, setPhone] = useState<string>(defaultPhone ?? '')
  const [intent, setIntent] = useState<MpesaStkIntent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const settledRef = useRef(false)

  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedId) ?? null,
    [invoices, selectedId],
  )

  // Keep the latest props reachable from those effects without making them
  // re-run (and wipe the student's input / success screen) every time the
  // parent refetches its overview after a payment settles.
  const latestRef = useRef({ initialInvoiceId, invoices })
  const onSettledRef = useRef(onSettled)

  useEffect(() => {
    latestRef.current = { initialInvoiceId, invoices }
    onSettledRef.current = onSettled
  }, [initialInvoiceId, invoices, onSettled])

  // Reset to a clean form each time the sheet opens.
  useEffect(() => {
    if (!open) return
    const { initialInvoiceId: initial, invoices: list } = latestRef.current
    const first = initial ?? list[0]?.id ?? ''
    setSelectedId(first)
    const inv = list.find((invoice) => invoice.id === first)
    setAmount(inv ? String(Math.ceil(inv.balanceAmount)) : '')
    setPhase('form')
    setIntent(null)
    setError(null)
    settledRef.current = false
  }, [open])

  const handleSelectInvoice = (invoice: StudentOutstandingInvoice) => {
    setSelectedId(invoice.id)
    setAmount(String(Math.ceil(invoice.balanceAmount)))
    setError(null)
  }

  const sendRequest = async () => {
    if (!selectedInvoice) {
      setError('Choose which term you are paying for.')
      return
    }
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter the amount you want to pay.')
      return
    }
    if (numericAmount > selectedInvoice.balanceAmount) {
      setError(
        `That is more than the ${kes(selectedInvoice.balanceAmount)} outstanding on this invoice.`,
      )
      return
    }
    if (phone.replace(/\D/g, '').length < 9) {
      setError('Enter the M-Pesa phone number that will receive the request.')
      return
    }

    setError(null)
    setPhase('waiting')
    try {
      const created = await initiateMyMpesaStk(subdomain, {
        invoiceId: selectedInvoice.id,
        amount: numericAmount,
        phone: phone.trim(),
        notes: `Student self-service M-Pesa Express · ${invoiceLabel(selectedInvoice)}`,
      })
      setIntent(created)
      if (created.status === 'SUCCESS') {
        setPhase('success')
        settle()
      } else if (created.status === 'FAILED') {
        setPhase('failed')
        setError(created.resultDesc ?? 'M-Pesa declined the request.')
      }
    } catch (err) {
      setPhase('failed')
      setError(
        err instanceof Error
          ? err.message
          : 'Could not reach M-Pesa. Please try again.',
      )
    }
  }

  const settle = () => {
    if (settledRef.current) return
    settledRef.current = true
    onSettled()
  }

  // Poll the intent until Safaricom confirms, fails, or we give up.
  useEffect(() => {
    if (phase !== 'waiting' || !intent?.id) return
    let cancelled = false
    const startedAt = Date.now()

    const tick = async () => {
      if (cancelled) return
      try {
        const latest = await fetchMyStkIntent(subdomain, intent.id)
        if (cancelled) return
        setIntent(latest)
        if (latest.status === 'SUCCESS') {
          if (!settledRef.current) {
            settledRef.current = true
            onSettledRef.current()
          }
          setPhase('success')
          return
        }
        if (latest.status === 'FAILED') {
          setPhase('failed')
          setError(latest.resultDesc ?? 'M-Pesa could not complete the payment.')
          return
        }
      } catch {
        // Transient — keep polling until the timeout.
      }
      if (!cancelled && Date.now() - startedAt < POLL_TIMEOUT_MS) {
        timeout = window.setTimeout(tick, POLL_INTERVAL_MS)
      } else if (!cancelled) {
        setPhase('failed')
        setError(
          'Still waiting on M-Pesa. If the money left your account, it will reflect on your statement shortly.',
        )
      }
    }

    let timeout = window.setTimeout(tick, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [phase, intent?.id, subdomain])

  const busy = phase === 'waiting'

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md gap-0 overflow-hidden border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-950">
        <DialogHeader className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 to-white px-5 py-4 text-left dark:border-slate-800 dark:from-emerald-950/30 dark:to-slate-950">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <Smartphone className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
              Lipa na M-Pesa
            </span>
          </div>
          <DialogTitle className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Pay school fees
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            We send a payment request to your phone — approve it with your M-Pesa
            PIN. No card, no queuing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          {phase === 'success' && intent ? (
            <SuccessPanel intent={intent} onDone={() => onOpenChange(false)} />
          ) : phase === 'waiting' && intent ? (
            <WaitingPanel intent={intent} onCancel={() => setPhase('failed')} />
          ) : (
            <>
              {/* Which term */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Paying for
                </p>
                <div className="space-y-1.5">
                  {invoices.map((invoice) => {
                    const active = invoice.id === selectedId
                    return (
                      <button
                        key={invoice.id}
                        type="button"
                        onClick={() => handleSelectInvoice(invoice)}
                        className={cn(
                          'flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                          active
                            ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/20'
                            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900',
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                            {invoiceLabel(invoice)}
                          </span>
                          <span className="block truncate text-[11px] text-slate-400">
                            {invoice.invoiceNumber}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                            {kes(invoice.balanceAmount)}
                          </span>
                          <span className="block text-[10px] uppercase tracking-wide text-slate-400">
                            outstanding
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label
                  htmlFor="pay-amount"
                  className="text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                >
                  Amount (KES)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="pay-amount"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      setError(null)
                    }}
                    className="h-9 bg-white dark:bg-slate-900"
                  />
                  {selectedInvoice ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 shrink-0"
                      onClick={() =>
                        setAmount(String(Math.ceil(selectedInvoice.balanceAmount)))
                      }
                    >
                      Full
                    </Button>
                  ) : null}
                </div>
                <p className="text-[11px] text-slate-400">
                  Part payments are fine — you can top up the rest later.
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label
                  htmlFor="pay-phone"
                  className="text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                >
                  M-Pesa phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="pay-phone"
                    inputMode="tel"
                    placeholder="07XX XXX XXX"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      setError(null)
                    }}
                    className="h-9 bg-white pl-9 dark:bg-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Safaricom will prompt this number to enter your PIN.
                </p>
              </div>

              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                  {error}
                </p>
              ) : null}
            </>
          )}
        </div>

        {phase !== 'success' && phase !== 'waiting' ? (
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              disabled={!selectedInvoice}
              onClick={() => void sendRequest()}
            >
              <Smartphone className="h-4 w-4" />
              {error ? 'Try again' : 'Send payment request'}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function WaitingPanel({
  intent,
  onCancel,
}: {
  intent: MpesaStkIntent
  onCancel: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Loader2 className="h-6 w-6 animate-spin" />
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Check your phone
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          Enter your M-Pesa PIN on <strong>{intent.phone}</strong> to release{' '}
          <strong>{kes(intent.amount)}</strong>.
        </p>
      </div>
      <p className="text-[11px] text-slate-400">
        Waiting for confirmation from Safaricom…
      </p>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        I didn&apos;t get a prompt
      </Button>
    </div>
  )
}

function SuccessPanel({
  intent,
  onDone,
}: {
  intent: MpesaStkIntent
  onDone: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Payment received
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {kes(intent.amount)} confirmed
          {intent.mpesaReceipt ? (
            <>
              {' '}
              · receipt{' '}
              <BadgeCheck className="mb-0.5 inline h-3.5 w-3.5 text-emerald-600" />{' '}
              <span className="font-mono">{intent.mpesaReceipt}</span>
            </>
          ) : null}
        </p>
      </div>
      <p className="text-[11px] text-slate-400">
        Your balance and receipts below are already up to date.
      </p>
      <Button
        type="button"
        size="sm"
        className="mt-1 h-9 bg-emerald-600 hover:bg-emerald-700"
        onClick={onDone}
      >
        Done
      </Button>
    </div>
  )
}
