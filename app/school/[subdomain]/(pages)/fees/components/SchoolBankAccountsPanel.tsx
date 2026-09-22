'use client'

import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useTenantFeeLetterSettings } from '../hooks/useTenantFeeLetterSettings'

/**
 * Bank accounts shown on fee letters / parent payment instructions.
 * Separate from M-Pesa Express till (PartyB).
 */
export function SchoolBankAccountsPanel() {
  const { toast } = useToast()
  const params = useParams()
  const subdomain =
    typeof params.subdomain === 'string' ? params.subdomain : 'school'
  const { details, setDetails, loading, saving, saveNow, error } =
    useTenantFeeLetterSettings(subdomain)

  const accounts = details.paymentModes.bankAccounts

  const updateAccount = (
    index: number,
    field: 'bankName' | 'branch' | 'accountNumber',
    value: string,
  ) => {
    const next = [...accounts]
    next[index] = { ...next[index], [field]: value }
    setDetails({
      ...details,
      paymentModes: { ...details.paymentModes, bankAccounts: next },
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
    try {
      await saveNow(details)
      toast({
        title: 'Bank details saved',
        description: 'Shown on fee letters and parent payment instructions.',
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
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Bank accounts</h2>
        <p className="mt-1 text-sm text-slate-600">
          Printed on fee letters for bank deposit / transfer. This is not M-Pesa
          Express — keep till/paybill in the section above.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="space-y-4">
        {accounts.length === 0 ? (
          <p className="text-sm text-slate-500">No bank accounts yet.</p>
        ) : null}
        {accounts.map((bank, index) => (
          <div
            key={index}
            className="space-y-3 rounded-lg border border-slate-200 bg-white p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Account {index + 1}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-red-600"
                onClick={() => removeAccount(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Bank name</Label>
              <Input
                value={bank.bankName}
                onChange={(e) => updateAccount(index, 'bankName', e.target.value)}
                placeholder="e.g. Equity Bank"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Branch</Label>
                <Input
                  value={bank.branch}
                  onChange={(e) => updateAccount(index, 'branch', e.target.value)}
                  placeholder="e.g. Mirema"
                />
              </div>
              <div className="space-y-2">
                <Label>Account number</Label>
                <Input
                  value={bank.accountNumber}
                  onChange={(e) =>
                    updateAccount(index, 'accountNumber', e.target.value)
                  }
                  placeholder="Account no."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={addAccount}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add bank account
        </Button>
        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save bank details'
          )}
        </Button>
      </div>
    </div>
  )
}
