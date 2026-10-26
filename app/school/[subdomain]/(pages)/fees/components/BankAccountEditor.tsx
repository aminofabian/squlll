'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronLeft, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  KENYA_BANKS,
  bankMonogram,
  bankPaybillLabel,
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
  /** Focus the account number as soon as a bank is picked (drawer flow). */
  focusAccountAfterPick?: boolean
}

export function BankAccountEditor({
  value,
  onChange,
  dense = false,
  focusAccountAfterPick = false,
}: BankAccountEditorProps) {
  const matched = findKenyaBankByName(value.bankName)
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [picking, setPicking] = useState(!value.bankName.trim())
  const [custom, setCustom] = useState(
    Boolean(value.bankName.trim()) && !matched,
  )
  const [focusAccount, setFocusAccount] = useState(false)

  const chooseBank = (bank: KenyaBankOption) => {
    setCustom(false)
    setPicking(false)
    setQuery('')
    setShowAll(false)
    setFocusAccount(focusAccountAfterPick)
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
    setShowAll(false)
    setFocusAccount(false)
    onChange({
      bankName: '',
      branch: '',
      accountNumber: value.accountNumber,
    })
  }

  if (!picking && (matched || custom || value.bankName.trim())) {
    return (
      <ChosenBank
        value={value}
        matched={custom ? null : matched}
        custom={custom || (!matched && Boolean(value.bankName.trim()))}
        dense={dense}
        autoFocusAccount={focusAccount}
        onChange={onChange}
        onChangeBank={() => {
          setPicking(true)
          setCustom(false)
          setQuery('')
          setShowAll(false)
        }}
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
        if (next.trim()) setShowAll(false)
      }}
      onShowAll={() => setShowAll(true)}
      onBackToPopular={() => {
        setShowAll(false)
        setQuery('')
      }}
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
  onBackToPopular,
  onChoose,
  onCustom,
}: {
  query: string
  showAll: boolean
  dense: boolean
  onQuery: (value: string) => void
  onShowAll: () => void
  onBackToPopular: () => void
  onChoose: (bank: KenyaBankOption) => void
  onCustom: () => void
}) {
  const popular = popularKenyaBanks()
  const searching = query.trim().length > 0
  const results = useMemo(() => searchKenyaBanks(query), [query])
  const list = searching || showAll ? results : []
  const inputClass = cn(
    'pl-9 text-[13px]',
    dense ? 'h-9 rounded-lg bg-white shadow-none' : 'h-10',
  )

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1a4d42]/40" />
        <Input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search Equity, KCB, 247247…"
          aria-label="Search banks"
          className={cn(inputClass, query && 'pr-9')}
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQuery('')}
            aria-label="Clear bank search"
            className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#1a4d42]/45 transition-colors hover:bg-[#eef7f1] hover:text-[#0a1f1a]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {!searching && !showAll ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#1a4d42]/45">
              Most schools
            </p>
            <button
              type="button"
              onClick={onShowAll}
              className="inline-flex min-h-8 items-center rounded-md px-1 text-[10.5px] font-semibold text-[#246a59] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/35"
            >
              All {KENYA_BANKS.length} banks
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {popular.map((bank) => (
              <BankTile key={bank.id} bank={bank} onChoose={onChoose} dense={dense} />
            ))}
          </div>
        </div>
      ) : null}

      {searching || showAll ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#1a4d42]/45">
              {searching
                ? `${results.length} bank${results.length === 1 ? '' : 's'} found`
                : `All ${results.length} banks`}
            </p>
            {showAll && !searching ? (
              <button
                type="button"
                onClick={onBackToPopular}
                className="inline-flex min-h-8 items-center gap-1 text-[10.5px] font-semibold text-[#246a59] hover:underline"
              >
                <ChevronLeft className="h-3 w-3" />
                Common banks
              </button>
            ) : null}
          </div>

          {list.length > 0 ? (
            <ul className="max-h-[19rem] divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white">
              {list.map((bank) => (
                <li key={bank.id}>
                  <button
                    type="button"
                    onClick={() => onChoose(bank)}
                    className="flex min-h-12 w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors hover:bg-[#f3f7f5] focus-visible:bg-[#f3f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#246a59]/35 active:bg-[#e8f2ef]"
                  >
                    <BankMark bank={bank} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold text-[#0a1f1a]">
                        {bankShortName(bank)}
                      </span>
                      <span className="block truncate text-[9.5px] text-[#1a4d42]/50">
                        {bank.name}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold',
                        bank.businessNumber
                          ? 'bg-[#e8f2ef] text-[#1a4d42]'
                          : 'bg-amber-50 text-amber-800',
                      )}
                    >
                      {bank.businessNumber
                        ? `Paybill ${bank.businessNumber}`
                        : 'On slip'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-2 rounded-xl border border-dashed border-[#1a4d42]/20 bg-[#f8fbfa] px-3 py-4 text-center">
              <p className="text-[11.5px] font-medium text-[#0a1f1a]">
                No bank matches “{query.trim()}”.
              </p>
              <p className="text-[10px] text-[#1a4d42]/55">
                Saccos, microfinance banks and new banks are fine too.
              </p>
              <button
                type="button"
                onClick={onCustom}
                className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-[#0a1f1a] px-3 text-[11px] font-semibold text-white hover:bg-[#246a59]"
              >
                Use “{query.trim()}”
              </button>
            </div>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onCustom}
        className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#1a4d42]/20 px-2 text-[10.5px] font-medium text-[#1a4d42]/60 transition-colors hover:border-[#246a59]/40 hover:bg-white hover:text-[#0a1f1a] focus-visible:border-[#246a59]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/35"
      >
        My bank isn’t listed (sacco, microfinance)
      </button>
    </div>
  )
}

function BankMark({
  bank,
  size = 'sm',
}: {
  bank: KenyaBankOption
  size?: 'sm' | 'md'
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg border border-[#1a4d42]/10 bg-[#eef7f1] font-bold tracking-tight text-[#1a4d42]',
        size === 'sm'
          ? 'h-8 w-8 text-[9px]'
          : 'h-10 w-10 text-[10.5px]',
      )}
    >
      {bankMonogram(bank)}
    </span>
  )
}

function BankTile({
  bank,
  dense,
  onChoose,
}: {
  bank: KenyaBankOption
  dense: boolean
  onChoose: (bank: KenyaBankOption) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChoose(bank)}
      className={cn(
        'group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-2 text-left transition-all',
        'hover:border-[#246a59]/45 hover:bg-[#f6faf8] focus-visible:border-[#246a59]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/35 active:scale-[0.99]',
        dense ? 'min-h-12' : 'min-h-[3.35rem]',
      )}
    >
      <BankMark bank={bank} size={dense ? 'sm' : 'md'} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-semibold leading-tight text-[#0a1f1a]">
          {bankShortName(bank)}
        </span>
        <span
          className={cn(
            'mt-0.5 block truncate font-mono text-[9px] font-medium',
            bank.businessNumber ? 'text-[#246a59]/85' : 'text-amber-700',
          )}
        >
          {bankPaybillLabel(bank)}
        </span>
      </span>
    </button>
  )
}

function ChosenBank({
  value,
  matched,
  custom,
  dense,
  autoFocusAccount,
  onChange,
  onChangeBank,
}: {
  value: BankAccount
  matched: KenyaBankOption | null
  custom: boolean
  dense: boolean
  autoFocusAccount: boolean
  onChange: (next: BankAccount) => void
  onChangeBank: () => void
}) {
  const inputClass = cn(
    'text-[13px]',
    dense ? 'h-9 rounded-lg bg-white shadow-none' : 'h-10',
  )
  const paybill = formatBankPaybillLine(value.branch)
  const title = matched ? bankShortName(matched) : value.bankName || 'Your bank'
  const subtitle = matched ? matched.name : custom ? 'Custom bank' : ''

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 rounded-xl border border-[#246a59]/25 bg-[#eef7f1] px-2.5 py-2">
        {matched ? (
          <BankMark bank={matched} size="md" />
        ) : (
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#1a4d42]/10 bg-white text-[10px] font-bold text-[#1a4d42]"
          >
            {title.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-[13px] font-semibold text-[#0a1f1a]">
            <Check className="h-3.5 w-3.5 shrink-0 text-[#246a59]" />
            {title}
          </p>
          <p className="truncate text-[10px] text-[#1a4d42]/55">
            {paybill ? `${paybill} · ` : ''}
            {subtitle || (custom ? 'Confirm the paybill on your slip' : 'Add the paybill below')}
          </p>
        </div>
        <button
          type="button"
          onClick={onChangeBank}
          className="inline-flex min-h-8 shrink-0 items-center rounded-md px-2 text-[10.5px] font-semibold text-[#246a59] transition-colors hover:bg-white/70 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/35"
        >
          Change
        </button>
      </div>

      {custom ? (
        <Field label="Bank name" hint="As parents know it" dense={dense}>
          <Input
            value={value.bankName}
            onChange={(event) =>
              onChange({ ...value, bankName: event.target.value })
            }
            placeholder="Sacco or bank name"
            className={inputClass}
            autoFocus
          />
        </Field>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Paybill / business no."
          hint={
            matched?.businessNumber
              ? `Auto-filled for ${bankShortName(matched)}`
              : 'From your bank slip'
          }
          dense={dense}
        >
          <Input
            inputMode="numeric"
            value={value.branch}
            onChange={(event) =>
              onChange({
                ...value,
                branch: event.target.value.replace(/\s+/g, ''),
              })
            }
            placeholder={matched?.businessNumber ? 'Filled in for you' : 'e.g. 400200'}
            className={cn(inputClass, 'font-mono')}
          />
        </Field>
        <Field
          label="School account number"
          hint="Parents key this as the reference"
          dense={dense}
        >
          <Input
            value={value.accountNumber}
            onChange={(event) =>
              onChange({ ...value, accountNumber: event.target.value })
            }
            placeholder="e.g. 0110398765"
            className={cn(inputClass, 'font-mono')}
            autoFocus={autoFocusAccount}
          />
        </Field>
      </div>

      {!value.accountNumber.trim() ? (
        <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] font-medium leading-relaxed text-amber-900">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
          Add the account number — without it parents can’t complete a bank
          payment.
        </p>
      ) : null}

      <LetterPreview value={value} title={matched?.name || value.bankName} />
    </div>
  )
}

function Field({
  label,
  hint,
  dense,
  children,
}: {
  label: string
  hint?: string
  dense: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1">
      <Label className={cn('block text-[10.5px] font-semibold text-[#1a4d42]/70', dense && 'leading-tight')}>
        {label}
      </Label>
      {children}
      {hint ? (
        <span className="block text-[9px] leading-snug text-[#1a4d42]/45">
          {hint}
        </span>
      ) : null}
    </label>
  )
}

function LetterPreview({ value, title }: { value: BankAccount; title: string }) {
  if (!title.trim() && !value.accountNumber.trim() && !value.branch.trim())
    return null
  const paybill = formatBankPaybillLine(value.branch)
  const account = value.accountNumber.trim()

  return (
    <div className="rounded-xl border border-dashed border-[#1a4d42]/20 bg-[#f8fbfa] px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#1a4d42]/40">
        Parents will see
      </p>
      <p className="mt-1 text-[12.5px] font-semibold leading-snug text-[#0a1f1a]">
        {title || 'Bank'}
      </p>
      <div className="mt-1.5 grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <p className="text-[8.5px] uppercase tracking-[0.1em] text-[#1a4d42]/40">
            Paybill
          </p>
          <p className="mt-0.5 font-mono text-[11px] font-semibold text-[#0a1f1a]">
            {paybill.replace(/^Paybill\s*/, '') || '—'}
          </p>
        </div>
        <div>
          <p className="text-[8.5px] uppercase tracking-[0.1em] text-[#1a4d42]/40">
            Account no.
          </p>
          <p
            className={cn(
              'mt-0.5 font-mono text-[11px] font-semibold',
              account ? 'text-[#0a1f1a]' : 'text-amber-700',
            )}
          >
            {account || 'missing'}
          </p>
        </div>
      </div>
    </div>
  )
}
