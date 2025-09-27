'use client'

import React from 'react'
import { X, GraduationCap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeeStructureDrawerHeaderProps {
  mode: 'create' | 'edit'
  onClose: () => void
  academicYearsLoading: boolean
  academicYearsLength: number
}

export const FeeStructureDrawerHeader: React.FC<FeeStructureDrawerHeaderProps> = ({
  mode,
  onClose,
  academicYearsLoading,
  academicYearsLength
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <div className="flex items-center gap-3 mb-3 md:mb-0">
        <div className="p-2 bg-primary/10 border border-primary/20 shadow-sm">
          <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create Fee Structure' : 'Edit Fee Structure'}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-xs md:text-sm text-slate-600">
              Set up fees by term and assign to multiple grades
            </p>
            {academicYearsLoading && (
              <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 border border-blue-200 ">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading academic years...</span>
              </div>
            )}
            {!academicYearsLoading && academicYearsLength > 0 && (
              <div className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-0.5 border border-green-200 ">
                <span>{academicYearsLength} academic years loaded</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-primary/10 h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
