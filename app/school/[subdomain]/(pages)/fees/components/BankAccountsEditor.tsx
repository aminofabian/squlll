'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BankAccountEditor } from './BankAccountEditor'
import { isBankAccountReady, blankBankAccount } from '../lib/bankAccounts'
import { findKenyaBankByName, bankMonogram, bankShortName } from '../lib/kenyaBanks'
import type { BankAccount } from '../types'

let keySeed = 0
function makeKey() {
  keySeed += 1
  return `bank-${keySeed}`
}

type BankAccountsEditorProps = {
  accounts: BankAccount[]
  onChange: (next: BankAccount[]) => void
  loading?: boolean
  error?: string | null
  /** Focus the account number right after a bank is picked. */
  focusAccountAfterPick?: boolean
  /** Accordion cards used by the payment settings drawer. */
  presentation?: 'default' | 'sheet'
  /** Which card is open, so the fee-letter preview can follow it. */
  onActiveIndex?: (index: number) => void
  className?: string
}

/**
 * Controlled list of school bank accounts for fee letters.
 * Bank picking stays inline so owners can search, tap a bank, then key the
 * school account number without leaving the drawer.
 */
export function BankAccountsEditor({
  accounts,
  onChange,
  loading = false,
  error = null,
  focusAccountAfterPick = false,
  presentation = 'default',
  onActiveIndex,
  className,
}: BankAccountsEditorProps) {
  // Stable keys so removing one account doesn't hand its inline picker state
  // to the account that shifts into its place.
  const [keys, setKeys] = useState<string[]>(() =>
    accounts.length ? accounts.map(makeKey) : ['draft'],
  )
  const [openKey, setOpenKey] = useState<string | null>(keys[0] ?? null)

  useEffect(() => {
    // Re-key only when the list length changes from outside (first load or a
    // reload). Adds and removes update the keys in their own handlers.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keeping local row keys in step with a reloaded list
    setKeys((prev) => {
      if (prev.length === accounts.length) return prev
      if (accounts.length === 0) return ['draft']
      if (prev.length === 1 && prev[0] === 'draft' && accounts.length === 1)
        return prev
      return accounts.map(() => makeKey())
    })
  }, [accounts])

  const rows =
    accounts.length > 0
      ? accounts.map((account, index) => ({ account, index }))
      : [{ account: blankBankAccount(), index: 0 }]

  const activeIndex = rows.findIndex((row) => keys[row.index] === openKey)

  useEffect(() => {
    onActiveIndex?.(activeIndex < 0 ? 0 : activeIndex)
  }, [activeIndex, onActiveIndex])

  const updateAt = (index: number, next: BankAccount) => {
    if (accounts.length === 0) {
      onChange([next])
      return
    }
    onChange(accounts.map((account, i) => (i === index ? next : account)))
  }

  const removeAt = (index: number) => {
    onChange(accounts.filter((_, i) => i !== index))
    setKeys((prev) => prev.filter((_, i) => i !== index))
  }

  const addAccount = () => {
    const key = makeKey()
    if (accounts.length === 0) {
      onChange([blankBankAccount(), blankBankAccount()])
    } else {
      onChange([...accounts, blankBankAccount()])
    }
    setKeys((prev) => [...prev, key])
    setOpenKey(key)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-6 text-[12px] text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading bank accounts…
      </div>
    )
  }

  if (presentation === 'sheet') {
    return (
      <div className={cn('space-y-2.5', className)}>
        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-[11px] text-rose-800">
            {error}
          </p>
        ) : null}
        {rows.map(({ account, index }) => {
            const matched = findKenyaBankByName(account.bankName)
            const ready = isBankAccountReady(account)
            const hasBank = Boolean(account.bankName.trim())
            const key = keys[index] ?? `account-${index}`
            const open = openKey === key
            const canRemove =
              accounts.length > 1 ||
              Boolean(account.bankName || account.branch || account.accountNumber)
            const mark = matched
              ? bankMonogram(matched)
              : (account.bankName || 'BK').slice(0, 2).toUpperCase()
            return (
              <div
                key={key}
                className="overflow-hidden rounded-2xl border border-[#e3ebe6] bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenKey(open ? null : key)}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left"
                  aria-expanded={open}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#d7e3dc] bg-[#f4faf6] text-[10px] font-bold tracking-tight text-[#1a4d42]">
                    {mark}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold leading-tight text-[#0a1f1a]">
                      {matched
                        ? bankShortName(matched)
                        : hasBank
                          ? account.bankName
                          : 'Choose a bank'}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-slate-500">
                      {matched?.name ||
                        (hasBank ? 'Custom bank' : 'Search Equity, KCB, Co-op…')}
                    </span>
                  </span>
                  {hasBank ? (
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                        ready
                          ? 'bg-[#e7f3ec] text-[#1a4d42]'
                          : 'bg-[#f8edd9] text-[#9a6230]',
                      )}
                    >
                      {ready ? 'Ready' : 'Needs account no.'}
                    </span>
                  ) : null}
                  {open ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                </button>
                {open ? (
                  <div className="border-t border-[#eef2f0] px-3 pb-3">
                    <BankAccountEditor
                      value={account}
                      dense
                      presentation="sheet"
                      focusAccountAfterPick={focusAccountAfterPick}
                      onRemove={canRemove ? () => removeAt(index) : undefined}
                      onChange={(next) => updateAt(index, next)}
                    />
                  </div>
                ) : null}
              </div>
            )
          })}
        {accounts.length > 0 || presentation === 'sheet' ? (
          <button
            type="button"
            onClick={addAccount}
            className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[#c9d5ce] bg-transparent px-3 text-[13px] font-medium text-[#3d524c] transition-colors hover:border-[#246a59]/45 hover:bg-white/70"
          >
            <Plus className="h-3.5 w-3.5" />
            Add another bank
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2.5', className)}>
      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-[11px] text-rose-800">
          {error}
        </p>
      ) : null}

      {rows.map(({ account, index }) => {
        const matched = findKenyaBankByName(account.bankName)
        const ready = isBankAccountReady(account)
        const hasBank = Boolean(account.bankName.trim())
        return (
          <div
            key={keys[index] ?? `account-${index}`}
            className="overflow-hidden rounded-xl border border-slate-200/80 bg-white"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-2.5 py-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {accounts.length > 1
                    ? `Account ${index + 1}`
                    : hasBank
                      ? 'School bank'
                      : 'Choose a bank'}
                </p>
                {hasBank ? (
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-1.5 py-0.5 text-[8.5px] font-bold',
                      ready
                        ? 'bg-[#e8f2ef] text-[#1a4d42]'
                        : 'bg-amber-50 text-amber-800',
                    )}
                  >
                    {ready ? 'Ready' : 'Needs account no.'}
                  </span>
                ) : null}
                {matched && accounts.length > 1 ? (
                  <span className="truncate text-[9px] text-slate-400">
                    {bankShortName(matched)}
                  </span>
                ) : null}
              </div>
              {accounts.length > 1 ||
              Boolean(
                account.bankName || account.branch || account.accountNumber,
              ) ? (
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label={`Remove account ${index + 1}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
            <div className="p-2.5 sm:p-3">
              <BankAccountEditor
                value={account}
                dense
                focusAccountAfterPick={focusAccountAfterPick}
                onChange={(next) => updateAt(index, next)}
              />
            </div>
          </div>
        )
      })}

      {accounts.length > 0 ? (
        <button
          type="button"
          onClick={addAccount}
          className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#1a4d42]/25 bg-white/60 px-3 text-[11.5px] font-semibold text-[#1a4d42]/70 transition-colors hover:border-[#246a59]/45 hover:bg-white hover:text-[#0a1f1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/35"
        >
          <Plus className="h-3.5 w-3.5" />
          Add another bank
        </button>
      ) : null}
    </div>
  )
}
