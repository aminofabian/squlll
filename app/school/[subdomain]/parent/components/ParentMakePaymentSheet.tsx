'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Banknote,
  Building2,
  Camera,
  CheckCircle2,
  Copy,
  ImagePlus,
  Loader2,
  Smartphone,
  X,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  fetchParentPaymentInstructions,
  formatCurrency,
  submitParentPayment,
  type ParentPaymentInstructions,
} from '@/lib/parent/parentFees'
import {
  uploadParentPaymentProof,
  validatePaymentProofFile,
} from '@/lib/parent/uploadPaymentProof'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { feesEyebrow, feesMuted, feesSurface } from './parent-fees-premium'

export type ParentPaymentMethodChoice = 'MPESA' | 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'OTHER'

const METHOD_OPTIONS: {
  value: ParentPaymentMethodChoice
  label: string
  icon: typeof Smartphone
}[] = [
  { value: 'MPESA', label: 'M-Pesa', icon: Smartphone },
  { value: 'BANK_TRANSFER', label: 'Bank', icon: Building2 },
  { value: 'CASH', label: 'Cash', icon: Banknote },
  { value: 'CHEQUE', label: 'Cheque', icon: Banknote },
  { value: 'OTHER', label: 'Other', icon: Banknote },
]

interface ParentMakePaymentSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subdomain: string
  studentId: string
  childName?: string
  outstanding: number
  onSuccess?: (receiptNumber?: string) => void
}

function DrawerSection({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-2.5', className)}>
      <p className={feesEyebrow}>{title}</p>
      {children}
    </section>
  )
}

function SheetSteps({ active }: { active: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Pay' },
    { n: 2, label: 'Details' },
    { n: 3, label: 'Receipt' },
  ] as const
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <div key={s.n} className="flex flex-1 items-center gap-1">
          <span
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
              active >= s.n
                ? 'bg-primary text-primary-foreground'
                : 'bg-slate-200 text-slate-500',
            )}
          >
            {s.n}
          </span>
          <span
            className={cn(
              'text-[9px] font-medium',
              active >= s.n ? 'text-slate-800' : 'text-slate-400',
            )}
          >
            {s.label}
          </span>
          {i < steps.length - 1 ? (
            <div
              className={cn(
                'mx-0.5 h-px flex-1',
                active > s.n ? 'bg-primary/40' : 'bg-slate-200',
              )}
            />
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function ParentMakePaymentSheet({
  open,
  onOpenChange,
  subdomain,
  studentId,
  childName,
  outstanding,
  onSuccess,
}: ParentMakePaymentSheetProps) {
  const { toast } = useToast()
  const [instructions, setInstructions] = useState<ParentPaymentInstructions | null>(
    null,
  )
  const [instructionsLoading, setInstructionsLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<ParentPaymentMethodChoice>('MPESA')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [submittedReceipt, setSubmittedReceipt] = useState<string | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const loadInstructions = useCallback(async () => {
    if (!subdomain) return
    setInstructionsLoading(true)
    try {
      const data = await fetchParentPaymentInstructions(subdomain)
      setInstructions(data)
    } catch {
      setInstructions(null)
    } finally {
      setInstructionsLoading(false)
    }
  }, [subdomain])

  useEffect(() => {
    if (!open) {
      setSubmittedReceipt(null)
      return
    }
    setError(null)
    setAmount(outstanding > 0 ? String(Math.round(outstanding)) : '')
    setMethod('MPESA')
    setReference('')
    setNotes('')
    setProofFile(null)
    setProofPreview(null)
    void loadInstructions()
  }, [open, outstanding, loadInstructions])

  useEffect(() => {
    return () => {
      if (proofPreview) URL.revokeObjectURL(proofPreview)
    }
  }, [proofPreview])

  const clearProof = () => {
    if (proofPreview) URL.revokeObjectURL(proofPreview)
    setProofFile(null)
    setProofPreview(null)
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  const handleProofSelected = (file: File | undefined) => {
    if (!file) return
    const check = validatePaymentProofFile(file)
    if (!check.valid) {
      setError(check.error ?? 'Invalid receipt file')
      return
    }
    setError(null)
    if (proofPreview) URL.revokeObjectURL(proofPreview)
    setProofFile(file)
    setProofPreview(URL.createObjectURL(file))
  }

  const handlePayFull = () => {
    if (outstanding > 0) setAmount(String(Math.round(outstanding)))
  }

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: `${label} copied` })
    } catch {
      toast({ title: 'Could not copy', variant: 'destructive' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const parsed = Number(amount.replace(/,/g, ''))
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Enter a valid amount')
      return
    }
    if (method === 'MPESA' && !reference.trim()) {
      setError('M-Pesa confirmation code is required')
      return
    }

    setSubmitting(true)
    try {
      let proofImageUrl: string | undefined
      if (proofFile) {
        setUploadingProof(true)
        const uploaded = await uploadParentPaymentProof(proofFile, studentId)
        proofImageUrl = uploaded.url
        setUploadingProof(false)
      }

      const result = await submitParentPayment(subdomain, {
        studentId,
        amount: parsed,
        paymentMethod: method,
        transactionReference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        proofImageUrl,
      })
      setSubmittedReceipt(result.receiptNumber ?? null)
      onSuccess?.(result.receiptNumber ?? undefined)
      window.setTimeout(() => onOpenChange(false), 1400)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record payment')
    } finally {
      setSubmitting(false)
      setUploadingProof(false)
    }
  }

  const busy = submitting || uploadingProof
  const banks = instructions?.paymentModes?.bankAccounts ?? []
  const paymentNotes = instructions?.paymentModes?.notes ?? []
  const hasPayDetails =
    instructionsLoading ||
    Boolean(instructions?.schoolName) ||
    Boolean(instructions?.schoolContact) ||
    banks.length > 0 ||
    paymentNotes.length > 0

  const sheetStep: 1 | 2 | 3 = proofFile || proofPreview ? 3 : reference.trim() || amount ? 2 : 1

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full max-w-md flex-col gap-0 border-l border-slate-200 p-0 sm:max-w-lg"
      >
        {submittedReceipt ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="text-base font-semibold text-slate-900">Payment recorded</p>
            <p className="font-mono text-sm text-emerald-700">{submittedReceipt}</p>
            <p className="max-w-xs text-xs text-slate-500">
              Finance will verify your payment and receipt photo. You can download the
              official PDF from payment history once confirmed.
            </p>
          </div>
        ) : (
          <>
            <SheetHeader className="shrink-0 space-y-2.5 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-4 py-4 pr-12 text-left">
              <SheetTitle className="text-base font-semibold text-slate-900">
                Record payment
              </SheetTitle>
              <SheetDescription className="text-xs leading-relaxed text-slate-600">
                Log money you already sent. We match it to {childName ?? 'your child'}&apos;s
                account.
              </SheetDescription>
              <SheetSteps active={sheetStep} />
              <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-800">
                    {childName ?? 'Student'}
                  </p>
                  {outstanding > 0 ? (
                    <p className="text-[10px] text-slate-500">Balance due</p>
                  ) : null}
                </div>
                {outstanding > 0 ? (
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-amber-700">
                    {formatCurrency(outstanding)}
                  </p>
                ) : null}
              </div>
            </SheetHeader>

            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-6">
                  {hasPayDetails ? (
                    <DrawerSection title="1 · How to pay">
                      <div className={cn(feesSurface, 'space-y-2 px-3 py-2.5 text-[11px]')}>
                        {instructionsLoading ? (
                          <p className={feesMuted}>Loading school pay details…</p>
                        ) : null}
                        {instructions?.schoolName ? (
                          <p className="font-medium text-slate-800">
                            {instructions.schoolName}
                          </p>
                        ) : null}
                        {instructions?.schoolContact ? (
                          <p className={feesMuted}>{instructions.schoolContact}</p>
                        ) : null}
                        {banks.map((b, i) => (
                          <div
                            key={`${b.bankName}-${i}`}
                            className="flex items-start justify-between gap-2 rounded-md border border-slate-200/80 bg-white px-2 py-1.5"
                          >
                            <div className="min-w-0 flex gap-2 text-slate-700">
                              <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                              <span>
                                {b.bankName}
                                {b.branch ? ` · ${b.branch}` : ''}
                                {b.accountNumber ? (
                                  <>
                                    <br />
                                    <span className="font-mono text-[10px]">
                                      {b.accountNumber}
                                    </span>
                                  </>
                                ) : null}
                              </span>
                            </div>
                            {b.accountNumber ? (
                              <button
                                type="button"
                                onClick={() =>
                                  void copyText(b.accountNumber!, 'Account number')
                                }
                                className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Copy account number"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                          </div>
                        ))}
                        {paymentNotes.map((note, i) => (
                          <p
                            key={`note-${i}`}
                            className="flex gap-2 text-slate-600"
                          >
                            <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                            <span>{note}</span>
                          </p>
                        ))}
                      </div>
                    </DrawerSection>
                  ) : null}

                  <DrawerSection title="2 · Payment details">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <Label
                            htmlFor="parent-pay-amount"
                            className="text-xs text-slate-700"
                          >
                            Amount (KES)
                          </Label>
                          {outstanding > 0 ? (
                            <button
                              type="button"
                              onClick={handlePayFull}
                              className="text-[10px] font-medium text-primary hover:underline"
                            >
                              Use full balance
                            </button>
                          ) : null}
                        </div>
                        <Input
                          id="parent-pay-amount"
                          type="number"
                          min={1}
                          step={1}
                          inputMode="numeric"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-10 text-base font-semibold tabular-nums"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-700">Payment method</Label>
                        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                          {METHOD_OPTIONS.map((opt) => {
                            const Icon = opt.icon
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setMethod(opt.value)}
                                className={cn(
                                  'flex flex-col items-center gap-0.5 rounded-md border px-1 py-2 text-[10px] font-medium transition-colors',
                                  method === opt.value
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                                )}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="parent-pay-ref" className="text-xs text-slate-700">
                          {method === 'MPESA'
                            ? 'M-Pesa confirmation code'
                            : method === 'BANK_TRANSFER'
                              ? 'Bank reference'
                              : 'Reference (optional)'}
                        </Label>
                        <Input
                          id="parent-pay-ref"
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          placeholder={method === 'MPESA' ? 'e.g. QHK12ABC34' : ''}
                          className="h-9 font-mono text-sm uppercase tracking-wide"
                          required={method === 'MPESA'}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="parent-pay-notes" className="text-xs text-slate-700">
                          Note (optional)
                        </Label>
                        <Input
                          id="parent-pay-notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. Term 2 tuition"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </DrawerSection>

                  <DrawerSection title="3 · Receipt photo">
                    <p className="text-[10px] leading-relaxed text-slate-500">
                      Snap your M-Pesa message or bank slip — finance confirms faster.
                      {method === 'BANK_TRANSFER' || method === 'MPESA'
                        ? ' Recommended.'
                        : ' Optional.'}
                    </p>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleProofSelected(e.target.files?.[0])}
                    />
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => handleProofSelected(e.target.files?.[0])}
                    />
                    {proofPreview ? (
                      <div className={cn(feesSurface, 'relative overflow-hidden p-2')}>
                        {proofFile?.type === 'application/pdf' ? (
                          <div className="flex items-center gap-2 py-6 text-xs text-slate-600">
                            <ImagePlus className="h-5 w-5 text-slate-400" />
                            <span className="truncate">{proofFile.name}</span>
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={proofPreview}
                            alt="Receipt preview"
                            className="max-h-44 w-full rounded-md object-contain"
                          />
                        )}
                        <button
                          type="button"
                          onClick={clearProof}
                          className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1 text-white hover:bg-slate-900"
                          aria-label="Remove receipt"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className={cn(
                            feesSurface,
                            'flex flex-col items-center gap-1.5 px-2 py-5 text-center transition-colors hover:border-primary/30 hover:bg-primary/5',
                          )}
                        >
                          <Camera className="h-5 w-5 text-primary" />
                          <span className="text-[10px] font-medium text-slate-800">
                            Snap receipt
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className={cn(
                            feesSurface,
                            'flex flex-col items-center gap-1.5 px-2 py-5 text-center transition-colors hover:bg-slate-50',
                          )}
                        >
                          <ImagePlus className="h-5 w-5 text-slate-500" />
                          <span className="text-[10px] font-medium text-slate-800">
                            Upload file
                          </span>
                        </button>
                      </div>
                    )}
                    <p className={feesMuted}>JPG, PNG, or PDF · max 10 MB</p>
                  </DrawerSection>

                  {error ? (
                    <p className="rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-800">
                      {error}
                    </p>
                  ) : null}
                </div>
              </div>

              <SheetFooter className="shrink-0 border-t border-slate-100 bg-white px-4 py-3">
                <Button type="submit" className="h-10 w-full text-sm" disabled={busy}>
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploadingProof ? 'Uploading receipt…' : 'Recording…'}
                    </>
                  ) : (
                    'Record payment'
                  )}
                </Button>
              </SheetFooter>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
