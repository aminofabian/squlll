'use client'

import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useTenantFeeLetterSettings } from '../hooks/useTenantFeeLetterSettings'
import { BankAccountEditor } from './BankAccountEditor'
import type { BankAccount } from '../types'

/**
 * Bank accounts shown on fee letters / parent payment instructions.
 * Used for M-Pesa bank paybills and fee letters.
 */
export function SchoolBankAccountsPanel({
  compact = false,
}: {
  compact?: boolean
}) {
  const { toast } = useToast()
  const params = useParams()
  const subdomain =
    typeof params.subdomain === 'string' ? params.subdomain : 'school'
  const { details, setDetails, loading, saving, saveNow, error } =
    useTenantFeeLetterSettings(subdomain)

  const accounts = details.paymentModes.bankAccounts

  const patchAccount = (index: number, next: BankAccount) => {
    const list = [...accounts]
    list[index] = next
    setDetails({
      ...details,
      paymentModes: { ...details.paymentModes, bankAccounts: list },
    })
  }

  const addAccount = () => {
    setDetails({
      ...details,
      paymentModes: {
        ...details.paymentModes,
        bankAccounts: [
          ...accounts,
          { bankName: '', branch: '', accountNumber: '' },
        ],
      },
    })
  }

  const removeAccount = (index: number) => {
    setDetails({
      ...details,
      paymentModes: {
        ...details.paymentModes,
        bankAccounts: accounts.filter((_, i) => i !== index),
      },
    })
  }

  const handleSave = async () => {
    const cleaned = accounts
      .map((a) => ({
        bankName: a.bankName.trim(),
        branch: (a.branch ?? '').trim(),
        accountNumber: (a.accountNumber ?? '').trim(),
      }))
      .filter((a) => a.bankName || a.branch || a.accountNumber)

    const next = {
      ...details,
      paymentModes: { ...details.paymentModes, bankAccounts: cleaned },
    }
    setDetails(next)

    try {
      await saveNow(next)
      toast({
        title: 'Bank details saved',
        description:
          'Paybill + account are used for M-Pesa payments and fee letters.',
      })
    } catch (e) {
      toast({
        title: 'Could not save banks',
        description: e instanceof Error ? e.message : 'Save failed',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading bank accounts…
      </div>
    )
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-5'}>
      {!compact ? (
        <div>
          <h2 className="text-base font-semibold text-slate-900">Bank account for M-Pesa</h2>
          <p className="mt-1 text-sm text-slate-600">
            Pick the school bank — we fill the M-Pesa paybill (for example NCBA 880100). You only add the school fee account number.
          </p>
        </div>
      ) : (
        <p className="text-[12px] leading-relaxed text-[#1a4d42]/65 dark:text-white/55">
          Pick the bank, check the M-Pesa paybill, then add the school account number. Parents pay into this account and it prints on fee letters.
        </p>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="space-y-4">
        {(accounts.length ? accounts : [{ bankName: '', branch: '', accountNumber: '' }]).map((bank, index) => (
          <div
            key={accounts.length === 0 ? 'draft' : `${index}-${bank.bankName}`}
            className="space-y-3 border border-[#1a4d42]/12 bg-[#fbfcfb] p-3 dark:border-white/10 dark:bg-[#0c1a17]"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
                {accounts.length > 1 ? `Account ${index + 1}` : 'School account'}
              </p>
              {accounts.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-red-600"
                  onClick={() => removeAccount(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
            <BankAccountEditor
              value={bank}
              onChange={(next) => {
                if (accounts.length === 0) {
                  setDetails({
                    ...details,
                    paymentModes: {
                      ...details.paymentModes,
                      bankAccounts: [next],
                    },
                  })
                  return
                }
                patchAccount(index, next)
              }}
              dense={compact}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className={compact ? 'h-9 bg-[#0a1f1a] text-white hover:bg-[#246a59]' : undefined}
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save for fee letters'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={addAccount}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add another account
        </Button>
      </div>
    </div>
  )
}
