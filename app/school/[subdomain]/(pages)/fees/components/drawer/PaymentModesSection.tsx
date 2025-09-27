'use client'

import React from 'react'

interface PaymentModesSectionProps {
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
}

export const PaymentModesSection: React.FC<PaymentModesSectionProps> = ({
  formData,
  setFormData
}) => {
  return (
    <div className="mb-8 px-6">
      <h3 className="text-center font-bold underline mb-4">PAYMENT MODES</h3>
      <div className="space-y-4">
        <div className="bg-primary/5 p-4 border border-primary/20">
          <h4 className="font-bold mb-2 text-slate-700">Bank Details:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Bank Name:</label>
              <input
                className="w-full bg-transparent border-0 border-b border-primary/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 px-1"
                value={formData.paymentModes?.bankAccounts?.[0]?.bankName || ''}
                onChange={(e) => setFormData((prev: any) => ({
                  ...prev,
                  paymentModes: {
                    ...prev.paymentModes!,
                    bankAccounts: [{
                      ...prev.paymentModes?.bankAccounts?.[0]!,
                      bankName: e.target.value
                    }]
                  }
                }))}
                placeholder="Enter bank name"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Account Number:</label>
              <input
                className="w-full bg-transparent border-0 border-b border-primary/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 px-1"
                value={formData.paymentModes?.bankAccounts?.[0]?.accountNumber || ''}
                onChange={(e) => setFormData((prev: any) => ({
                  ...prev,
                  paymentModes: {
                    ...prev.paymentModes!,
                    bankAccounts: [{
                      ...prev.paymentModes?.bankAccounts?.[0]!,
                      accountNumber: e.target.value
                    }]
                  }
                }))}
                placeholder="Enter account number"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Account Holder:</label>
              <input
                className="w-full bg-transparent border-0 border-b border-primary/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 px-1"
                value={formData.schoolDetails?.name || ''}
                onChange={(e) => setFormData((prev: any) => ({
                  ...prev,
                  schoolDetails: { ...prev.schoolDetails!, name: e.target.value }
                }))}
                placeholder="Account holder name"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Branch:</label>
              <input
                className="w-full bg-transparent border-0 border-b border-primary/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 px-1"
                value={formData.paymentModes?.bankAccounts?.[0]?.branch || ''}
                onChange={(e) => setFormData((prev: any) => ({
                  ...prev,
                  paymentModes: {
                    ...prev.paymentModes!,
                    bankAccounts: [{
                      ...prev.paymentModes?.bankAccounts?.[0]!,
                      branch: e.target.value
                    }]
                  }
                }))}
                placeholder="Enter branch"
              />
            </div>
          </div>
        </div>

        <div className="bg-primary/5 p-4 border border-primary/20">
          <h4 className="font-bold mb-2 text-slate-700">Additional Settings:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Student Type:</label>
              <select
                className="w-full bg-transparent border-0 border-b border-primary/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 px-1"
                value={formData.boardingType}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, boardingType: e.target.value as any }))}
              >
                <option value="day">Day Students Only</option>
                <option value="boarding">Boarding Students Only</option>
                <option value="both">Both Day & Boarding</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Structure Name:</label>
              <input
                className="w-full bg-transparent border-0 border-b border-primary/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 px-1"
                value={formData.name}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Primary School Fee Structure 2024"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
