'use client'

import { useMemo, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  bankShortName,
  findKenyaBankByName,
  formatBankPaybillLine,
  popularKenyaBanks,
  searchKenyaBanks,
  type KenyaBankOption,
} from '../lib/kenyaBanks'
import type { BankAccount } from '../types'

type BankAccountEditorProps = {
  value: BankAccount
  onChange: (next: BankAccount) => void
  dense?: boolean
}

export function BankAccountEditor({
  value,
  onChange,
  dense = false,
}: BankAccountEditorProps) {
  const matched = findKenyaBankByName(value.bankName)
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [picking, setPicking] = useState(!value.bankName.trim())
  const [custom, setCustom] = useState(
    Boolean(value.bankName.trim()) && !matched,
  )

  const chooseBank = (bank: KenyaBankOption) => {
    setCustom(false)
    setPicking(false)
    setQuery('')
    setShowAll(false)
    onChange({
      bankName: bank.name,
      branch: bank.businessNumber ?? '',
      accountNumber: value.accountNumber,
    })
  }

  const chooseCustom = () => {
    setCustom(true)
    setPicking(false)
    setQuery('')
    onChange({
      bankName: matched ? '' : value.bankName,
      branch: matched ? '' : value.branch,
      accountNumber: value.accountNumber,
    })
  }

  if (!picking && (matched || custom || value.bankName.trim())) {
    return (
      <ChosenBank
        value={value}
        matched={matched}
        custom={custom || (!matched && Boolean(value.bankName.trim()))}
        dense={dense}
        onChange={onChange}
        onChangeBank={() => setPicking(true)}
      />
    )
  }

  return (
    <BankPicker
      query={query}
      showAll={showAll}
      dense={dense}
      onQuery={(next) => {
        setQuery(next)
        if (next.trim()) setShowAll(true)
      }}
      onShowAll={() => setShowAll(true)}
      onChoose={chooseBank}
      onCustom={chooseCustom}
    />
  )
}

function BankPicker({
  query,
  showAll,
  dense,
  onQuery,
  onShowAll,
  onChoose,
  onCustom,
}: {
  query: string
  showAll: boolean
  dense: boolean
  onQuery: (value: string) => void
  onShowAll: () => void
  onChoose: (bank: KenyaBankOption) => void
  onCustom: () => void
}) {
  const popular = popularKenyaBanks()
  const results = useMemo(() => searchKenyaBanks(query), [query])
  const searching = query.trim().length > 0
  const list = searching || showAll ? results : []

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className={dense ? 'text-xs' : undefined}>Which bank?</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1a4d42]/40" />
          <Input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search Equity, KCB, Co-op…"
            className={cn('pl-8', dense && 'h-9 rounded-none bg-white shadow-none')}
          />
        </div>
      </div>

      {!searching ? (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
            Common choices
          </p>
          <div className="flex flex-wrap gap-1.5">
            {popular.map((bank) => (
              <button
                key={bank.id}
                type="button"
                onClick={() => onChoose(bank)}
                className="border border-[#1a4d42]/15 bg-white px-2.5 py-1.5 text-xs font-medium text-[#0a1f1a] hover:border-[#246a59] hover:bg-[#e8f2ef]"
              >
                {bankShortName(bank)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {list.length > 0 ? (
        <ul className="max-h-52 overflow-y-auto border border-[#1a4d42]/12 bg-white">
          {list.map((bank) => (
            <li key={bank.id}>
              <button
                type="button"
                onClick={() => onChoose(bank)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-[#f3f7f5]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-[#0a1f1a]">
                    {bankShortName(bank)}
                  </span>
                  <span className="block truncate text-[10px] text-[#1a4d42]/45">
                    {bank.name}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[10px] text-[#246a59]">
                  {bank.businessNumber ? `Paybill ${bank.businessNumber}` : 'Add paybill'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {searching && list.length === 0 ? (
        <p className="text-xs text-[#1a4d42]/55">No bank matches “{query.trim()}”.</p>
      ) : null}

      {!searching && !showAll ? (
        <button
          type="button"
          onClick={onShowAll}
          className="text-xs font-medium text-[#246a59] hover:underline"
        >
          Show every bank
        </button>
      ) : null}

      <button
        type="button"
        onClick={onCustom}
        className="text-xs text-[#1a4d42]/60 underline-offset-2 hover:text-[#0a1f1a] hover:underline"
      >
        My bank isn’t listed
      </button>
    </div>
  )
}

function ChosenBank({
  value,
  matched,
  custom,
  dense,
  onChange,
  onChangeBank,
}: {
  value: BankAccount
  matched: KenyaBankOption | null
  custom: boolean
  dense: boolean
  onChange: (next: BankAccount) => void
  onChangeBank: () => void
}) {
  const inputClass = dense ? 'h-9 rounded-none bg-white shadow-none' : undefined
  const paybill = formatBankPaybillLine(value.branch)
  const title = matched ? bankShortName(matched) : value.bankName || 'Your bank'

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3 border border-[#246a59]/25 bg-[#e8f2ef] px-3 py-2.5">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-[#0a1f1a]">
            <Check className="h-3.5 w-3.5 text-[#246a59]" />
            {title}
          </p>
          <p className="mt-0.5 text-[11px] text-[#1a4d42]/60">
            {paybill || 'Add the paybill below'}
          </p>
        </div>
        <button
          type="button"
          onClick={onChangeBank}
          className="shrink-0 text-xs font-medium text-[#246a59] hover:underline"
        >
          Change
        </button>
      </div>

      {custom ? (
        <Field label="Bank name" dense={dense}>
          <Input
            value={value.bankName}
            onChange={(event) => onChange({ ...value, bankName: event.target.value })}
            placeholder="Sacco or bank name"
            className={inputClass}
          />
        </Field>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Paybill" dense={dense}>
          <Input
            inputMode="numeric"
            value={value.branch}
            onChange={(event) =>
              onChange({ ...value, branch: event.target.value.replace(/\s+/g, '') })
            }
            placeholder={matched?.businessNumber ? 'Filled in for you' : 'From your bank'}
            className={inputClass}
          />
        </Field>
        <Field label="Account number" dense={dense}>
          <Input
            value={value.accountNumber}
            onChange={(event) => onChange({ ...value, accountNumber: event.target.value })}
            placeholder="School account number"
            className={inputClass}
          />
        </Field>
      </div>

      <LetterPreview value={value} title={matched?.name || value.bankName} />
    </div>
  )
}

function Field({
  label,
  dense,
  children,
}: {
  label: string
  dense: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <Label className={dense ? 'text-xs' : undefined}>{label}</Label>
      {children}
    </label>
  )
}

function LetterPreview({ value, title }: { value: BankAccount; title: string }) {
  if (!title.trim() && !value.accountNumber.trim() && !value.branch.trim()) return null
  const paybill = formatBankPaybillLine(value.branch)
  return (
    <div className="border border-dashed border-[#1a4d42]/20 bg-[#f8fbfa] px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/40">
        Parents will see
      </p>
      <p className="mt-1 text-sm font-medium text-[#0a1f1a]">{title || 'Bank'}</p>
      <p className="text-xs text-[#1a4d42]/60">
        {[paybill, value.accountNumber.trim() ? `Account ${value.accountNumber.trim()}` : 'Account number missing']
          .filter(Boolean)
          .join(' · ')}
      </p>
    </div>
  )
}
