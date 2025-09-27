'use client'

import React from 'react'
import { ChevronRight } from "lucide-react"

interface ValidationError {
  message: string
  anchorId?: string
}

interface TermComponent {
  amount?: string | number;
  // Add other properties as needed
}

interface Bucket {
  components?: TermComponent[];
  // Add other properties as needed
}

interface TermStructure {
  buckets: Bucket[];
  // Add other properties as needed
}

interface FeeFormData {
  name: string;
  academicYear: string;
  termStructures: TermStructure[];
  // Add other properties as needed
}

interface ValidationChecklistProps {
  validationErrors: ValidationError[]
  formData: FeeFormData
  selectedGrades: string[]
}

export const ValidationChecklist: React.FC<ValidationChecklistProps> = ({
  validationErrors,
  formData,
  selectedGrades
}) => {
  
  // These validation checks match the ones from the original component
  const checks = [
    {
      label: 'Basic Info',
      isValid: !!formData.name && !!formData.academicYear
    },
    {
      label: 'Grades Selected',
      isValid: selectedGrades.length > 0
    },
    {
      label: 'At least 1 Term',
      isValid: formData.termStructures.length > 0
    },
    {
      label: 'Buckets per Term',
      isValid: formData.termStructures.every((t: TermStructure) => (t.buckets?.length ?? 0) > 0)
    },
    {
      label: 'Components per Bucket',
      isValid: formData.termStructures.every((t: TermStructure) => t.buckets.every((b: Bucket) => (b.components?.length ?? 0) > 0))
    },
    {
      label: 'Amounts filled',
      isValid: formData.termStructures.every((t: TermStructure) => t.buckets.every((b: Bucket) => b.components?.every((c: TermComponent) => String(c.amount ?? '').trim() !== '')))
    }
  ]

  return (
    <div className="mt-4 sm:mt-5 bg-white shadow-sm border border-primary/20 p-2 sm:p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-700">Setup Progress</h3>
        {validationErrors.length > 0 && (
          <button
            className="text-[10px] sm:text-xs flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors bg-primary/5 hover:bg-primary/10 px-2 py-1"
            onClick={() => {
              const first = validationErrors[0]
              const el = first?.anchorId ? document.getElementById(first.anchorId) : null
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
          >
            <ChevronRight className="h-3 w-3" />
            Fix {validationErrors.length} issue{validationErrors.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-2">
        {checks.map((check, idx) => (
          <div 
            key={check.label} 
            className={`flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 transition-all ${check.isValid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
          >
            <div className={`w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center flex-shrink-0 ${check.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
              <span className={`w-2 h-2 sm:w-3 sm:h-3 ${check.isValid ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </div>
            <span className="text-[10px] xs:text-xs font-medium truncate">{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
