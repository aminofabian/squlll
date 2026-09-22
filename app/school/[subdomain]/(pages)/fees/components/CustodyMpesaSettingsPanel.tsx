'use client'

import { useEffect, useState } from 'react'
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

/**
 * School Payments settings — till or HO paybill only.
 * No Daraja API keys. Platform owns Express; school owns PartyB.
 */
export function CustodyMpesaSettingsPanel() {
  const { toast } = useToast()
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

  const [type, setType] = useState<CustodyDestinationType>('till')
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
        <p className="font-medium">Till / paybill Express is not available yet</p>
        <p className="mt-1 text-amber-800">
          {availability?.reason ??
            'Platform custody rail is off. Ask SQUL ops to enable Daraja custody on the super-admin Payments page.'}
        </p>
      </div>
    )
  }

  const buildInput = () =>
    type === 'till'
      ? { type: 'till' as const, tillNumber, label: label || undefined }
      : {
          type: 'paybill' as const,
          businessNumber,
          accountNumber,
          label: label || undefined,
        }

  const handleSave = async () => {
    try {
      await saveDestination(buildInput())
      toast({
        title: 'Saved',
        description:
          'Till / paybill saved. Money from STK lands directly on this PartyB (no B2B).',
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
        description: 'Enter the Safaricom number that should receive the KES 1 prompt',
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
        title: 'STK sent — enter PIN on phone',
        description: `KES 1 → till ${intent.partyB}. This test does not create a fee payment in SQUL; check M-Pesa till statement for the credit.`,
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
                : 'STK ended without success',
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
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          Till / paybill — M-Pesa Express
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          SQUL holds one Lipa Na M-Pesa Go Live. You only enter your Buy Goods
          till or Head Office paybill. Customers get a PIN prompt; money credits
          your till directly (PartyB). No API keys. No B2B forward.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Your till must sit under SQUL’s M-Pesa Head Office. Bank shared
          paybills (e.g. NCBA 880100) cannot use this rail.
        </p>
      </div>

      {!stkReady ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950">
          You can save your till now. STK prompts stay disabled until SQUL
          finishes platform Daraja setup
          {availability?.reason ? ` (${availability.reason})` : ''}.
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      <div className="space-y-2">
        <Label>Destination type</Label>
        <Select
          value={type}
          onValueChange={(v) => setType(v as CustodyDestinationType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="till">Buy Goods till</SelectItem>
            <SelectItem value="paybill">Paybill (same Head Office)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === 'till' ? (
        <div className="space-y-2">
          <Label htmlFor="till">Till number</Label>
          <Input
            id="till"
            inputMode="numeric"
            value={tillNumber}
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
              value={businessNumber}
              onChange={(e) => setBusinessNumber(e.target.value)}
              placeholder="5–7 digits under SQUL HO"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account">Account number</Label>
            <Input
              id="account"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Shown on the STK prompt (max 12)"
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="label">Label (optional)</Label>
        <Input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="School fees till"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
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
            Sends a real Express prompt. After you enter PIN, KES 1 lands on your
            till (PartyB) — it will not appear as a fee payment in SQUL. Confirm
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
              'Send KES 1 test prompt'
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
                PartyB till {testIntent.partyB} · {testIntent.phone}
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
                  Daraja query in the background.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
