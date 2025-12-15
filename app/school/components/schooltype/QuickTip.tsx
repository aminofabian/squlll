'use client'

import React from 'react'
import { Lightbulb } from 'lucide-react'

interface QuickTipProps {
  currentStep: number
}

export const QuickTip: React.FC<QuickTipProps> = ({ currentStep }) => {
  return (
    <div className="fixed right-3 bottom-16 max-w-[240px] z-10">
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-md shadow-md p-2">
        <div className="flex items-start gap-1.5">
          <div className="p-1 bg-[#246a59]/10 rounded flex-shrink-0">
            <Lightbulb className="w-3 h-3 text-[#246a59]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[10px] font-semibold text-gray-900 mb-0.5">Quick Tip</h4>
            <p className="text-[9px] text-gray-600 leading-tight">
              {currentStep === 1 ? 'Select a school type that best matches your curriculum needs.' : 
               currentStep === 2 ? 'Click on levels to select which grades your school will offer.' : 
               'Add your teaching staff details in the next step.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
