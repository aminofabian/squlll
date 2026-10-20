'use client'

import React from 'react'
import { Lightbulb } from 'lucide-react'

interface QuickTipProps {
  currentStep: number
}

export const QuickTip: React.FC<QuickTipProps> = ({ currentStep }) => {
  return (
    <div className="mt-12 flex items-start gap-3 border-t border-[#14201b]/10 pt-5">
      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a98a55]" strokeWidth={1.5} />
      <p className="max-w-[76ch] text-[0.6875rem] leading-relaxed text-[#7c857d]">
        {currentStep === 1
          ? 'Choose the curriculum your school runs, then select the grade levels you offer. Year, terms, and class streams come next.'
          : 'Continue to configure your academic year, terms, and class streams.'}
      </p>
    </div>
  )
}
