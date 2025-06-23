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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#246a59]/10 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center p-4 gap-4">
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-center sm:justify-start">
          <div className="text-sm text-gray-500">
            {canProceed ? 
              <span className="flex items-center">
                <Check className="w-4 h-4 text-[#246a59] mr-2" />
                {getSelectedLevelsCount(selectedType)} levels selected
              </span> : 
              'Please select at least one level to continue'
            }
          </div>
        </div>
        <button
          onClick={handleContinue}
          disabled={!canProceed || isLoading}
          className={`w-full sm:w-auto px-8 py-3 relative overflow-hidden transition-all duration-300 rounded-md ${
            canProceed && !isLoading
              ? 'bg-[#246a59] hover:bg-[#246a59]/90 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="relative z-10 flex items-center justify-center">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Continue Setup</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </div>
          {canProceed && !isLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          )}
        </button>
      </div>
    </div>
  )
}
