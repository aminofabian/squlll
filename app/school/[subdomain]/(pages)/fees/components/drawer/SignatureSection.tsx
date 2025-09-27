'use client'

import React from 'react'

interface SignatureSectionProps {
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
}

export const SignatureSection: React.FC<SignatureSectionProps> = ({
  formData,
  setFormData
}) => {
  return (
    <div className="mb-8 px-6">
      <div className="flex justify-between items-end">
        <div>
          <p className="mb-8">Yours faithfully,</p>
          <div className="border-b border-black w-48 mb-2"></div>
          <p className="text-sm">
            <input
              className="bg-transparent border-0 focus:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-primary/30 px-1"
              value={formData.schoolDetails?.principalName || ''}
              onChange={(e) => setFormData((prev: any) => ({
                ...prev,
                schoolDetails: { ...prev.schoolDetails!, principalName: e.target.value }
              }))}
              placeholder="Principal Name"
            />
            <br />
            PRINCIPAL
          </p>
        </div>
        <div className="text-right">
          <div className="w-24 h-24 border border-primary/30 flex items-center justify-center text-xs text-slate-500 mb-2">
            SCHOOL<br />STAMP
          </div>
        </div>
      </div>
    </div>
  )
}
