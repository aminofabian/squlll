'use client'

import { CustodyMpesaSettingsPanel } from '../components/CustodyMpesaSettingsPanel'

export default function FeesPaymentsSettingsPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Fees · Payments
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          M-Pesa till / paybill
        </h1>
      </div>
      <CustodyMpesaSettingsPanel />
    </div>
  )
}
