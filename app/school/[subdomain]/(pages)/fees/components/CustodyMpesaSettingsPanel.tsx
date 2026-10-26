'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  useMpesaCustody,
  type CustodyDestinationType,
} from '../hooks/useMpesaCustody'
import { useTenantFeeLetterSettings } from '../hooks/useTenantFeeLetterSettings'

/**
 * School M-Pesa settings — the number parents pay into.
 */
export function CustodyMpesaSettingsPanel({
  compact = false,
}: {
  compact?: boolean
}) {
  const { toast } = useToast()
  const params = useParams()
  const subdomain =
    typeof params?.subdomain === 'string' ? params.subdomain : 'school'
  const { details } = useTenantFeeLetterSettings(subdomain)
  const assignedBank = details?.paymentModes?.bankAccounts?.find(
    (account) => account.branch && account.accountNumber,
  )
  const {
    availability,
    destination,
    loading,
    saving,
    error,
    saveDestination,
    receiveTest,
    pollIntent,
  } = useMpesaCustody()

  const [type, setType] = useState<CustodyDestinationType>('paybill')
  const [tillNumber, setTillNumber] = useState('')
  const [businessNumber, setBusinessNumber] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [label, setLabel] = useState('')
  const [testPhone, setTestPhone] = useState('')
  const [testing, setTesting] = useState(false)
  const [testIntent, setTestIntent] = useState<{
    id: string
    status: string
    partyB: string
    phone: string
    resultDesc: string | null
    mpesaReceipt: string | null
    resultCode: string | null
  } | null>(null)

  useEffect(() => {
    if (!destination) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate the form from the saved destination
    setType(destination.type)
    setTillNumber(destination.tillNumber ?? '')
    setBusinessNumber(destination.businessNumber ?? '')
    setAccountNumber(destination.accountNumber ?? '')
    setLabel(destination.label ?? '')
  }, [destination])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading M-Pesa settings…
      </div>
    )
  }

  const railOn = availability?.custodyProvider === 'DARAJA'
  const stkReady = Boolean(availability?.available)

  if (!railOn) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
        <p className="font-medium">M-Pesa payments are not switched on yet</p>
        <p className="mt-1 text-amber-800">
          {availability?.reason ??
            'Ask SQUL support to switch on M-Pesa payments for your school.'}
        </p>
      </div>
    )
  }

  const effectiveTillNumber = tillNumber
  const effectiveBusinessNumber = businessNumber || assignedBank?.branch || ''
  const effectiveAccountNumber = accountNumber || assignedBank?.accountNumber || ''
  const effectiveLabel = label || assignedBank?.bankName || undefined

  const buildInput = () =>
    type === 'till'
      ? { type: 'till' as const, tillNumber: effectiveTillNumber, label: effectiveLabel }
      : {
          type: 'paybill' as const,
          businessNumber: effectiveBusinessNumber,
          accountNumber: effectiveAccountNumber,
          label: effectiveLabel,
        }

  const handleSave = async () => {
    try {
      await saveDestination(buildInput())
      toast({
        title: 'Saved',
        description:
          'Bank paybill saved. Parent payments go straight to the school bank account.',
      })
    } catch (e) {
      toast({
        title: 'Could not save',
        description: e instanceof Error ? e.message : 'Save failed',
        variant: 'destructive',
      })
    }
  }

  const handleTest = async () => {
    if (!testPhone.trim()) {
      toast({
        title: 'Phone required',
        description: 'Enter the Safaricom number that should receive the KES 1 request',
        variant: 'destructive',
      })
      return
    }
    setTesting(true)
    setTestIntent(null)
    try {
      const intent = await receiveTest({
        destination: buildInput(),
        phone: testPhone.trim(),
      })
      setTestIntent({
        id: intent.id,
        status: intent.status,
        partyB: intent.partyB,
        phone: intent.phone,
        resultDesc: intent.resultDesc,
        mpesaReceipt: intent.mpesaReceipt,
        resultCode: intent.resultCode,
      })
      toast({
        title: 'Payment request sent — enter the M-Pesa PIN',
        description: `KES 1 to the school bank account. This test does not update student fees; check the M-Pesa statement for the credit.`,
      })

      // Poll Daraja query via API until SUCCESS/FAILED or ~90s
      for (let i = 0; i < 18; i++) {
        await new Promise((r) => setTimeout(r, 5000))
        const next = await pollIntent(intent.id)
        setTestIntent({
          id: next.id,
          status: next.status,
          partyB: next.partyB,
          phone: next.phone,
          resultDesc: next.resultDesc,
          mpesaReceipt: next.mpesaReceipt,
          resultCode: next.resultCode,
        })
        if (next.status === 'SUCCESS' || next.status === 'FAILED') {
          toast({
            title:
              next.status === 'SUCCESS'
                ? 'Confirmed — KES 1 paid'
                : 'The payment request was not completed',
            description:
              next.status === 'SUCCESS'
                ? `Receipt ${next.mpesaReceipt ?? '—'}. Money is on till ${next.partyB} (not a SQUL fee payment).`
                : next.resultDesc ?? `Result ${next.resultCode ?? next.status}`,
            variant: next.status === 'SUCCESS' ? 'default' : 'destructive',
          })
          break
        }
      }
    } catch (e) {
      toast({
        title: 'Test failed',
        description: e instanceof Error ? e.message : 'Receive test failed',
        variant: 'destructive',
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-5'}>
      {!compact ? (
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            School M-Pesa bank account
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Add the school bank paybill and account number parents pay into. When you request a payment, the parent enters their M-Pesa PIN and the money goes straight to the school bank account.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            The M-Pesa number must belong to the school. Bank details for fee letters are added separately.
          </p>
        </div>
      ) : (
        <p className="text-[12px] leading-relaxed text-[#1a4d42]/65 dark:text-white/55">
          Add the school bank paybill and account number. Parents get a request on their phone and pay with their M-Pesa PIN.
        </p>
      )}

      {!stkReady ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950">
          You can save the bank paybill now. Payment requests stay disabled until M-Pesa is switched on for the school.
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      {assignedBank ? (
        <div className="border border-[#246a59]/20 bg-[#e8f2ef] px-3 py-2 text-[11px] leading-relaxed text-[#1a4d42]/75">
          Using the bank account assigned under Bank:{' '}
          <span className="font-semibold text-[#0a1f1a]">
            {assignedBank.bankName}
          </span>{' '}
          · Paybill {assignedBank.branch} · Account {assignedBank.accountNumber}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label>Where should parents pay?</Label>
        <Select
          value={type}
          onValueChange={(v) => setType(v as CustodyDestinationType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="till">M-Pesa till (not a bank account)</SelectItem>
            <SelectItem value="paybill">Bank paybill</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === 'till' ? (
        <div className="space-y-2">
          <Label htmlFor="till">Till number</Label>
          <Input
            id="till"
            inputMode="numeric"
            value={effectiveTillNumber}
            onChange={(e) => setTillNumber(e.target.value)}
            placeholder="e.g. 3502582"
          />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="paybill">Paybill / business number</Label>
            <Input
              id="paybill"
              inputMode="numeric"
              value={effectiveBusinessNumber}
              onChange={(e) => setBusinessNumber(e.target.value)}
              placeholder="e.g. 880100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account">Account number</Label>
            <Input
              id="account"
              value={effectiveAccountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Shown on the payment request (max 12)"
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="label">Label (optional)</Label>
        <Input
          id="label"
          value={effectiveLabel ?? ''}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="School fees till"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className={
            compact
              ? 'bg-[#0a1f1a] text-white hover:bg-[#143b31]'
              : undefined
          }
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save destination'
          )}
        </Button>
      </div>

      {stkReady ? (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
          <p className="text-sm font-medium text-slate-900">Test connection (KES 1)</p>
          <p className="text-xs text-slate-500">
            Sends a real M-Pesa request. After you enter the PIN, KES 1 lands in the school bank
            school bank account — it will not appear as a fee payment in SQUL. Confirm
            on the M-Pesa till / Till Number statement.
          </p>
          <div className="space-y-2">
            <Label htmlFor="testPhone">Your Safaricom number</Label>
            <Input
              id="testPhone"
              inputMode="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="07xxxxxxxx"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleTest()}
            disabled={testing}
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Waiting for PIN / result…
              </>
            ) : (
              'Send KES 1 test request'
            )}
          </Button>

          {testIntent ? (
            <div
              className={`rounded-md border px-3 py-2 text-xs ${
                testIntent.status === 'SUCCESS'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                  : testIntent.status === 'FAILED'
                    ? 'border-red-200 bg-red-50 text-red-900'
                    : 'border-slate-200 bg-white text-slate-800'
              }`}
            >
              <p className="font-medium">
                Status: {testIntent.status}
                {testIntent.resultCode ? ` · code ${testIntent.resultCode}` : ''}
              </p>
              <p className="mt-0.5">
                Bank paybill {testIntent.partyB} · {testIntent.phone}
              </p>
              {testIntent.mpesaReceipt ? (
                <p className="mt-0.5 font-mono">Receipt {testIntent.mpesaReceipt}</p>
              ) : null}
              {testIntent.resultDesc ? (
                <p className="mt-0.5 opacity-80">{testIntent.resultDesc}</p>
              ) : null}
              {testIntent.status === 'PENDING' ? (
                <p className="mt-1 opacity-70">
                  Enter PIN on the phone. If this stays PENDING, Safaricom may not
                  reach API_PUBLIC_BASE_URL/api/webhooks/daraja/stk — we still poll
                  M-Pesa confirmation in the background.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
