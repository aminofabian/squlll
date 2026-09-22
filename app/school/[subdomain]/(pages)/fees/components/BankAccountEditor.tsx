'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CUSTOM_BANK_ID,
  findKenyaBankByName,
  KENYA_BANKS,
} from '../lib/kenyaBanks'
import type { BankAccount } from '../types'

type BankAccountEditorProps = {
  value: BankAccount
  onChange: (next: BankAccount) => void
  /** Slightly denser for sheets */
  dense?: boolean
}

/**
 * Pick a Kenyan bank → auto-fill Lipa Na M-Pesa business number (editable).
 * Or choose “Other” and enter bank + business number manually.
 * Account number is always manual.
 *
 * Persists business/paybill in `branch` (existing fee-letter field).
 */
export function BankAccountEditor({
  value,
  onChange,
  dense = false,
}: BankAccountEditorProps) {
  const matched = findKenyaBankByName(value.bankName)
  const [forcedCustom, setForcedCustom] = useState(false)

  const hasAny =
    Boolean(value.bankName.trim()) ||
    Boolean(value.branch?.trim()) ||
    Boolean(value.accountNumber?.trim())

  const isCustom = forcedCustom || (!matched && hasAny)
  const selectValue = matched
    ? matched.id
    : isCustom
      ? CUSTOM_BANK_ID
      : undefined

  const inputClass = dense ? 'h-9 bg-white' : undefined

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className={dense ? 'text-xs' : undefined}>Bank</Label>
        <Select
          value={selectValue}
          onValueChange={(id) => {
            if (id === CUSTOM_BANK_ID) {
              setForcedCustom(true)
              onChange({
                bankName: matched ? '' : value.bankName,
                branch: matched ? '' : value.branch,
                accountNumber: value.accountNumber,
              })
              return
            }
            setForcedCustom(false)
            const bank = KENYA_BANKS.find((b) => b.id === id)
            if (!bank) return
            onChange({
              bankName: bank.name,
              branch: bank.businessNumber ?? '',
              accountNumber: value.accountNumber,
            })
          }}
        >
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder="Select a Kenyan bank…" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {KENYA_BANKS.map((bank) => (
              <SelectItem key={bank.id} value={bank.id}>
                <span className="flex w-full min-w-[16rem] items-baseline justify-between gap-3">
                  <span className="truncate">{bank.name}</span>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {bank.businessNumber ?? 'confirm'}
                  </span>
                </span>
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_BANK_ID}>
              Other bank (enter details)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isCustom ? (
        <div className="space-y-1.5">
          <Label className={dense ? 'text-xs' : undefined}>Bank name</Label>
          <Input
            value={value.bankName}
            onChange={(e) => onChange({ ...value, bankName: e.target.value })}
            placeholder="e.g. My local Sacco / bank"
            className={inputClass}
          />
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className={dense ? 'text-xs' : undefined}>
            Business / paybill no.
          </Label>
          <Input
            inputMode="numeric"
            value={value.branch}
            onChange={(e) =>
              onChange({
                ...value,
                branch: e.target.value.replace(/\s+/g, ''),
              })
            }
            placeholder={
              matched && !matched.businessNumber
                ? 'Confirm with your bank'
                : 'Auto-filled · editable'
            }
            className={inputClass}
          />
          {matched?.businessNumber ? (
            <p className="text-[10px] leading-snug text-[#1a4d42]/50">
              Prefilled for {matched.name.split(' ')[0]} — change if yours
              differs.
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label className={dense ? 'text-xs' : undefined}>Account number</Label>
          <Input
            value={value.accountNumber}
            onChange={(e) =>
              onChange({ ...value, accountNumber: e.target.value })
            }
            placeholder="Your school account no."
            className={inputClass}
          />
        </div>
      </div>
    </div>
  )
}
