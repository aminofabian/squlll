'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Copy,
  CreditCard,
  ExternalLink,
  Globe,
  ImagePlus,
  Loader2,
  Smartphone,
  Trash2,
  UserRound,
} from 'lucide-react'
import Link from 'next/link'
import { GeneratedSchoolLogo } from '@/components/school/GeneratedSchoolLogo'
import { FEES_BRAND } from '../../lib/fees-ui'
import type { LetterSchoolDetailsPayload } from '../../lib/feeLetter/letterSchoolDetails'
import {
  copyPortalUrl,
  formatPortalUrlForDisplay,
} from '../../lib/feeLetter/schoolPortalUrl'
import type { BankAccount } from '../../types'
import { useMpesaCustody } from '../../hooks/useMpesaCustody'
import { BankAccountEditor } from '../BankAccountEditor'

function LetterMpesaTillCard() {
  const { availability, destination, loading } = useMpesaCustody()

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading M-Pesa till…
      </div>
    )
  }

  if (!availability?.available && availability?.custodyProvider !== 'DARAJA') {
    return (
      <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-600">
        <p className="font-medium text-slate-800">M-Pesa Express (till / paybill)</p>
        <p className="mt-1 text-slate-500">
          Not available yet — platform custody is off, or Daraja is not configured.
        </p>
        <Button type="button" variant="outline" size="sm" className="mt-2 h-7 text-xs" asChild>
          <Link href="/dashboard?payments=open">Open payment settings</Link>
        </Button>
      </div>
    )
  }

  const line =
    destination?.type === 'till'
      ? `Buy Goods till ${destination.tillNumber}`
      : destination?.type === 'paybill'
        ? `Paybill ${destination.businessNumber} · Acc ${destination.accountNumber}`
        : null

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950">
      <p className="flex items-center gap-1.5 font-medium">
        <Smartphone className="h-3.5 w-3.5" />
        M-Pesa Express on letters
      </p>
      {line ? (
        <p className="mt-1 font-mono text-[11px]">{line}</p>
      ) : (
        <p className="mt-1 text-emerald-900/80">
          No till/paybill saved yet — parents won&apos;t see STK until you add one.
        </p>
      )}
      <p className="mt-1 text-[10px] text-emerald-900/70">
        Shown to parents as PartyB. Configure under Fees → M-Pesa till / paybill.
      </p>
      <Button type="button" variant="outline" size="sm" className="mt-2 h-7 text-xs" asChild>
        <Link href="/dashboard?payments=open">
          {line ? 'Edit till / paybill' : 'Add till / paybill'}
        </Link>
      </Button>
    </div>
  )
}

type LetterSchoolDetailsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: LetterSchoolDetailsPayload
  onChange: (next: LetterSchoolDetailsPayload) => void
  onSave?: (next: LetterSchoolDetailsPayload) => Promise<void>
  schoolLogoKey: string
  portalUrl?: string
  saving?: boolean
}

export function LetterSchoolDetailsSheet({
  open,
  onOpenChange,
  value,
  onChange,
  onSave,
  schoolLogoKey,
  portalUrl = '',
  saving = false,
}: LetterSchoolDetailsSheetProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState('school')
  const portalHost = formatPortalUrlForDisplay(portalUrl)

  const updateSchool = (
    key: keyof LetterSchoolDetailsPayload['schoolDetails'],
    fieldValue: string,
  ) => {
    onChange({
      ...value,
      schoolDetails: { ...value.schoolDetails, [key]: fieldValue },
    })
  }

  const updatePayment = <K extends keyof LetterSchoolDetailsPayload['paymentModes']>(
    key: K,
    fieldValue: LetterSchoolDetailsPayload['paymentModes'][K],
  ) => {
    onChange({
      ...value,
      paymentModes: { ...value.paymentModes, [key]: fieldValue },
    })
  }

  const updateBank = (index: number, next: BankAccount) => {
    const accounts = [...value.paymentModes.bankAccounts]
    accounts[index] = next
    updatePayment('bankAccounts', accounts)
  }

  const handleLogoPick = (file: File | undefined) => {
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () =>
      onChange({ ...value, logoUrl: reader.result as string })
    reader.readAsDataURL(file)
  }

  const handleDone = async () => {
    if (onSave) await onSave(value)
    onOpenChange(false)
  }

  const notesText = value.paymentModes.notes.join('\n')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <SheetHeader className="shrink-0 border-b px-4 py-3 text-left space-y-1">
          <SheetTitle className="text-base font-semibold">
            Letter details
          </SheetTitle>
          <SheetDescription className="text-xs">
            Saved for your whole school — loads automatically next time.
          </SheetDescription>
        </SheetHeader>

        {portalUrl ? (
          <div className="shrink-0 border-b px-4 py-2.5 flex items-center gap-2 bg-slate-50/80">
            <Globe
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: FEES_BRAND.primary }}
            />
            <span className="flex-1 truncate font-mono text-xs text-slate-700">
              {portalHost}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={async () => {
                const ok = await copyPortalUrl(portalUrl)
                if (ok) {
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }
              }}
            >
              <Copy className="h-3 w-3" />
              {copied ? 'Copied' : ''}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
              <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        ) : null}

        <Tabs
          value={tab}
          onValueChange={setTab}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <TabsList className="mx-4 mt-3 grid w-auto grid-cols-3 shrink-0">
            <TabsTrigger value="school" className="text-xs">
              School
            </TabsTrigger>
            <TabsTrigger value="signatory" className="text-xs">
              Signatory
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-xs">
              Payment
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            <TabsContent value="school" className="mt-0 space-y-4">
              <div className="flex items-center gap-3">
                {value.logoUrl ? (
                  <div className="relative shrink-0">
                    <img
                      src={value.logoUrl}
                      alt=""
                      className="h-16 w-16 rounded-lg object-contain ring-1 ring-slate-200"
                    />
                    <button
                      type="button"
                      className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 shadow ring-1 ring-slate-200"
                      onClick={() => onChange({ ...value, logoUrl: null })}
                    >
                      <Trash2 className="h-3 w-3 text-rose-600" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="shrink-0"
                    onClick={() => fileRef.current?.click()}
                  >
                    <GeneratedSchoolLogo
                      schoolKey={schoolLogoKey}
                      className="w-14 aspect-[88/96]"
                    />
                  </button>
                )}
                <div className="flex-1 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs w-full"
                    onClick={() => fileRef.current?.click()}
                  >
                    <ImagePlus className="h-3.5 w-3.5 mr-1" />
                    {value.logoUrl ? 'Change logo' : 'Upload logo'}
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handleLogoPick(e.target.files?.[0])
                      e.target.value = ''
                    }}
                  />
                </div>
              </div>
              <Field label="School name">
                <Input
                  value={value.schoolDetails.name}
                  onChange={(e) => updateSchool('name', e.target.value)}
                  className="h-9"
                />
              </Field>
              <Field label="Motto on letter">
                <Input
                  value={value.schoolMotto}
                  onChange={(e) =>
                    onChange({ ...value, schoolMotto: e.target.value })
                  }
                  className="h-9"
                />
              </Field>
              <Field label="Postal address">
                <Input
                  value={value.schoolDetails.address}
                  onChange={(e) => updateSchool('address', e.target.value)}
                  className="h-9"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone">
                  <Input
                    value={value.schoolDetails.contact}
                    onChange={(e) => updateSchool('contact', e.target.value)}
                    className="h-9"
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={value.schoolDetails.email}
                    onChange={(e) => updateSchool('email', e.target.value)}
                    className="h-9"
                  />
                </Field>
              </div>
            </TabsContent>

            <TabsContent value="signatory" className="mt-0 space-y-4">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" />
                Appears on the signature block of the letter.
              </p>
              <Field label="Principal / signatory name">
                <Input
                  value={value.schoolDetails.principalName}
                  onChange={(e) =>
                    updateSchool('principalName', e.target.value)
                  }
                  className="h-9"
                  placeholder="e.g. Jacob Mbogo"
                />
              </Field>
              <Field label="Title on letter">
                <Input
                  value={value.schoolDetails.principalTitle}
                  onChange={(e) =>
                    updateSchool('principalTitle', e.target.value)
                  }
                  className="h-9"
                  placeholder="PRINCIPAL / SEC BOM"
                />
              </Field>
            </TabsContent>

            <TabsContent value="payment" className="mt-0 space-y-4">
              <LetterMpesaTillCard />
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                Bank accounts listed on the letter.
              </p>
              {value.paymentModes.bankAccounts.map((bank, index) => (
                <div
                  key={index}
                  className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">
                      Bank {index + 1}
                    </span>
                    {value.paymentModes.bankAccounts.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1 text-xs text-rose-600"
                        onClick={() => {
                          updatePayment(
                            'bankAccounts',
                            value.paymentModes.bankAccounts.filter(
                              (_, i) => i !== index,
                            ),
                          )
                        }}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <BankAccountEditor
                    dense
                    value={bank}
                    onChange={(next) => updateBank(index, next)}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs w-full"
                onClick={() =>
                  updatePayment('bankAccounts', [
                    ...value.paymentModes.bankAccounts,
                    { bankName: '', branch: '', accountNumber: '' },
                  ])
                }
              >
                Add bank account
              </Button>

              <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Postal money order
                  </p>
                  <p className="text-xs text-slate-500">Optional on letter</p>
                </div>
                <Switch
                  checked={Boolean(value.paymentModes.includePostalMoneyOrder)}
                  onCheckedChange={(checked) =>
                    updatePayment('includePostalMoneyOrder', checked)
                  }
                />
              </div>
              {value.paymentModes.includePostalMoneyOrder ? (
                <Field label="Postal money order details">
                  <Input
                    value={value.paymentModes.postalAddress}
                    onChange={(e) =>
                      updatePayment('postalAddress', e.target.value)
                    }
                    placeholder="Payable at … Post Office"
                    className="h-9"
                  />
                </Field>
              ) : null}

              <Field label="Notes (NB.) — one per line">
                <Textarea
                  value={notesText}
                  onChange={(e) =>
                    updatePayment(
                      'notes',
                      e.target.value
                        .split('\n')
                        .map((l) => l.trim())
                        .filter(Boolean),
                    )
                  }
                  rows={3}
                  className="text-sm resize-y min-h-[72px]"
                />
              </Field>
            </TabsContent>
          </div>
        </Tabs>

        <div className="shrink-0 border-t bg-white px-4 py-3">
          <Button
            type="button"
            className="w-full text-white h-10"
            style={{ backgroundColor: FEES_BRAND.primary }}
            disabled={saving}
            onClick={handleDone}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving…
              </>
            ) : (
              'Save & close'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <Label className="text-xs text-slate-500 mb-1 block">{label}</Label>
      {children}
    </div>
  )
}
