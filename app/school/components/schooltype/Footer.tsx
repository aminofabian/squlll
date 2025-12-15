'use client'

import React from 'react'
import { Check, ChevronRight } from 'lucide-react'

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
  selectedType
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/60 shadow-lg z-20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center px-3 py-2 gap-2">
        <div className="flex items-center w-full sm:w-auto justify-center sm:justify-start">
          <div className="text-[10px] text-gray-500">
            {canProceed ? 
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-[#246a59]" />
                <span className="font-semibold text-gray-700">{getSelectedLevelsCount(selectedType)} selected</span>
              </span> : 
              <span className="text-gray-400">Select at least one level</span>
            }
          </div>
        </div>
        <button
          onClick={handleContinue}
          disabled={!canProceed || isLoading}
          className={`w-full sm:w-auto px-5 py-1.5 relative overflow-hidden transition-all duration-150 rounded-md text-xs font-semibold cursor-pointer active:scale-95 ${
            canProceed && !isLoading
              ? 'bg-gradient-to-r from-[#246a59] to-[#1a4d42] hover:from-[#246a59]/90 hover:to-[#1a4d42]/90 text-white shadow-md hover:shadow-lg active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="relative z-10 flex items-center justify-center gap-1">
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}
