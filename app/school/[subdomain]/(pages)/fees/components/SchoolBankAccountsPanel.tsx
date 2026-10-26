'use client'

import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useTenantFeeLetterSettings } from '../hooks/useTenantFeeLetterSettings'
import { BankAccountsEditor } from './BankAccountsEditor'
import { cleanBankAccounts } from '../lib/bankAccounts'
import type { BankAccount } from '../types'

/**
 * Standalone bank-account editor for fee letters / parent payment instructions.
 * The payments drawer uses `BankAccountsEditor` directly so it can own the
 * footer save action.
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

  const setAccounts = (next: BankAccount[]) => {
    setDetails({
      ...details,
      paymentModes: { ...details.paymentModes, bankAccounts: next },
    })
  }

  const handleSave = async () => {
    const cleaned = cleanBankAccounts(accounts)
    const next = {
      ...details,
      paymentModes: { ...details.paymentModes, bankAccounts: cleaned },
    }

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

  return (
    <div className={compact ? 'space-y-4' : 'space-y-5'}>
      {!compact ? (
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Bank account for M-Pesa
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Pick the school bank — we fill the M-Pesa paybill (for example NCBA
            880100). You only add the school fee account number.
          </p>
        </div>
      ) : (
        <p className="text-[12px] leading-relaxed text-[#1a4d42]/65">
          Pick the bank, check the M-Pesa paybill, then add the school account
          number. Parents pay into this account and it prints on fee letters.
        </p>
      )}

      <BankAccountsEditor
        accounts={accounts}
        onChange={setAccounts}
        loading={loading}
        error={error}
        focusAccountAfterPick
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className={
            compact ? 'h-9 bg-[#0a1f1a] text-white hover:bg-[#246a59]' : undefined
          }
          onClick={() => void handleSave()}
          disabled={saving || loading}
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
      </div>
    </div>
  )
}
