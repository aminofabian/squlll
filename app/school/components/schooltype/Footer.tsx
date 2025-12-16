'use client'

import React, { useState, useEffect } from 'react'
import { Check, ChevronRight, ArrowUp } from 'lucide-react'

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
  const [showHint, setShowHint] = useState(false)
  const [hintDismissed, setHintDismissed] = useState(false)

  useEffect(() => {
    if (canProceed && !hintDismissed) {
      setShowHint(true)
      const timer = setTimeout(() => {
        setShowHint(false)
        setHintDismissed(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [canProceed, hintDismissed])

  const shouldShowArrow = showHint && canProceed && !isLoading

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/60 shadow-lg z-20">
      <div className="w-full max-w-[1920px] mx-auto flex flex-col sm:flex-row justify-between items-center px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32 2xl:px-40 py-3 sm:py-4 gap-2 sm:gap-3 relative">
        {/* Animated Arrow Hint */}
        {shouldShowArrow && (
          <div className="absolute -top-8 left-1/2 sm:left-auto sm:right-4 -translate-x-1/2 sm:translate-x-0 z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-1 animate-slide-bounce-vertical">
              <ArrowUp className="w-4 h-4 text-[#246a59] animate-pulse drop-shadow-sm" />
              <span className="text-[9px] font-semibold text-[#246a59] whitespace-nowrap bg-white/95 px-2 py-1 rounded border border-[#246a59]/20 shadow-sm">Click to continue</span>
            </div>
          </div>
        )}
        <div className="flex items-center w-full sm:w-auto justify-center sm:justify-start">
          <div className="text-[10px] text-gray-500">
            {canProceed ? 
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-[#246a59]" />
                <span className="font-semibold text-gray-700">{getSelectedLevelsCount(selectedType)} SELECTED</span>
              </span> : 
              <span className="text-gray-400">SELECT AT LEAST ONE LEVEL</span>
            }
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleContinue()
            setShowHint(false)
            setHintDismissed(true)
          }}
          onMouseDown={(e) => e.preventDefault()}
          disabled={!canProceed || isLoading}
          className={`w-full sm:w-auto px-6 py-2.5 relative overflow-visible transition-all duration-150 rounded-md text-sm font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#246a59]/50 focus:ring-offset-1 z-0 ${
            canProceed && !isLoading
              ? `bg-gradient-to-r from-[#246a59] to-[#1a4d42] hover:from-[#246a59]/90 hover:to-[#1a4d42]/90 text-white shadow-md hover:shadow-lg hover:ring-2 hover:ring-[#246a59]/30 active:from-[#246a59]/95 active:to-[#1a4d42]/95 ${shouldShowArrow ? 'animate-pulse ring-2 ring-[#246a59]/40' : ''}`
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="relative z-10 flex items-center justify-center gap-1.5">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </div>
          {canProceed && !isLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          )}
        </button>
      </div>
    </div>
  )
}
