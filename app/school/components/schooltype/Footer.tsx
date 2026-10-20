'use client'

import React from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'

interface FooterProps {
  canProceed: boolean
  isLoading: boolean
  handleContinue: () => void
  getSelectedLevelsCount: (typeId: string) => number
  selectedType: string
}

export const Footer: React.FC<FooterProps> = ({
  canProceed,
  isLoading,
  handleContinue,
  getSelectedLevelsCount,
  selectedType,
}) => {
  const count = getSelectedLevelsCount(selectedType)

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#14201b]/10 bg-[#f7f4ec]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[84rem] items-center justify-between gap-4 px-6 py-3.5 lg:px-10">
        <p className="hidden text-[0.5625rem] uppercase tracking-[0.16em] text-[#7c857d] sm:block">
          {canProceed
            ? `${count} ${count === 1 ? 'level' : 'levels'} selected`
            : 'Select at least one level'}
        </p>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canProceed || isLoading}
          className="ml-auto inline-flex h-11 min-w-[12rem] items-center justify-center gap-2 rounded-[2px] bg-[#14201b] px-5 text-[0.8125rem] font-medium text-[#f7f4ec] transition-colors duration-200 hover:bg-[#1c3d32] disabled:cursor-not-allowed disabled:bg-[#14201b]/20 disabled:text-[#14201b]/40"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              Continue to calendar
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
