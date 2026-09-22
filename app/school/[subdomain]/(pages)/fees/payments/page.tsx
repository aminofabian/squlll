'use client'

import { CustodyMpesaSettingsPanel } from '../components/CustodyMpesaSettingsPanel'
import { SchoolBankAccountsPanel } from '../components/SchoolBankAccountsPanel'

export default function FeesPaymentsSettingsPage() {
  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 py-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Fees · Payments
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          How parents pay
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Set your M-Pesa till / paybill for Express STK, and bank accounts for
          fee letters.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <CustodyMpesaSettingsPanel />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <SchoolBankAccountsPanel />
      </section>
    </div>
  )
}
