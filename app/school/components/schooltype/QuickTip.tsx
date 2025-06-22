'use client'

import React from 'react'
import { Lightbulb } from 'lucide-react'

interface QuickTipProps {
  currentStep: number
}

export const QuickTip: React.FC<QuickTipProps> = ({ currentStep }) => {
  return (
    <div className="fixed right-6 bottom-24 max-w-xs">
      <div className="bg-white border border-[#246a59]/20 rounded-lg shadow-lg p-4 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-[#246a59]/10 rounded-full">
            <Lightbulb className="w-5 h-5 text-[#246a59]" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Quick Tip</h4>
            <p className="text-sm text-gray-600 mt-1">
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
